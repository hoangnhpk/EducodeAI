using educodeai_server.Data;
using educodeai_server.DTOs.XacThuc;
using educodeai_server.DTOs.NguoiDung;
using EduCodeAI.DTOs;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace educodeai_server.Services.Implementation
{
    public class XacThucService : IXacThucService
    {
        private readonly EduCodeAIDbContext _context;
        private readonly IConfiguration _config;
        private readonly ICaptchaService _captchaService;
        private readonly IMemoryCache _memoryCache;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public XacThucService(EduCodeAIDbContext context, IConfiguration config, ICaptchaService captchaService, IMemoryCache memoryCache, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _config = config;
            _captchaService = captchaService;
            _memoryCache = memoryCache;
            _httpContextAccessor = httpContextAccessor;
        }

        #region OTP COOKIE LOGIC

        private void LuuOtpVaoCookie(string identifier, string otp)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, 
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddMinutes(5)
            };
            string hashedOtp = BCrypt.Net.BCrypt.HashPassword(otp + identifier);
            _httpContextAccessor.HttpContext.Response.Cookies.Append("Auth_OTP_Hash", hashedOtp, cookieOptions);
            _httpContextAccessor.HttpContext.Response.Cookies.Append("Auth_OTP_Identifier", identifier, cookieOptions);
        }

        private bool XacThucOtpTuCookie(string identifier, string otpInput)
        {
            if (string.IsNullOrEmpty(otpInput)) return false;
            var cookies = _httpContextAccessor.HttpContext.Request.Cookies;
            string hashedOtp = cookies["Auth_OTP_Hash"];
            string cookieIdentifier = cookies["Auth_OTP_Identifier"];

            if (string.IsNullOrEmpty(hashedOtp) || string.IsNullOrEmpty(cookieIdentifier) || cookieIdentifier != identifier)
                return false;

            try {
                return BCrypt.Net.BCrypt.Verify(otpInput + identifier, hashedOtp);
            } catch { return false; }
        }

        private void XoaOtpCookie()
        {
            var cookieOptions = new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.None };
            _httpContextAccessor.HttpContext.Response.Cookies.Delete("Auth_OTP_Hash", cookieOptions);
            _httpContextAccessor.HttpContext.Response.Cookies.Delete("Auth_OTP_Identifier", cookieOptions);
        }

        #endregion

        #region 1. LUỒNG ĐĂNG NHẬP

        public async Task<object> DangNhapAsync(DangNhapRequest request, string ipAddress)
        {
            KiemTraChanSpam(request.TaiKhoan, ipAddress);
            
            // Lấy số lần sai hiện tại
            int ipFailCount = LaySoLanSaiMatKhau("IP_" + ipAddress);
            int accFailCount = LaySoLanSaiMatKhau("Acc_" + request.TaiKhoan);
            int currentMaxFail = Math.Max(ipFailCount, accFailCount);

            // 1. Nếu đã đạt ngưỡng sai >= 3, bắt buộc phải có Captcha hợp lệ mới cho đi tiếp
            if (currentMaxFail >= 3)
            {
                if (string.IsNullOrEmpty(request.CaptchaToken) || request.CaptchaToken == "SKIP_CAPTCHA")
                {
                    return new { requiresCaptcha = true, message = "Bạn đã nhập sai quá nhiều lần. Vui lòng xác minh người máy." };
                }
                await ValidateCaptchaAsync(request.CaptchaToken);
            }

            // 2. Thực hiện kiểm tra thông tin đăng nhập
            var user = await LayNguoiDungKemThietBiAsync(request.TaiKhoan);
            bool isPasswordValid = user != null && user.TrangThai == "Hoạt động" && BCrypt.Net.BCrypt.Verify(request.MatKhau, user.MatKhau);

            if (!isPasswordValid)
            {
                // Tăng số lần sai
                TangSoLanSaiMatKhau("IP_" + ipAddress);
                int newAccFailCount = TangSoLanSaiMatKhau("Acc_" + request.TaiKhoan);
                int newMaxFail = Math.Max(LaySoLanSaiMatKhau("IP_" + ipAddress), newAccFailCount);

                // Nếu sau khi tăng mà đạt >= 3, trả về yêu cầu Captcha ngay lập tức (thay vì bắn Exception 400)
                if (newMaxFail >= 3)
                {
                    return new { requiresCaptcha = true, message = "Tài khoản hoặc mật khẩu không chính xác. Vui lòng xác minh người máy." };
                }

                throw new Exception("Tài khoản hoặc mật khẩu không chính xác.");
            }

            // 3. Đăng nhập thành công -> Reset lỗi
            ResetSoLanSaiMatKhau("IP_" + ipAddress);
            ResetSoLanSaiMatKhau("Acc_" + request.TaiKhoan);
            KiemTraGioiHanThietBi(user!, request.MaThietBi);

            if (LaThietBiMoiHoacQuaHan(user, request.MaThietBi, 3))
            {
                await TaoVaGuiOtpAsync(user, "Mã OTP Đăng nhập", "Bạn đang đăng nhập trên thiết bị mới.");
                return new { requiresOtp = true, message = "Vui lòng nhập mã OTP đã được gửi về Email." };
            }

            return await XuLyDangNhapThanhCongAsync(user, request.MaThietBi, request.TenThietBi);
        }

        public async Task<object> DangNhapGoogleAsync(GoogleLoginRequest request, string maThietBi, string tenThietBi)
        {
            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                user = new NguoiDungModel { Email = request.Email, HoTen = request.Name, AnhDaiDien = request.Picture, TaiKhoan = request.Email, MatKhau = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), VaiTro = 2, TrangThai = "Hoạt động", NgayThamGia = DateTime.UtcNow, DanhSachPhienDangNhap = new List<PhienDangNhapModel>() };
                _context.NguoiDungs.Add(user);
                await _context.SaveChangesAsync();
            }
            return await XuLyDangNhapThanhCongAsync(user, maThietBi, tenThietBi);
        }

        public async Task<object> DangNhapFacebookAsync(FacebookDTO request, string maThietBi, string tenThietBi)
        {
            if (string.IsNullOrEmpty(request.Email)) throw new Exception("Không lấy được Email từ Facebook.");
            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                string fbId = !string.IsNullOrEmpty(request.UserID) ? request.UserID : Guid.NewGuid().ToString("N").Substring(0, 10);
                user = new NguoiDungModel { Email = request.Email, HoTen = !string.IsNullOrEmpty(request.Name) ? request.Name : "Người dùng Facebook", AnhDaiDien = request.Picture ?? "", TaiKhoan = "fb_" + fbId.Substring(0, Math.Min(fbId.Length, 10)), MatKhau = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), VaiTro = 2, TrangThai = "Hoạt động", NgayThamGia = DateTime.UtcNow, DanhSachPhienDangNhap = new List<PhienDangNhapModel>() };
                _context.NguoiDungs.Add(user);
                await _context.SaveChangesAsync();
            }
            return await XuLyDangNhapThanhCongAsync(user, maThietBi, tenThietBi);
        }

        public async Task<object> LamMoiTokenAsync(string refreshToken, string maThietBi)
        {
            if (!_memoryCache.TryGetValue("RefreshToken_" + refreshToken, out (int MaNguoiDung, string MaThietBi) data)) throw new Exception("Hết hạn.");
            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.MaNguoiDung == data.MaNguoiDung);
            if (user == null) throw new Exception("Không tồn tại.");

            // KIỂM TRA: Nếu phiên của thiết bị này đã bị vô hiệu hóa (DangHoatDong = false), 
            // thì KHÔNG cho phép refresh token nữa.
            var phien = user.DanhSachPhienDangNhap.FirstOrDefault(p => p.MaThietBi == maThietBi);
            if (phien == null || !phien.DangHoatDong)
            {
                _memoryCache.Remove("RefreshToken_" + refreshToken);
                throw new Exception("Phiên làm việc đã bị vô hiệu hóa từ xa. Vui lòng đăng nhập lại.");
            }

            return await XuLyDangNhapThanhCongAsync(user, maThietBi, "Thiết bị hiện tại");
        }

        public async Task<object> XacNhanOtpVaDangNhapAsync(XacNhanOtpRequest request)
        {
            var user = await LayNguoiDungKemThietBiAsync(request.TaiKhoan);
            if (user == null) throw new Exception("Không tồn tại.");
            if (!XacThucOtpTuCookie(user.Email, request.OtpCode)) throw new Exception("OTP sai.");
            return await XuLyDangNhapThanhCongAsync(user, request.MaThietBi, request.TenThietBi);
        }

        #endregion

        #region 2. LUỒNG ĐĂNG KÝ

        public async Task<bool> YeuCauDangKyAsync(DangKyRequest request, string ipAddress)
        {
            await ValidateCaptchaAsync(request.CaptchaToken);
            if (await _context.NguoiDungs.AnyAsync(u => u.Email == request.Email)) throw new Exception("Đã tồn tại.");
            string otp = new Random().Next(100000, 999999).ToString();
            _memoryCache.Set("Reg_" + request.Email, request, TimeSpan.FromMinutes(5));
            LuuOtpVaoCookie(request.Email, otp);
            await EmailHelper.SendEmailAsync(request.Email, "Xác minh đăng ký - EduCodeAI", GetEmailTemplate("Xác minh đăng ký", $"Chào mừng bạn đến với EduCodeAI! Mã xác nhận của bạn là:", otp));
            return true;
        }

        public async Task<object> XacNhanDangKyVaLuuDbAsync(XacNhanOtpRequest request)
        {
            if (!_memoryCache.TryGetValue("Reg_" + request.TaiKhoan, out DangKyRequest reg)) throw new Exception("Hết hạn.");
            if (!XacThucOtpTuCookie(request.TaiKhoan, request.OtpCode)) throw new Exception("OTP sai.");
            var newUser = new NguoiDungModel { TaiKhoan = reg.Email, Email = reg.Email, HoTen = reg.HoTen, MatKhau = BCrypt.Net.BCrypt.HashPassword(reg.MatKhau), VaiTro = 2, TrangThai = "Hoạt động", NgayThamGia = DateTime.UtcNow, DanhSachPhienDangNhap = new List<PhienDangNhapModel>() };
            _context.NguoiDungs.Add(newUser);
            await _context.SaveChangesAsync();
            _memoryCache.Remove("Reg_" + request.TaiKhoan);
            return await XuLyDangNhapThanhCongAsync(newUser, request.MaThietBi, request.TenThietBi);
        }

        #endregion

        #region 3. LUỒNG QUẢN LÝ THIẾT BỊ

        public async Task<object> LayDanhSachThietBiAsync(int maNguoiDung, string maThietBiHienTai)
        {
            return await _context.PhienDangNhaps.Where(p => p.MaNguoiDung == maNguoiDung && p.DangHoatDong).Select(p => new { p.MaPhien, p.TenThietBi, p.ThoiGianHoatDongCuoi, IsCurrentDevice = p.MaThietBi == maThietBiHienTai }).ToListAsync();
        }

        public async Task<bool> DangXuatAsync(int maNguoiDung, string maThietBi)
        {
            var p = await _context.PhienDangNhaps.FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiDung && x.MaThietBi == maThietBi && x.DangHoatDong);
            if (p != null) { p.DangHoatDong = false; await _context.SaveChangesAsync(); }
            return true;
        }

        public async Task<bool> YeuCauOtpDangXuatTuXaAsync(int maNguoiDung)
        {
            var user = await _context.NguoiDungs.FindAsync(maNguoiDung);
            if (user == null) return false;
            
            string otp = new Random().Next(100000, 999999).ToString();
            // Lưu OTP vào Cache cho việc Đăng xuất từ xa
            _memoryCache.Set($"LogoutOTP_{maNguoiDung}", otp, TimeSpan.FromMinutes(10));
            
            await EmailHelper.SendEmailAsync(user.Email, "Xác nhận đăng xuất từ xa - EduCodeAI", GetEmailTemplate("Xác nhận đăng xuất", "Bạn đang yêu cầu đăng xuất các thiết bị từ xa. Mã OTP xác nhận là:", otp));
            return true;
        }

        public async Task<bool> XacNhanDangXuatTuXaAsync(int maNguoiDung, DangXuatTuXaRequest request)
        {
            // Truy vấn trực tiếp từ Context để đảm bảo Tracking hoạt động tốt nhất
            var query = _context.PhienDangNhaps.Where(p => p.MaNguoiDung == maNguoiDung && p.DangHoatDong);

            if (request.DangXuatTatCa)
            {
                var phienTatCa = await query.ToListAsync();
                foreach (var p in phienTatCa) p.DangHoatDong = false;
            }
            else if (request.DanhSachMaPhien != null && request.DanhSachMaPhien.Any())
            {
                var phienChiDinh = await query.Where(p => request.DanhSachMaPhien.Contains(p.MaPhien)).ToListAsync();
                foreach (var p in phienChiDinh) p.DangHoatDong = false;
            }
            
            await _context.SaveChangesAsync();
            
            // Xóa OTP trong cache sau khi dùng xong
            _memoryCache.Remove($"LogoutOTP_{maNguoiDung}");
            return true;
        }

        #endregion

        #region 4. QUÊN MẬT KHẨU

        public async Task<object> YeuCauQuenMatKhauAsync(QuenMatKhauRequest request, string ipAddress)
        {
            var user = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.Email == request.Email || u.TaiKhoan == request.Email);
            if (user == null) throw new Exception("Không tồn tại tài khoản với Email này.");
            
            string otp = new Random().Next(100000, 999999).ToString();
            
            // Lưu OTP vào Cache thay vì Cookie để ổn định hơn
            _memoryCache.Set("ForgotPassOTP_" + user.Email, otp, TimeSpan.FromMinutes(10));
            
            await EmailHelper.SendEmailAsync(user.Email, "Khôi phục mật khẩu - EduCodeAI", GetEmailTemplate("Khôi phục mật khẩu", "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Mã OTP của bạn là:", otp));
            return new { message = "Đã gửi mã OTP về Email của bạn." };
        }

        public async Task<object> DatLaiMatKhauAsync(DatLaiMatKhauRequest request)
        {
            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.Email == request.Email || u.TaiKhoan == request.Email);
            if (user == null) throw new Exception("Tài khoản không tồn tại.");

            // Kiểm tra OTP từ Cache
            if (!_memoryCache.TryGetValue("ForgotPassOTP_" + user.Email, out string? cachedOtp) || cachedOtp != request.OtpCode)
            {
                throw new Exception("Mã OTP không chính xác hoặc đã hết hạn.");
            }
            
            string newPass = request.NewPassword ?? request.MatKhauMoiField ?? "";
            if (string.IsNullOrEmpty(newPass)) throw new Exception("Mật khẩu mới không được để trống.");

            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(newPass);

            // 1. Đăng xuất và vô hiệu hóa HOÀN TOÀN tất cả các phiên cũ
            var phienCu = user.DanhSachPhienDangNhap.Where(p => p.DangHoatDong);
            foreach (var p in phienCu) p.DangHoatDong = false;

            await _context.SaveChangesAsync();
            _memoryCache.Remove("ForgotPassOTP_" + user.Email);
            
            // 2. Tạo một phiên đăng nhập mới hoàn toàn cho thiết bị hiện tại
            // Ghi đè maThietBi để đảm bảo tính duy nhất
            return await XuLyDangNhapThanhCongAsync(user, request.MaThietBi, request.TenThietBi);
        }

        #endregion

        #region HELPERS

        private string GetEmailTemplate(string actionName, string message, string otp)
        {
            return $@"
            <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;"">
                <div style=""background-color: #fb873f; padding: 20px; text-align: center;"">
                    <h1 style=""color: white; margin: 0; font-size: 24px;"">EDUCODEAI</h1>
                </div>
                <div style=""padding: 30px; color: #333; line-height: 1.6;"">
                    <h2 style=""color: #fb873f; margin-top: 0;"">{actionName}</h2>
                    <p>{message}</p>
                    <div style=""background-color: #fff5eb; border: 2px dashed #fb873f; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;"">
                        <span style=""font-size: 32px; font-weight: bold; color: #fb873f; letter-spacing: 5px;"">{otp}</span>
                    </div>
                    <p style=""font-size: 14px; color: #666;"">Mã này có hiệu lực trong vòng 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                    <hr style=""border: 0; border-top: 1px solid #eee; margin: 25px 0;"">
                    <p style=""font-size: 12px; color: #999; text-align: center;"">
                        Đây là email tự động, vui lòng không phản hồi.<br>
                        © 2026 EduCodeAI - Hệ thống đào tạo lập trình thông minh.
                    </p>
                </div>
            </div>";
        }

        private async Task ValidateCaptchaAsync(string? token) { if (token == "SKIP_CAPTCHA" || string.IsNullOrEmpty(token)) return; if (!await _captchaService.XacNhanCaptchaAsync(token)) throw new Exception("Captcha thất bại."); }
        private async Task<NguoiDungModel?> LayNguoiDungKemThietBiAsync(string t) => await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.TaiKhoan == t || u.Email == t);
        private void KiemTraGioiHanThietBi(NguoiDungModel u, string d) { if (u.DanhSachPhienDangNhap.Count(p => p.DangHoatDong) >= 3 && !u.DanhSachPhienDangNhap.Any(p => p.MaThietBi == d && p.DangHoatDong)) throw new Exception("Đã đạt giới hạn 3 thiết bị."); }
        private bool LaThietBiMoiHoacQuaHan(NguoiDungModel u, string d, int days) { var p = u.DanhSachPhienDangNhap.FirstOrDefault(x => x.MaThietBi == d); return p == null || (DateTime.UtcNow - p.ThoiGianHoatDongCuoi).TotalDays > days || !p.DangHoatDong; }
        private async Task TaoVaGuiOtpAsync(NguoiDungModel u, string s, string p) { 
            string otp = new Random().Next(100000, 999999).ToString(); 
            LuuOtpVaoCookie(u.Email, otp); 
            await EmailHelper.SendEmailAsync(u.Email, $"{s} - EduCodeAI", GetEmailTemplate(s, p, otp)); 
        }
        
        private async Task<object> XuLyDangNhapThanhCongAsync(NguoiDungModel u, string? d, string? t) { 
            string devId = string.IsNullOrEmpty(d) ? "DEV_" + Guid.NewGuid().ToString("N").Substring(0, 8) : d;
            var phien = u.DanhSachPhienDangNhap.FirstOrDefault(p => p.MaThietBi == devId);
            if (phien == null) { phien = new PhienDangNhapModel { MaNguoiDung = u.MaNguoiDung, MaThietBi = devId, TenThietBi = t ?? "Thiết bị mới", ThoiGianDangNhap = DateTime.UtcNow }; _context.PhienDangNhaps.Add(phien); }
            phien.ThoiGianHoatDongCuoi = DateTime.UtcNow; phien.DangHoatDong = true;
            u.NgayDangNhapCuoi = DateTime.UtcNow; await _context.SaveChangesAsync();
            string rt = Guid.NewGuid().ToString(); _memoryCache.Set("RefreshToken_" + rt, (MaNguoiDung: u.MaNguoiDung, MaThietBi: devId), TimeSpan.FromDays(7));
            return new { token = TaoJwtToken(u, phien.MaPhien), refreshToken = rt, user = new { maNguoiDung = u.MaNguoiDung, id = u.MaNguoiDung, taiKhoan = u.TaiKhoan, hoTen = u.HoTen, email = u.Email, vaiTro = u.VaiTro } };
        }

        private string TaoJwtToken(NguoiDungModel u, int m) { 
            var claims = new[] { 
                new Claim(ClaimTypes.NameIdentifier, u.MaNguoiDung.ToString()), 
                new Claim("id", u.MaNguoiDung.ToString()), 
                new Claim("MaNguoiDung", u.MaNguoiDung.ToString()), 
                new Claim(JwtRegisteredClaimNames.Email, u.Email ?? ""), 
                new Claim("MaPhien", m.ToString()), 
                new Claim(ClaimTypes.Role, u.VaiTro == 0 ? "Admin" : (u.VaiTro == 1 ? "GiangVien" : "HocVien")) 
            };
            var token = new JwtSecurityToken(_config["Jwt:Issuer"], _config["Jwt:Audience"], claims, expires: DateTime.UtcNow.AddHours(2), signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"])), SecurityAlgorithms.HmacSha256));
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // VÔ HIỆU HÓA HOÀN TOÀN VIỆC CHẶN
        private void KiemTraChanSpam(string i, string ip) { return; }
        private int TangSoLanSaiMatKhau(string i) { 
            int c = LaySoLanSaiMatKhau(i) + 1; 
            _memoryCache.Set("FailPass_" + i, c, TimeSpan.FromHours(1)); 
            return c;
        }
        private void ResetSoLanSaiMatKhau(string i) { 
            _memoryCache.Remove("FailPass_" + i); 
            _memoryCache.Remove("Blocked_" + i); 
        }
        private int LaySoLanSaiMatKhau(string i) { _memoryCache.TryGetValue("FailPass_" + i, out int c); return c; }

        #endregion

        #region 5. ĐỔI MẬT KHẨU

        public async Task<bool> DoiMatKhauAsync(int maNguoiDung, DoiMatKhauRequest request) { 
            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.MaNguoiDung == maNguoiDung);
            if (user == null) throw new Exception("Tài khoản không tồn tại.");

            if (string.IsNullOrEmpty(request.MatKhauCu) || string.IsNullOrEmpty(request.MatKhauMoi))
                throw new Exception("Mật khẩu cũ và mật khẩu mới không được để trống.");

            // 1. Xác thực mật khẩu cũ
            if (!BCrypt.Net.BCrypt.Verify(request.MatKhauCu, user.MatKhau))
                throw new Exception("Mật khẩu cũ không chính xác.");

            // 2. Kiểm tra mật khẩu mới không trùng mật khẩu cũ
            if (BCrypt.Net.BCrypt.Verify(request.MatKhauMoi, user.MatKhau))
                throw new Exception("Mật khẩu mới không được giống với mật khẩu cũ.");

            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(request.MatKhauMoi);
            
            // Khi đổi mật khẩu, hủy hết các phiên khác
            var phienCu = user.DanhSachPhienDangNhap.Where(p => p.DangHoatDong);
            foreach (var p in phienCu) p.DangHoatDong = false;

            await _context.SaveChangesAsync();
            return true;
        }

        #endregion
    }
}
