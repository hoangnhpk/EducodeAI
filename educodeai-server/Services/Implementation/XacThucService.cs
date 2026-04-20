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
        private string GetOrCreateVisitorId()
        {
            var context = _httpContextAccessor.HttpContext;
            string visitorId = context.Request.Cookies["VisitorId"];
            if (string.IsNullOrEmpty(visitorId))
            {
                visitorId = Guid.NewGuid().ToString();
                var options = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTime.UtcNow.AddDays(7)
                };
                context.Response.Cookies.Append("VisitorId", visitorId, options);
            }
            return visitorId;
        }

        private void LuuOtpVaoCookie(string identifier, string otp)
        {
            var cookieOptions = new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.None, Expires = DateTime.UtcNow.AddMinutes(5) };
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
            if (string.IsNullOrEmpty(hashedOtp) || string.IsNullOrEmpty(cookieIdentifier) || cookieIdentifier != identifier) return false;
            try { return BCrypt.Net.BCrypt.Verify(otpInput + identifier, hashedOtp); } catch { return false; }
        }
        #endregion

        #region 1. LUỒNG ĐĂNG NHẬP

        private async Task KiemTraTrangThaiKhoaAsync(NguoiDungModel user)
        {
            if (string.Equals(user.TrangThai, "Bị khóa", StringComparison.OrdinalIgnoreCase) && user.ThoiGianMoKhoa.HasValue)
            {
                if (user.ThoiGianMoKhoa.Value <= DateTime.UtcNow)
                {
                    user.TrangThai = "Hoạt động";
                    user.LyDoKhoa = null;
                    user.ThoiGianMoKhoa = null;
                    await _context.SaveChangesAsync();
                }
                else
                {
                    var remaining = user.ThoiGianMoKhoa.Value - DateTime.UtcNow;
                    string timeStr = remaining.TotalDays >= 1 ? $"{(int)remaining.TotalDays} ngày" :
                                   remaining.TotalHours >= 1 ? $"{(int)remaining.TotalHours} giờ" :
                                   remaining.TotalMinutes >= 1 ? $"{(int)remaining.TotalMinutes} phút" :
                                   $"{(int)remaining.TotalSeconds} giây";
                    throw new Exception($"Tài khoản bị khóa. Lý do: {user.LyDoKhoa}. Còn lại: {timeStr}");
                }
            }
            else if (string.Equals(user.TrangThai, "Khóa vĩnh viễn", StringComparison.OrdinalIgnoreCase) || 
                     string.Equals(user.TrangThai, "Bị khóa", StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception($"Tài khoản bị khóa vĩnh viễn. Lý do: {user.LyDoKhoa}");
            }
        }

        public async Task<object> DangNhapAsync(DangNhapRequest request, string ipAddress)
        {
            // 1. Xác định Key đếm số lần sai dựa trên IP (Ổn định nhất để chặn spam unauthenticated)
            string cleanIp = string.IsNullOrEmpty(ipAddress) ? "unknown" : ipAddress.Replace(":", "_").Replace(".", "_");
            string cacheKey = $"FailedLogin_IP_{cleanIp}";
            int failedAttempts = _memoryCache.Get<int?>(cacheKey) ?? 0;

            // 2. Nếu đã sai >= 3 lần, bắt buộc check Captcha
            if (failedAttempts >= 3)
            {
                if (string.IsNullOrEmpty(request.CaptchaToken) || request.CaptchaToken == "SKIP_CAPTCHA")
                {
                    return new { 
                        requiresCaptcha = true, 
                        message = "Bạn đã nhập sai quá 3 lần. Vui lòng xác thực CAPTCHA." 
                    };
                }

                // Xác thực Captcha thật với Google
                bool isCaptchaValid = await _captchaService.XacNhanCaptchaAsync(request.CaptchaToken);
                if (!isCaptchaValid) throw new Exception("Mã CAPTCHA không hợp lệ hoặc đã hết hạn.");
                
                // GIẢI ĐÚNG CAPTCHA -> XÓA SẠCH SỐ LẦN SAI VỀ 0
                _memoryCache.Remove(cacheKey);
                failedAttempts = 0;
            }

            // 3. Tìm user trong Database
            var user = await LayNguoiDungKemThietBiAsync(request.TaiKhoan);
            
            // 4. Kiểm tra tính hợp lệ (Tài khoản tồn tại + Mật khẩu đúng)
            bool isLoginValid = user != null && BCrypt.Net.BCrypt.Verify(request.MatKhau, user.MatKhau);

            if (!isLoginValid)
            {
                failedAttempts++;
                _memoryCache.Set(cacheKey, failedAttempts, TimeSpan.FromMinutes(30));
                
                // Nếu đây là lần thử ngay sau khi giải Captcha (failedAttempts vừa reset về 0 và tăng lên 1)
                if (failedAttempts == 1 && !string.IsNullOrEmpty(request.CaptchaToken) && request.CaptchaToken != "SKIP_CAPTCHA")
                {
                    throw new Exception("Xác minh thành công! Vui lòng kiểm tra và nhập lại chính xác tài khoản, mật khẩu.");
                }

                if (failedAttempts >= 3) {
                    return new { requiresCaptcha = true, message = "Bạn đã nhập sai quá 3 lần. Vui lòng xác thực CAPTCHA." };
                }

                throw new Exception($"Tài khoản hoặc mật khẩu không chính xác. (Lần {failedAttempts}/3)");
            }

            // 5. Nếu đăng nhập đúng thông tin -> Kiểm tra tài khoản có bị Admin khóa không
            await KiemTraTrangThaiKhoaAsync(user!);

            // ĐĂNG NHẬP THÀNH CÔNG -> RESET SỐ LẦN SAI CHO IP NÀY
            _memoryCache.Remove(cacheKey);

            // 6. KIỂM TRA THIẾT BỊ (MỚI / CŨ / ĐẦY PHIÊN)
            var activeSessions = user!.DanhSachPhienDangNhap.Where(p => p.DangHoatDong).ToList();
            var currentSession = activeSessions.FirstOrDefault(p => p.MaThietBi == request.MaThietBi);

            // Nếu thiết bị này CHƯA TỪNG đăng nhập (hoặc đã bị đăng xuất/xóa phiên)
            if (currentSession == null)
            {
                // TRƯỜNG HỢP A: Đã đủ 3 thiết bị -> Yêu cầu OTP để thay thế thiết bị cũ nhất
                if (activeSessions.Count >= 3)
                {
                    var oldest = activeSessions.OrderBy(p => p.ThoiGianHoatDongCuoi).First();
                    string otp = new Random().Next(100000, 999999).ToString();
                    _memoryCache.Set("OTP_ReplaceDevice_" + user.Email, (Otp: otp, NewMaThietBi: request.MaThietBi, NewTenThietBi: request.TenThietBi, OldMaPhien: oldest.MaPhien), TimeSpan.FromMinutes(5));
                    
                    string body = TaoGiaoDienEmail("Xác nhận thay thế thiết bị", $"Bạn đang đăng nhập trên một thiết bị mới. Vì tài khoản đã đạt giới hạn 3 thiết bị, vui lòng nhập mã bên dưới để đăng xuất thiết bị <b>{oldest.TenThietBi}</b> và tiếp tục.", otp);
                    await EmailHelper.SendEmailAsync(user.Email, "Xác nhận thay thế thiết bị - EduCodeAI", body);
                    
                    return new { requiresLogoutOldest = true, oldestDeviceName = oldest.TenThietBi, email = user.Email, message = $"Tài khoản đã đạt giới hạn 3 thiết bị. Hệ thống đã gửi mã xác nhận thay thế thiết bị {oldest.TenThietBi} đến Email của bạn." };
                }
                
                // TRƯỜNG HỢP B: Chưa đủ 3 thiết bị nhưng là THIẾT BỊ MỚI -> Yêu cầu OTP xác minh thiết bị mới
                else
                {
                    string otp = new Random().Next(100000, 999999).ToString();
                    _memoryCache.Set("OTP_LoginNewDevice_" + user.Email, (Otp: otp, MaThietBi: request.MaThietBi, TenThietBi: request.TenThietBi), TimeSpan.FromMinutes(5));
                    
                    string body = TaoGiaoDienEmail("Xác minh thiết bị mới", $"Hệ thống phát hiện bạn đang đăng nhập trên một thiết bị lạ. Để bảo vệ tài khoản, vui lòng nhập mã xác thực bên dưới để hoàn tất đăng nhập.", otp);
                    await EmailHelper.SendEmailAsync(user.Email, "Xác minh thiết bị mới - EduCodeAI", body);
                    
                    return new { requiresOtp = true, email = user.Email, message = "Bạn đang đăng nhập trên thiết bị mới. Vui lòng nhập mã OTP đã được gửi đến Email để xác minh." };
                }
            }

            // Nếu là thiết bị cũ đã quen -> Cho vào luôn
            return await XuLyDangNhapThanhCongAsync(user, request.MaThietBi, request.TenThietBi);
        }

        // API MỚI: Xác nhận OTP để đá thiết bị cũ và cho thiết bị mới vào
        public async Task<object> XacNhanThayTheThietBiAsync(XacNhanOtpRequest r) {
            // r.TaiKhoan ở đây là Email
            if (!_memoryCache.TryGetValue("OTP_ReplaceDevice_" + r.TaiKhoan, out (string Otp, string NewMaThietBi, string NewTenThietBi, int OldMaPhien) cached))
                throw new Exception("Mã OTP đã hết hạn hoặc không hợp lệ.");

            if (cached.Otp != r.OtpCode)
                throw new Exception("Mã OTP không chính xác.");

            var user = await LayNguoiDungKemThietBiAsync(r.TaiKhoan);
            if (user == null) throw new Exception("Người dùng không tồn tại.");

            // 1. Đăng xuất thiết bị cũ nhất
            var oldestSession = user.DanhSachPhienDangNhap.FirstOrDefault(p => p.MaPhien == cached.OldMaPhien);
            if (oldestSession != null) oldestSession.DangHoatDong = false;

            // 2. Xử lý đăng nhập cho thiết bị mới
            _memoryCache.Remove("OTP_ReplaceDevice_" + r.TaiKhoan);
            return await XuLyDangNhapThanhCongAsync(user, cached.NewMaThietBi, cached.NewTenThietBi);
        }

        public async Task<object> DangNhapGoogleAsync(GoogleLoginRequest request, string maThietBi, string tenThietBi)
        {
            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                user = new NguoiDungModel { Email = request.Email, HoTen = request.Name, AnhDaiDien = request.Picture, TaiKhoan = request.Email, MatKhau = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), VaiTro = 2, TrangThai = "Hoạt động", NgayThamGia = DateTime.UtcNow };
                _context.NguoiDungs.Add(user);
                await _context.SaveChangesAsync();
            }
            
            await KiemTraTrangThaiKhoaAsync(user);
            return await XuLyDangNhapThanhCongAsync(user, maThietBi, tenThietBi);
        }

        public async Task<object> DangNhapFacebookAsync(FacebookDTO request, string maThietBi, string tenThietBi)
        {
            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                user = new NguoiDungModel { Email = request.Email, HoTen = request.Name, AnhDaiDien = request.Picture, TaiKhoan = request.Email, MatKhau = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), VaiTro = 2, TrangThai = "Hoạt động", NgayThamGia = DateTime.UtcNow };
                _context.NguoiDungs.Add(user);
                await _context.SaveChangesAsync();
            }

            await KiemTraTrangThaiKhoaAsync(user);
            return await XuLyDangNhapThanhCongAsync(user, maThietBi, tenThietBi);
        }

        public async Task<object> LamMoiTokenAsync(string refreshToken, string maThietBi)
        {
            if (!_memoryCache.TryGetValue("RefreshToken_" + refreshToken, out (int MaNguoiDung, string MaThietBi) data)) throw new Exception("Hết hạn.");
            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.MaNguoiDung == data.MaNguoiDung);
            
            if (user == null) throw new Exception("Không tồn tại.");
            
            // QUAN TRỌNG: Kiểm tra trạng thái khóa khi Refresh Token
            try {
                await KiemTraTrangThaiKhoaAsync(user);
            } catch (Exception ex) {
                _memoryCache.Remove("RefreshToken_" + refreshToken);
                throw new Exception(ex.Message);
            }

            var phien = user.DanhSachPhienDangNhap.FirstOrDefault(p => p.MaThietBi == maThietBi);
            if (phien == null || !phien.DangHoatDong) throw new Exception("Phiên làm việc đã hết hạn hoặc bị đăng xuất từ xa.");

            return await XuLyDangNhapThanhCongAsync(user, maThietBi, "Thiết bị hiện tại");
        }
        #endregion

        #region HELPERS
        private string TaoGiaoDienEmail(string tieuDe, string noiDung, string otp)
        {
            return $@"
            <div style='font-family: ""Segoe UI"", Roboto, ""Helvetica Neue"", Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eaeaea;'>
                <div style='background-color: #fcfcfc; padding: 25px 0; text-align: center; border-bottom: 1px solid #f0f0f0;'>
                    <h1 style='margin: 0; font-size: 28px; font-weight: 800; color: #333; letter-spacing: 1px;'>
                        EDUCODE<span style='color: #fb873f;'>AI</span>
                    </h1>
                </div>
                <div style='padding: 40px 30px;'>
                    <h2 style='color: #2c3e50; font-size: 22px; margin-top: 0; margin-bottom: 20px; text-align: center;'>{tieuDe}</h2>
                    <p style='color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;'>
                        {noiDung}
                    </p>
                    <div style='background-color: #fff8f3; border: 2px dashed #fb873f; border-radius: 12px; padding: 20px; text-align: center; margin: 0 auto; max-width: 300px;'>
                        <div style='font-size: 13px; color: #fb873f; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;'>MÃ XÁC THỰC CỦA BẠN</div>
                        <h1 style='color: #fb873f; font-size: 42px; font-weight: 800; letter-spacing: 8px; margin: 0; padding-left: 8px;'>{otp}</h1>
                    </div>
                    <p style='color: #888; font-size: 14px; text-align: center; margin-top: 30px;'>
                        Mã xác thực này có hiệu lực trong <b style='color: #555;'>5 phút</b>.<br>Vui lòng không chia sẻ mã này cho bất kỳ ai để đảm bảo an toàn.
                    </p>
                </div>
                <div style='background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;'>
                    <p style='color: #999; font-size: 13px; margin: 0 0 10px 0;'>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email hoặc liên hệ với bộ phận hỗ trợ.</p>
                    <p style='color: #bbb; font-size: 12px; margin: 0;'>© {DateTime.Now.Year} EduCodeAI. All rights reserved.</p>
                </div>
            </div>";
        }

        private async Task<NguoiDungModel?> LayNguoiDungKemThietBiAsync(string t) => 
            await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.TaiKhoan == t || u.Email == t);
        
        private async Task<object> XuLyDangNhapThanhCongAsync(NguoiDungModel u, string? maThietBi, string? tenThietBi) { 
            // maThietBi lúc này là Fingerprint gửi từ FE
            string devId = string.IsNullOrEmpty(maThietBi) ? "FP-UNKNOWN-" + Guid.NewGuid().ToString("N").Substring(0, 8) : maThietBi;
            string deviceName = string.IsNullOrEmpty(tenThietBi) ? "Thiết bị không xác định" : tenThietBi;
            
            // Tìm phiên đăng nhập cũ dựa trên Fingerprint của User này
            var phien = u.DanhSachPhienDangNhap.FirstOrDefault(p => p.MaThietBi == devId);
            
            if (phien == null) { 
                // Nếu là thiết bị hoàn toàn mới
                phien = new PhienDangNhapModel { 
                    MaNguoiDung = u.MaNguoiDung, 
                    MaThietBi = devId, 
                    TenThietBi = deviceName, 
                    ThoiGianDangNhap = DateTime.UtcNow,
                    ThoiGianHoatDongCuoi = DateTime.UtcNow,
                    DangHoatDong = true
                }; 
                _context.PhienDangNhaps.Add(phien); 
            } else {
                // Nếu thiết bị cũ quay lại (kể cả khi đã xóa cache trình duyệt nhờ Fingerprint)
                phien.ThoiGianHoatDongCuoi = DateTime.UtcNow; 
                phien.DangHoatDong = true;
                phien.TenThietBi = deviceName; // Luôn cập nhật tên thiết bị mới nhất
            }

            u.NgayDangNhapCuoi = DateTime.UtcNow; 
            await _context.SaveChangesAsync();

            // Tạo Refresh Token
            string rt = Guid.NewGuid().ToString(); 
            _memoryCache.Set("RefreshToken_" + rt, (MaNguoiDung: u.MaNguoiDung, MaThietBi: devId), TimeSpan.FromDays(7));

            return new { 
                token = TaoJwtToken(u, phien.MaPhien), 
                refreshToken = rt, 
                user = new { 
                    maNguoiDung = u.MaNguoiDung, 
                    id = u.MaNguoiDung, 
                    taiKhoan = u.TaiKhoan, 
                    hoTen = u.HoTen, 
                    email = u.Email, 
                    vaiTro = u.VaiTro,
                    anhDaiDien = u.AnhDaiDien
                } 
            };
        }

        private string TaoJwtToken(NguoiDungModel u, int m) { 
            var claims = new[] { 
                new Claim("id", u.MaNguoiDung.ToString()),
                new Claim("MaNguoiDung", u.MaNguoiDung.ToString()), 
                new Claim(ClaimTypes.NameIdentifier, u.MaNguoiDung.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, u.Email ?? ""), 
                new Claim("MaPhien", m.ToString()), 
                new Claim(ClaimTypes.Role, u.VaiTro == 0 ? "Admin" : (u.VaiTro == 1 ? "GiangVien" : "HocVien")) 
            };
            var token = new JwtSecurityToken(_config["Jwt:Issuer"], _config["Jwt:Audience"], claims, 
                expires: DateTime.UtcNow.AddMinutes(1440), 
                signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"])), SecurityAlgorithms.HmacSha256));
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private void KiemTraGioiHanThietBi(NguoiDungModel u, string d) { 
            // Nếu đã đủ 3 thiết bị VÀ thiết bị hiện tại không nằm trong danh sách đang hoạt động
            if (u.DanhSachPhienDangNhap.Count(p => p.DangHoatDong) >= 3 && 
                !u.DanhSachPhienDangNhap.Any(p => p.MaThietBi == d && p.DangHoatDong)) 
            {
                throw new Exception("Tài khoản của bạn đã đạt giới hạn đăng nhập trên 3 thiết bị. Vui lòng đăng xuất bớt thiết bị cũ.");
            }
        }

        // --- Triển khai các hàm OTP bảo mật qua MemoryCache ---

        public async Task<bool> YeuCauDangKyAsync(DangKyRequest r, string i) {
            // Kiểm tra email tồn tại
            if (await _context.NguoiDungs.AnyAsync(u => u.Email == r.Email))
                throw new Exception("Email này đã được sử dụng.");

            string otp = new Random().Next(100000, 999999).ToString();
            // Lưu vào Cache 5 phút, Key là Email
            _memoryCache.Set("OTP_Register_" + r.Email, (Otp: otp, Data: r), TimeSpan.FromMinutes(5));

            string subject = "Mã xác thực đăng ký EduCodeAI";
            string body = $"Mã OTP của bạn là: <h1 style='color: #fb873f;'>{otp}</h1> Mã có hiệu lực trong 5 phút.";
            return await EmailHelper.SendEmailAsync(r.Email, subject, body);
        }

        public async Task<object> XacNhanDangKyVaLuuDbAsync(XacNhanOtpRequest r) {
            // Log để kiểm tra dữ liệu nhận được từ FE
            Console.WriteLine($"[Register Confirm] Device: {r.MaThietBi}, Name: {r.TenThietBi}");

            if (!_memoryCache.TryGetValue("OTP_Register_" + r.TaiKhoan, out (string Otp, DangKyRequest Data) cached))
                throw new Exception("Mã OTP đã hết hạn hoặc không tồn tại.");

            if (cached.Otp != r.OtpCode)
                throw new Exception("Mã OTP không chính xác.");

            var user = new NguoiDungModel {
                TaiKhoan = cached.Data.Email, 
                Email = cached.Data.Email,
                HoTen = cached.Data.HoTen,
                MatKhau = BCrypt.Net.BCrypt.HashPassword(cached.Data.MatKhau),
                VaiTro = 2, 
                TrangThai = "Hoạt động",
                NgayThamGia = DateTime.UtcNow
            };

            _context.NguoiDungs.Add(user);
            await _context.SaveChangesAsync();
            
            _memoryCache.Remove("OTP_Register_" + r.TaiKhoan);

            // Đảm bảo không truyền rỗng vào XuLyDangNhapThanhCongAsync
            string finalDeviceId = string.IsNullOrEmpty(r.MaThietBi) ? "FP-INIT-ERR" : r.MaThietBi;
            string finalDeviceName = string.IsNullOrEmpty(r.TenThietBi) ? "Thiết bị không xác định (Đăng ký)" : r.TenThietBi;

            return await XuLyDangNhapThanhCongAsync(user, finalDeviceId, finalDeviceName);
        }

        public async Task<bool> YeuCauOtpDangXuatTuXaAsync(int userId) {
            var user = await _context.NguoiDungs.FindAsync(userId);
            if (user == null) return false;

            string otp = new Random().Next(100000, 999999).ToString();
            _memoryCache.Set($"OTP_LogoutRemote_{userId}", otp, TimeSpan.FromMinutes(5));

            string emailBody = TaoGiaoDienEmail("Đăng xuất từ xa", "Bạn vừa gửi yêu cầu đăng xuất tài khoản khỏi các thiết bị khác. Để đảm bảo an toàn, vui lòng nhập mã xác thực dưới đây để xác nhận hành động này.", otp);
            await EmailHelper.SendEmailAsync(user.Email, "Xác nhận đăng xuất từ xa", emailBody);
            return true;
        }

        public async Task<bool> XacNhanDangXuatTuXaAsync(int userId, DangXuatTuXaRequest r) {
            if (!_memoryCache.TryGetValue($"OTP_LogoutRemote_{userId}", out string cachedOtp) || cachedOtp != r.OtpCode)
                throw new Exception("Mã OTP không chính xác hoặc đã hết hạn.");

            if (r.DangXuatTatCa) {
                var allSessions = await _context.PhienDangNhaps
                    .Where(p => p.MaNguoiDung == userId && p.DangHoatDong)
                    .ToListAsync();
                foreach (var s in allSessions) s.DangHoatDong = false;
            } else if (r.DanhSachMaPhien != null && r.DanhSachMaPhien.Any()) {
                var sessions = await _context.PhienDangNhaps
                    .Where(p => p.MaNguoiDung == userId && r.DanhSachMaPhien.Contains(p.MaPhien))
                    .ToListAsync();
                foreach (var s in sessions) s.DangHoatDong = false;
            }

            await _context.SaveChangesAsync();
            _memoryCache.Remove($"OTP_LogoutRemote_{userId}");
            return true;
        }

        public async Task<object> XacNhanOtpVaDangNhapAsync(XacNhanOtpRequest r) {
            // Hàm này dùng cho luồng đăng nhập thiết bị mới yêu cầu OTP
            if (!_memoryCache.TryGetValue("OTP_LoginNewDevice_" + r.TaiKhoan, out (string Otp, string MaThietBi, string TenThietBi) cached))
                throw new Exception("Mã OTP đã hết hạn.");

            if (cached.Otp != r.OtpCode)
                throw new Exception("Mã OTP không chính xác.");

            var user = await LayNguoiDungKemThietBiAsync(r.TaiKhoan);
            if (user == null) throw new Exception("Người dùng không tồn tại.");

            _memoryCache.Remove("OTP_LoginNewDevice_" + r.TaiKhoan);
            return await XuLyDangNhapThanhCongAsync(user, cached.MaThietBi, cached.TenThietBi);
        }

        public async Task<object> YeuCauQuenMatKhauAsync(QuenMatKhauRequest r, string i) {
            var user = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.Email == r.Email);
            if (user == null) throw new Exception("Email không tồn tại trên hệ thống.");

            string otp = new Random().Next(100000, 999999).ToString();
            _memoryCache.Set("OTP_Forgot_" + r.Email, otp, TimeSpan.FromMinutes(5));

            string emailBody = TaoGiaoDienEmail("Đặt lại mật khẩu", "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhập mã xác thực dưới đây để tiến hành thiết lập mật khẩu mới.", otp);
            await EmailHelper.SendEmailAsync(r.Email, "Mã xác nhận đặt lại mật khẩu", emailBody);
            return new { message = "Mã OTP đã được gửi." };
        }

        public async Task<object> DatLaiMatKhauAsync(DatLaiMatKhauRequest r) {
            if (!_memoryCache.TryGetValue("OTP_Forgot_" + r.Email, out string cachedOtp) || cachedOtp != r.OtpCode)
                throw new Exception("Mã OTP không chính xác hoặc đã hết hạn.");

            var user = await LayNguoiDungKemThietBiAsync(r.Email);
            if (user == null) throw new Exception("Người dùng không tồn tại.");

            // 1. Cập nhật mật khẩu mới
            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(r.MatKhauMoi);
            await _context.SaveChangesAsync();
            
            // 2. Xóa OTP quên mật khẩu khỏi cache
            _memoryCache.Remove("OTP_Forgot_" + r.Email);

            // 3. LOGIC ĐỒNG BỘ VỚI ĐĂNG NHẬP: KIỂM TRA THIẾT BỊ
            var activeSessions = user.DanhSachPhienDangNhap.Where(p => p.DangHoatDong).ToList();
            
            // Nếu thiết bị hiện tại chưa có phiên VÀ đã đủ 3 thiết bị khác đang hoạt động
            if (activeSessions.Count >= 3 && !activeSessions.Any(p => p.MaThietBi == r.MaThietBi))
            {
                var oldest = activeSessions.OrderBy(p => p.ThoiGianHoatDongCuoi).First();
                string otp = new Random().Next(100000, 999999).ToString();
                
                // Lưu OTP thay thế thiết bị vào cache
                _memoryCache.Set("OTP_ReplaceDevice_" + user.Email, 
                    (Otp: otp, NewMaThietBi: r.MaThietBi, NewTenThietBi: r.TenThietBi, OldMaPhien: oldest.MaPhien), 
                    TimeSpan.FromMinutes(5));

                await EmailHelper.SendEmailAsync(user.Email, "Xác nhận thay thế thiết bị sau khi đổi mật khẩu", 
                    $"Bạn vừa đặt lại mật khẩu và đang đăng nhập trên thiết bị mới. Vui lòng nhập mã <b>{otp}</b> để đăng xuất thiết bị <b>{oldest.TenThietBi}</b> và tiếp tục vào hệ thống.");

                return new { 
                    requiresLogoutOldest = true, 
                    oldestDeviceName = oldest.TenThietBi, 
                    email = user.Email, 
                    message = "Đặt lại mật khẩu thành công! Tuy nhiên bạn đã đạt giới hạn 3 thiết bị. Vui lòng xác nhận thay thế thiết bị để vào hệ thống." 
                };
            }

            // 4. Nếu hợp lệ (thiết bị cũ hoặc còn chỗ) -> Tự động đăng nhập
            var loginResult = await XuLyDangNhapThanhCongAsync(user, r.MaThietBi, r.TenThietBi);
            
            // Trả về cả message thông báo thành công và dữ liệu đăng nhập
            return new {
                message = "Đặt lại mật khẩu thành công và đã tự động đăng nhập!",
                loginData = loginResult
            };
        }

        public async Task<bool> DoiMatKhauAsync(int userId, DoiMatKhauRequest r) {
            var user = await _context.NguoiDungs.FindAsync(userId);
            if (user == null) throw new Exception("Người dùng không tồn tại.");

            if (!BCrypt.Net.BCrypt.Verify(r.MatKhauCu, user.MatKhau))
                throw new Exception("Mật khẩu hiện tại không chính xác.");

            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(r.MatKhauMoi);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<object> LayDanhSachThietBiAsync(int userId, string maThietBiHienTai) {
            var sessions = await _context.PhienDangNhaps
                .Where(p => p.MaNguoiDung == userId && p.DangHoatDong)
                .OrderByDescending(p => p.ThoiGianHoatDongCuoi)
                .ToListAsync();

            // So sánh dựa trên mã Fingerprint (maThietBiHienTai gửi từ FE lên)
            return sessions.Select(p => new {
                p.MaPhien,
                p.TenThietBi,
                p.ThoiGianHoatDongCuoi,
                p.MaThietBi,
                IsCurrentDevice = p.MaThietBi == maThietBiHienTai
            });
        }

        public async Task<bool> DangXuatAsync(int userId, string maThietBi) {
            var phien = await _context.PhienDangNhaps.FirstOrDefaultAsync(p => p.MaNguoiDung == userId && p.MaThietBi == maThietBi);
            if (phien != null) {
                phien.DangHoatDong = false;
                await _context.SaveChangesAsync();
            }
            return true;
        }
        #endregion
    }
}