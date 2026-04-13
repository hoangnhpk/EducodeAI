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
            var user = await LayNguoiDungKemThietBiAsync(request.TaiKhoan);
            if (user == null || user.TrangThai != "Hoạt động") throw new Exception("Tài khoản không tồn tại hoặc bị khóa.");

            int failCount = LaySoLanSaiMatKhau(request.TaiKhoan);
            
            if (failCount >= 3 && (string.IsNullOrEmpty(request.CaptchaToken) || request.CaptchaToken == "SKIP_CAPTCHA"))
                return new { requiresCaptcha = true, message = "Vui lòng xác minh người máy." };

            if (!BCrypt.Net.BCrypt.Verify(request.MatKhau, user.MatKhau))
            {
                TangSoLanSaiMatKhau(request.TaiKhoan);
                throw new Exception("Tài khoản hoặc mật khẩu không chính xác.");
            }

            if (failCount >= 3) await ValidateCaptchaAsync(request.CaptchaToken);

            ResetSoLanSaiMatKhau(request.TaiKhoan);
            KiemTraGioiHanThietBi(user, request.MaThietBi);

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
            await EmailHelper.SendEmailAsync(request.Email, "Xác minh", $"Mã: {otp}");
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
            
            await EmailHelper.SendEmailAsync(user.Email, "Xác nhận đăng xuất từ xa", $"Mã OTP xác nhận đăng xuất thiết bị của bạn là: {otp}");
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
            
            await EmailHelper.SendEmailAsync(user.Email, "Quên mật khẩu", $"Mã OTP đặt lại mật khẩu của bạn là: {otp}");
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

        private async Task ValidateCaptchaAsync(string? token) { if (token == "SKIP_CAPTCHA" || string.IsNullOrEmpty(token)) return; if (!await _captchaService.XacNhanCaptchaAsync(token)) throw new Exception("Captcha thất bại."); }
        private async Task<NguoiDungModel?> LayNguoiDungKemThietBiAsync(string t) => await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.TaiKhoan == t || u.Email == t);
        private void KiemTraGioiHanThietBi(NguoiDungModel u, string d) { if (u.DanhSachPhienDangNhap.Count(p => p.DangHoatDong) >= 3 && !u.DanhSachPhienDangNhap.Any(p => p.MaThietBi == d && p.DangHoatDong)) throw new Exception("Đã đạt giới hạn 3 thiết bị."); }
        private bool LaThietBiMoiHoacQuaHan(NguoiDungModel u, string d, int days) { var p = u.DanhSachPhienDangNhap.FirstOrDefault(x => x.MaThietBi == d); return p == null || (DateTime.UtcNow - p.ThoiGianHoatDongCuoi).TotalDays > days || !p.DangHoatDong; }
        private async Task TaoVaGuiOtpAsync(NguoiDungModel u, string s, string p) { string otp = new Random().Next(100000, 999999).ToString(); LuuOtpVaoCookie(u.Email, otp); await EmailHelper.SendEmailAsync(u.Email, s, $"{p} Mã: {otp}"); }
        
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
        private void TangSoLanSaiMatKhau(string i) { 
            int c = LaySoLanSaiMatKhau(i) + 1; 
            _memoryCache.Set("FailPass_" + i, c, TimeSpan.FromHours(1)); 
        }
        private void ResetSoLanSaiMatKhau(string i) { 
            _memoryCache.Remove("FailPass_" + i); 
            _memoryCache.Remove("Blocked_" + i); 
        }
        private int LaySoLanSaiMatKhau(string i) { _memoryCache.TryGetValue("FailPass_" + i, out int c); return c; }

        #endregion

        #region 5. ĐỔI MẬT KHẨU

        public async Task<bool> YeuCauOtpDoiMatKhauAsync(int maNguoiDung) { var user = await _context.NguoiDungs.FindAsync(maNguoiDung); if (user == null) return false; await TaoVaGuiOtpAsync(user, "OTP Đổi mật khẩu", "Mã xác thực."); return true; }
        public async Task<bool> DoiMatKhauAsync(int maNguoiDung, DoiMatKhauRequest request) { 
            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.MaNguoiDung == maNguoiDung);
            if (user == null || !XacThucOtpTuCookie(user.Email, request.OtpCode)) throw new Exception("OTP sai.");
            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(request.MatKhauMoi);
            
            // Khi đổi mật khẩu, hủy hết các phiên khác
            var phienCu = user.DanhSachPhienDangNhap.Where(p => p.DangHoatDong);
            foreach (var p in phienCu) p.DangHoatDong = false;

            await _context.SaveChangesAsync();
            XoaOtpCookie();
            return true;
        }

        #endregion
    }
}
