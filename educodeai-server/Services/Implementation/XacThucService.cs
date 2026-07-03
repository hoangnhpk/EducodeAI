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
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace educodeai_server.Services.Implementation
{
    public class XacThucService : IXacThucService
    {
        private readonly EduCodeAIDbContext _context;
        private readonly IConfiguration _config;
        private readonly ICaptchaService _captchaService;
        private readonly IMemoryCache _memoryCache;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWebHostEnvironment _env;

        public XacThucService(EduCodeAIDbContext context, IConfiguration config, ICaptchaService captchaService, IMemoryCache memoryCache, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment env)
        {
            _context = context;
            _config = config;
            _captchaService = captchaService;
            _memoryCache = memoryCache;
            _httpContextAccessor = httpContextAccessor;
            _env = env;
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

        #region 1. LUá»’NG ÄÄ‚NG NHáº¬P

        private async Task KiemTraTrangThaiKhoaAsync(NguoiDungModel user)
        {
            if (string.Equals(user.TrangThai, "Bá»‹ khÃ³a", StringComparison.OrdinalIgnoreCase) && user.ThoiGianMoKhoa.HasValue)
            {
                if (user.ThoiGianMoKhoa.Value <= DateTime.UtcNow)
                {
                    user.TrangThai = "Hoáº¡t Ä‘á»™ng";
                    user.LyDoKhoa = null;
                    user.ThoiGianMoKhoa = null;
                    await _context.SaveChangesAsync();
                }
                else
                {
                    var remaining = user.ThoiGianMoKhoa.Value - DateTime.UtcNow;
                    string timeStr = remaining.TotalDays >= 1 ? $"{(int)remaining.TotalDays} ngÃ y" :
                                   remaining.TotalHours >= 1 ? $"{(int)remaining.TotalHours} giá»" :
                                   remaining.TotalMinutes >= 1 ? $"{(int)remaining.TotalMinutes} phÃºt" :
                                   $"{(int)remaining.TotalSeconds} giÃ¢y";
                    throw new Exception($"TÃ i khoáº£n bá»‹ khÃ³a. LÃ½ do: {user.LyDoKhoa}. CÃ²n láº¡i: {timeStr}");
                }
            }
            else if (string.Equals(user.TrangThai, "KhÃ³a vÄ©nh viá»…n", StringComparison.OrdinalIgnoreCase) || 
                     string.Equals(user.TrangThai, "Bá»‹ khÃ³a", StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception($"TÃ i khoáº£n bá»‹ khÃ³a vÄ©nh viá»…n. LÃ½ do: {user.LyDoKhoa}");
            }
        }

        public async Task<object> DangNhapAsync(DangNhapRequest request, string ipAddress)
        {
            // 1. XÃ¡c Ä‘á»‹nh Key Ä‘áº¿m sá»‘ láº§n sai dá»±a trÃªn IP (á»”n Ä‘á»‹nh nháº¥t Ä‘á»ƒ cháº·n spam unauthenticated)
            string cleanIp = string.IsNullOrEmpty(ipAddress) ? "unknown" : ipAddress.Replace(":", "_").Replace(".", "_");
            string cacheKey = $"FailedLogin_IP_{cleanIp}";
            int failedAttempts = _memoryCache.Get<int?>(cacheKey) ?? 0;

            // 2. Náº¿u Ä‘Ã£ sai >= 3 láº§n, báº¯t buá»™c check Captcha
            if (failedAttempts >= 3)
            {
                if (string.IsNullOrEmpty(request.CaptchaToken) || request.CaptchaToken == "SKIP_CAPTCHA")
                {
                    return new { 
                        requiresCaptcha = true, 
                        message = "Báº¡n Ä‘Ã£ nháº­p sai quÃ¡ 3 láº§n. Vui lÃ²ng xÃ¡c thá»±c CAPTCHA." 
                    };
                }

                // XÃ¡c thá»±c Captcha tháº­t vá»›i Google
                bool isCaptchaValid = await _captchaService.XacNhanCaptchaAsync(request.CaptchaToken);
                if (!isCaptchaValid) throw new Exception("MÃ£ CAPTCHA khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n.");
                
                // GIáº¢I ÄÃšNG CAPTCHA -> XÃ“A Sáº CH Sá» Láº¦N SAI Vá»€ 0
                _memoryCache.Remove(cacheKey);
                failedAttempts = 0;
            }

            // 3. TÃ¬m user trong Database
            var user = await LayNguoiDungKemThietBiAsync(request.TaiKhoan);
            
            // 4. Kiá»ƒm tra tÃ­nh há»£p lá»‡ (TÃ i khoáº£n tá»“n táº¡i + Máº­t kháº©u Ä‘Ãºng)
            bool isLoginValid = user != null && BCrypt.Net.BCrypt.Verify(request.MatKhau, user.MatKhau);

            if (!isLoginValid)
            {
                failedAttempts++;
                _memoryCache.Set(cacheKey, failedAttempts, TimeSpan.FromMinutes(30));
                
                // Náº¿u Ä‘Ã¢y lÃ  láº§n thá»­ ngay sau khi giáº£i Captcha (failedAttempts vá»«a reset vá» 0 vÃ  tÄƒng lÃªn 1)
                if (failedAttempts == 1 && !string.IsNullOrEmpty(request.CaptchaToken) && request.CaptchaToken != "SKIP_CAPTCHA")
                {
                    throw new Exception("XÃ¡c minh thÃ nh cÃ´ng! Vui lÃ²ng kiá»ƒm tra vÃ  nháº­p láº¡i chÃ­nh xÃ¡c tÃ i khoáº£n, máº­t kháº©u.");
                }

                if (failedAttempts >= 3) {
                    return new { requiresCaptcha = true, message = "Báº¡n Ä‘Ã£ nháº­p sai quÃ¡ 3 láº§n. Vui lÃ²ng xÃ¡c thá»±c CAPTCHA." };
                }

                throw new Exception($"TÃ i khoáº£n hoáº·c máº­t kháº©u khÃ´ng chÃ­nh xÃ¡c. (Láº§n {failedAttempts}/3)");
            }

            // 5. Náº¿u Ä‘Äƒng nháº­p Ä‘Ãºng thÃ´ng tin -> Kiá»ƒm tra tÃ i khoáº£n cÃ³ bá»‹ Admin khÃ³a khÃ´ng
            await KiemTraTrangThaiKhoaAsync(user!);

            // ÄÄ‚NG NHáº¬P THÃ€NH CÃ”NG -> RESET Sá» Láº¦N SAI CHO IP NÃ€Y
            _memoryCache.Remove(cacheKey);

            // 6. KIá»‚M TRA THIáº¾T Bá»Š (Má»šI / CÅ¨ / Äáº¦Y PHIÃŠN)
            var activeSessions = user!.DanhSachPhienDangNhap.Where(p => p.DangHoatDong).ToList();
            var currentSession = activeSessions.FirstOrDefault(p => p.MaThietBi == request.MaThietBi);

            // Náº¿u thiáº¿t bá»‹ nÃ y CHÆ¯A Tá»ªNG Ä‘Äƒng nháº­p (hoáº·c Ä‘Ã£ bá»‹ Ä‘Äƒng xuáº¥t/xÃ³a phiÃªn)
            if (currentSession == null)
            {
                // TRÆ¯á»œNG Há»¢P A: ÄÃ£ Ä‘á»§ 3 thiáº¿t bá»‹ -> YÃªu cáº§u OTP Ä‘á»ƒ thay tháº¿ thiáº¿t bá»‹ cÅ© nháº¥t
                if (activeSessions.Count >= 3)
                {
                    var oldest = activeSessions.OrderBy(p => p.ThoiGianHoatDongCuoi).First();
                    string otp = new Random().Next(100000, 999999).ToString();
                    _memoryCache.Set("OTP_ReplaceDevice_" + user.Email, (Otp: otp, NewMaThietBi: request.MaThietBi, NewTenThietBi: request.TenThietBi, OldMaPhien: oldest.MaPhien), TimeSpan.FromMinutes(5));
                    
                    string body = TaoGiaoDienEmail("XÃ¡c nháº­n thay tháº¿ thiáº¿t bá»‹", $"Báº¡n Ä‘ang Ä‘Äƒng nháº­p trÃªn má»™t thiáº¿t bá»‹ má»›i. VÃ¬ tÃ i khoáº£n Ä‘Ã£ Ä‘áº¡t giá»›i háº¡n 3 thiáº¿t bá»‹, vui lÃ²ng nháº­p mÃ£ bÃªn dÆ°á»›i Ä‘á»ƒ Ä‘Äƒng xuáº¥t thiáº¿t bá»‹ <b>{oldest.TenThietBi}</b> vÃ  tiáº¿p tá»¥c.", otp);
                    await EmailHelper.SendEmailAsync(user.Email, "XÃ¡c nháº­n thay tháº¿ thiáº¿t bá»‹ - EduCodeAI", body);
                    
                    return new { requiresLogoutOldest = true, oldestDeviceName = oldest.TenThietBi, email = user.Email, message = $"TÃ i khoáº£n Ä‘Ã£ Ä‘áº¡t giá»›i háº¡n 3 thiáº¿t bá»‹. Há»‡ thá»‘ng Ä‘Ã£ gá»­i mÃ£ xÃ¡c nháº­n thay tháº¿ thiáº¿t bá»‹ {oldest.TenThietBi} Ä‘áº¿n Email cá»§a báº¡n." };
                }
                
                // TRÆ¯á»œNG Há»¢P B: ChÆ°a Ä‘á»§ 3 thiáº¿t bá»‹ nhÆ°ng lÃ  THIáº¾T Bá»Š Má»šI -> YÃªu cáº§u OTP xÃ¡c minh thiáº¿t bá»‹ má»›i
                else
                {
                    string otp = new Random().Next(100000, 999999).ToString();
                    _memoryCache.Set("OTP_LoginNewDevice_" + user.Email, (Otp: otp, MaThietBi: request.MaThietBi, TenThietBi: request.TenThietBi), TimeSpan.FromMinutes(5));
                    
                    string body = TaoGiaoDienEmail("XÃ¡c minh thiáº¿t bá»‹ má»›i", $"Há»‡ thá»‘ng phÃ¡t hiá»‡n báº¡n Ä‘ang Ä‘Äƒng nháº­p trÃªn má»™t thiáº¿t bá»‹ láº¡. Äá»ƒ báº£o vá»‡ tÃ i khoáº£n, vui lÃ²ng nháº­p mÃ£ xÃ¡c thá»±c bÃªn dÆ°á»›i Ä‘á»ƒ hoÃ n táº¥t Ä‘Äƒng nháº­p.", otp);
                    await EmailHelper.SendEmailAsync(user.Email, "XÃ¡c minh thiáº¿t bá»‹ má»›i - EduCodeAI", body);
                    
                    return new { requiresOtp = true, email = user.Email, message = "Báº¡n Ä‘ang Ä‘Äƒng nháº­p trÃªn thiáº¿t bá»‹ má»›i. Vui lÃ²ng nháº­p mÃ£ OTP Ä‘Ã£ Ä‘Æ°á»£c gá»­i Ä‘áº¿n Email Ä‘á»ƒ xÃ¡c minh." };
                }
            }

            // Náº¿u lÃ  thiáº¿t bá»‹ cÅ© Ä‘Ã£ quen -> Cho vÃ o luÃ´n
            return await XuLyDangNhapThanhCongAsync(user, request.MaThietBi, request.TenThietBi);
        }

        // API Má»šI: XÃ¡c nháº­n OTP Ä‘á»ƒ Ä‘Ã¡ thiáº¿t bá»‹ cÅ© vÃ  cho thiáº¿t bá»‹ má»›i vÃ o
        public async Task<object> XacNhanThayTheThietBiAsync(XacNhanOtpRequest r) {
            var user = await LayNguoiDungKemThietBiAsync(r.TaiKhoan);
            if (user == null) throw new Exception("NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i.");

            if (!_memoryCache.TryGetValue("OTP_ReplaceDevice_" + user.Email, out (string Otp, string NewMaThietBi, string NewTenThietBi, int OldMaPhien) cached))
                throw new Exception("MÃ£ OTP Ä‘Ã£ háº¿t háº¡n hoáº·c khÃ´ng há»£p lá»‡.");

            if (cached.Otp != r.OtpCode)
                throw new Exception("MÃ£ OTP khÃ´ng chÃ­nh xÃ¡c.");

            // 1. ÄÄƒng xuáº¥t thiáº¿t bá»‹ cÅ© nháº¥t
            var oldestSession = user.DanhSachPhienDangNhap.FirstOrDefault(p => p.MaPhien == cached.OldMaPhien);
            if (oldestSession != null) oldestSession.DangHoatDong = false;

            // 2. Xá»­ lÃ½ Ä‘Äƒng nháº­p cho thiáº¿t bá»‹ má»›i
            _memoryCache.Remove("OTP_ReplaceDevice_" + user.Email);
            return await XuLyDangNhapThanhCongAsync(user, cached.NewMaThietBi, cached.NewTenThietBi);
        }

        public async Task<object> DangNhapGoogleAsync(GoogleLoginRequest request, string maThietBi, string tenThietBi)
        {
            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                user = new NguoiDungModel { Email = request.Email, HoTen = request.Name, AnhDaiDien = request.Picture, TaiKhoan = request.Email, MatKhau = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), VaiTro = 2, TrangThai = "Hoáº¡t Ä‘á»™ng", NgayThamGia = DateTime.UtcNow };
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
                user = new NguoiDungModel { Email = request.Email, HoTen = request.Name, AnhDaiDien = request.Picture, TaiKhoan = request.Email, MatKhau = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), VaiTro = 2, TrangThai = "Hoáº¡t Ä‘á»™ng", NgayThamGia = DateTime.UtcNow };
                _context.NguoiDungs.Add(user);
                await _context.SaveChangesAsync();
            }

            await KiemTraTrangThaiKhoaAsync(user);
            return await XuLyDangNhapThanhCongAsync(user, maThietBi, tenThietBi);
        }

        public async Task<object> LamMoiTokenAsync(string refreshToken, string maThietBi)
        {
            if (!_memoryCache.TryGetValue("RefreshToken_" + refreshToken, out (int MaNguoiDung, string MaThietBi) data)) throw new Exception("Háº¿t háº¡n.");
            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.MaNguoiDung == data.MaNguoiDung);
            
            if (user == null) throw new Exception("KhÃ´ng tá»“n táº¡i.");
            
            // QUAN TRá»ŒNG: Kiá»ƒm tra tráº¡ng thÃ¡i khÃ³a khi Refresh Token
            try {
                await KiemTraTrangThaiKhoaAsync(user);
            } catch (Exception ex) {
                _memoryCache.Remove("RefreshToken_" + refreshToken);
                throw new Exception(ex.Message);
            }

            var phien = user.DanhSachPhienDangNhap.FirstOrDefault(p => p.MaThietBi == maThietBi);
            if (phien == null || !phien.DangHoatDong) throw new Exception("PhiÃªn lÃ m viá»‡c Ä‘Ã£ háº¿t háº¡n hoáº·c bá»‹ Ä‘Äƒng xuáº¥t tá»« xa.");

            return await XuLyDangNhapThanhCongAsync(user, maThietBi, "Thiáº¿t bá»‹ hiá»‡n táº¡i");
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
                        <div style='font-size: 13px; color: #fb873f; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;'>MÃƒ XÃC THá»°C Cá»¦A Báº N</div>
                        <h1 style='color: #fb873f; font-size: 42px; font-weight: 800; letter-spacing: 8px; margin: 0; padding-left: 8px;'>{otp}</h1>
                    </div>
                    <p style='color: #888; font-size: 14px; text-align: center; margin-top: 30px;'>
                        MÃ£ xÃ¡c thá»±c nÃ y cÃ³ hiá»‡u lá»±c trong <b style='color: #555;'>5 phÃºt</b>.<br>Vui lÃ²ng khÃ´ng chia sáº» mÃ£ nÃ y cho báº¥t ká»³ ai Ä‘á»ƒ Ä‘áº£m báº£o an toÃ n.
                    </p>
                </div>
                <div style='background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;'>
                    <p style='color: #999; font-size: 13px; margin: 0 0 10px 0;'>Náº¿u báº¡n khÃ´ng yÃªu cáº§u mÃ£ nÃ y, vui lÃ²ng bá» qua email hoáº·c liÃªn há»‡ vá»›i bá»™ pháº­n há»— trá»£.</p>
                    <p style='color: #bbb; font-size: 12px; margin: 0;'>Â© {DateTime.Now.Year} EduCodeAI. All rights reserved.</p>
                </div>
            </div>";
        }

        private async Task<NguoiDungModel?> LayNguoiDungKemThietBiAsync(string t) => 
            await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.TaiKhoan == t || u.Email == t);
        
        private async Task<object> XuLyDangNhapThanhCongAsync(NguoiDungModel u, string? maThietBi, string? tenThietBi) { 
            // maThietBi lÃºc nÃ y lÃ  Fingerprint gá»­i tá»« FE
            string devId = string.IsNullOrEmpty(maThietBi) ? "FP-UNKNOWN-" + Guid.NewGuid().ToString("N").Substring(0, 8) : maThietBi;
            string deviceName = string.IsNullOrEmpty(tenThietBi) ? "Thiáº¿t bá»‹ khÃ´ng xÃ¡c Ä‘á»‹nh" : tenThietBi;
            
            // TÃ¬m phiÃªn Ä‘Äƒng nháº­p cÅ© dá»±a trÃªn Fingerprint cá»§a User nÃ y
            var phien = u.DanhSachPhienDangNhap.FirstOrDefault(p => p.MaThietBi == devId);
            
            if (phien == null) { 
                // Náº¿u lÃ  thiáº¿t bá»‹ hoÃ n toÃ n má»›i
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
                // Náº¿u thiáº¿t bá»‹ cÅ© quay láº¡i (ká»ƒ cáº£ khi Ä‘Ã£ xÃ³a cache trÃ¬nh duyá»‡t nhá» Fingerprint)
                phien.ThoiGianHoatDongCuoi = DateTime.UtcNow; 
                phien.DangHoatDong = true;
                phien.TenThietBi = deviceName; // LuÃ´n cáº­p nháº­t tÃªn thiáº¿t bá»‹ má»›i nháº¥t
            }

            u.NgayDangNhapCuoi = DateTime.UtcNow; 
            await _context.SaveChangesAsync();

            // Táº¡o Refresh Token
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
            // Náº¿u Ä‘Ã£ Ä‘á»§ 3 thiáº¿t bá»‹ VÃ€ thiáº¿t bá»‹ hiá»‡n táº¡i khÃ´ng náº±m trong danh sÃ¡ch Ä‘ang hoáº¡t Ä‘á»™ng
            if (u.DanhSachPhienDangNhap.Count(p => p.DangHoatDong) >= 3 && 
                !u.DanhSachPhienDangNhap.Any(p => p.MaThietBi == d && p.DangHoatDong)) 
            {
                throw new Exception("TÃ i khoáº£n cá»§a báº¡n Ä‘Ã£ Ä‘áº¡t giá»›i háº¡n Ä‘Äƒng nháº­p trÃªn 3 thiáº¿t bá»‹. Vui lÃ²ng Ä‘Äƒng xuáº¥t bá»›t thiáº¿t bá»‹ cÅ©.");
            }
        }

        // --- Triá»ƒn khai cÃ¡c hÃ m OTP báº£o máº­t qua MemoryCache ---


        public async Task<bool> GuiOtpEmailGiangVienAsync(string email)
        {
            email = (email ?? string.Empty).Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(email)) throw new Exception("Vui l?ng nh?p email.");

            if (await _context.NguoiDungs.AnyAsync(u => u.Email.ToLower() == email))
                throw new Exception("Email n?y ?? ???c s? d?ng.");

            if (await _context.HoSoDangKyGiangViens.AnyAsync(h => h.Email.ToLower() == email.ToLower() && h.TrangThaiHoSo != "TuChoi"))
                throw new Exception("Email n?y ?? c? h? s? gi?ng vi?n ?ang ch? x? l? ho?c ?? ???c duy?t.");

            string otp = new Random().Next(100000, 999999).ToString();
            _memoryCache.Set("OTP_InstructorEmail_" + email, otp, TimeSpan.FromMinutes(5));

            string subject = "M? x?c th?c email ??ng k? gi?ng vi?n EduCodeAI";
            string body = TaoGiaoDienEmail("X?c th?c email ??ng k? gi?ng vi?n", "B?n ?ang ??ng k? tr? th?nh gi?ng vi?n EduCodeAI. Vui l?ng nh?p m? x?c th?c d??i ??y ?? ti?p t?c.", otp);
            return await EmailHelper.SendEmailAsync(email, subject, body);
        }

        public Task<bool> XacMinhOtpEmailGiangVienAsync(string email, string otpCode)
        {
            email = (email ?? string.Empty).Trim().ToLowerInvariant();
            otpCode = (otpCode ?? string.Empty).Trim();

            if (!_memoryCache.TryGetValue("OTP_InstructorEmail_" + email, out string cachedOtp) || cachedOtp != otpCode)
                throw new Exception("M? OTP kh?ng ch?nh x?c ho?c ?? h?t h?n.");

            _memoryCache.Set("VERIFIED_InstructorEmail_" + email, true, TimeSpan.FromMinutes(30));
            _memoryCache.Remove("OTP_InstructorEmail_" + email);
            return Task.FromResult(true);
        }

        public async Task<bool> YeuCauDangKyAsync(DangKyRequest r, string i) {
            // Kiá»ƒm tra email tá»“n táº¡i
            if (await _context.NguoiDungs.AnyAsync(u => u.Email == r.Email))
                throw new Exception("Email nÃ y Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng.");

            string otp = new Random().Next(100000, 999999).ToString();
            // LÆ°u vÃ o Cache 5 phÃºt, Key lÃ  Email
            _memoryCache.Set("OTP_Register_" + r.Email, (Otp: otp, Data: r), TimeSpan.FromMinutes(5));

            string subject = "MÃ£ xÃ¡c thá»±c Ä‘Äƒng kÃ½ EduCodeAI";
            string body = $"MÃ£ OTP cá»§a báº¡n lÃ : <h1 style='color: #fb873f;'>{otp}</h1> MÃ£ cÃ³ hiá»‡u lá»±c trong 5 phÃºt.";
            return await EmailHelper.SendEmailAsync(r.Email, subject, body);
        }

        public async Task<object> XacNhanDangKyVaLuuDbAsync(XacNhanOtpRequest r) {
            // Log Ä‘á»ƒ kiá»ƒm tra dá»¯ liá»‡u nháº­n Ä‘Æ°á»£c tá»« FE
            Console.WriteLine($"[Register Confirm] Device: {r.MaThietBi}, Name: {r.TenThietBi}");

            if (!_memoryCache.TryGetValue("OTP_Register_" + r.TaiKhoan, out (string Otp, DangKyRequest Data) cached))
                throw new Exception("MÃ£ OTP Ä‘Ã£ háº¿t háº¡n hoáº·c khÃ´ng tá»“n táº¡i.");

            if (cached.Otp != r.OtpCode)
                throw new Exception("MÃ£ OTP khÃ´ng chÃ­nh xÃ¡c.");

            var user = new NguoiDungModel {
                TaiKhoan = cached.Data.Email, 
                Email = cached.Data.Email,
                HoTen = cached.Data.HoTen,
                MatKhau = BCrypt.Net.BCrypt.HashPassword(cached.Data.MatKhau),
                VaiTro = 2, 
                TrangThai = "Hoáº¡t Ä‘á»™ng",
                NgayThamGia = DateTime.UtcNow
            };

            _context.NguoiDungs.Add(user);
            await _context.SaveChangesAsync();
            
            _memoryCache.Remove("OTP_Register_" + r.TaiKhoan);

            // Äáº£m báº£o khÃ´ng truyá»n rá»—ng vÃ o XuLyDangNhapThanhCongAsync
            string finalDeviceId = string.IsNullOrEmpty(r.MaThietBi) ? "FP-INIT-ERR" : r.MaThietBi;
            string finalDeviceName = string.IsNullOrEmpty(r.TenThietBi) ? "Thiáº¿t bá»‹ khÃ´ng xÃ¡c Ä‘á»‹nh (ÄÄƒng kÃ½)" : r.TenThietBi;

            return await XuLyDangNhapThanhCongAsync(user, finalDeviceId, finalDeviceName);
        }

        public async Task<bool> YeuCauOtpDangXuatTuXaAsync(int userId) {
            var user = await _context.NguoiDungs.FindAsync(userId);
            if (user == null) return false;

            string otp = new Random().Next(100000, 999999).ToString();
            _memoryCache.Set($"OTP_LogoutRemote_{userId}", otp, TimeSpan.FromMinutes(5));

            string emailBody = TaoGiaoDienEmail("ÄÄƒng xuáº¥t tá»« xa", "Báº¡n vá»«a gá»­i yÃªu cáº§u Ä‘Äƒng xuáº¥t tÃ i khoáº£n khá»i cÃ¡c thiáº¿t bá»‹ khÃ¡c. Äá»ƒ Ä‘áº£m báº£o an toÃ n, vui lÃ²ng nháº­p mÃ£ xÃ¡c thá»±c dÆ°á»›i Ä‘Ã¢y Ä‘á»ƒ xÃ¡c nháº­n hÃ nh Ä‘á»™ng nÃ y.", otp);
            await EmailHelper.SendEmailAsync(user.Email, "XÃ¡c nháº­n Ä‘Äƒng xuáº¥t tá»« xa", emailBody);
            return true;
        }

        public async Task<bool> XacNhanDangXuatTuXaAsync(int userId, DangXuatTuXaRequest r) {
            if (!_memoryCache.TryGetValue($"OTP_LogoutRemote_{userId}", out string cachedOtp) || cachedOtp != r.OtpCode)
                throw new Exception("MÃ£ OTP khÃ´ng chÃ­nh xÃ¡c hoáº·c Ä‘Ã£ háº¿t háº¡n.");

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
            var user = await LayNguoiDungKemThietBiAsync(r.TaiKhoan);
            if (user == null) throw new Exception("NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i.");

            // HÃ m nÃ y dÃ¹ng cho luá»“ng Ä‘Äƒng nháº­p thiáº¿t bá»‹ má»›i yÃªu cáº§u OTP
            if (!_memoryCache.TryGetValue("OTP_LoginNewDevice_" + user.Email, out (string Otp, string MaThietBi, string TenThietBi) cached))
                throw new Exception("MÃ£ OTP Ä‘Ã£ háº¿t háº¡n.");

            if (cached.Otp != r.OtpCode)
                throw new Exception("MÃ£ OTP khÃ´ng chÃ­nh xÃ¡c.");

            _memoryCache.Remove("OTP_LoginNewDevice_" + user.Email);
            return await XuLyDangNhapThanhCongAsync(user, cached.MaThietBi, cached.TenThietBi);
        }

        public async Task<object> YeuCauQuenMatKhauAsync(QuenMatKhauRequest r, string i) {
            var user = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.Email == r.Email);
            if (user == null) throw new Exception("Email khÃ´ng tá»“n táº¡i trÃªn há»‡ thá»‘ng.");

            string otp = new Random().Next(100000, 999999).ToString();
            _memoryCache.Set("OTP_Forgot_" + r.Email, otp, TimeSpan.FromMinutes(5));

            string emailBody = TaoGiaoDienEmail("Äáº·t láº¡i máº­t kháº©u", "ChÃºng tÃ´i nháº­n Ä‘Æ°á»£c yÃªu cáº§u Ä‘áº·t láº¡i máº­t kháº©u cho tÃ i khoáº£n cá»§a báº¡n. Vui lÃ²ng nháº­p mÃ£ xÃ¡c thá»±c dÆ°á»›i Ä‘Ã¢y Ä‘á»ƒ tiáº¿n hÃ nh thiáº¿t láº­p máº­t kháº©u má»›i.", otp);
            await EmailHelper.SendEmailAsync(r.Email, "MÃ£ xÃ¡c nháº­n Ä‘áº·t láº¡i máº­t kháº©u", emailBody);
            return new { message = "MÃ£ OTP Ä‘Ã£ Ä‘Æ°á»£c gá»­i." };
        }

        public async Task<object> DatLaiMatKhauAsync(DatLaiMatKhauRequest r) {
            if (!_memoryCache.TryGetValue("OTP_Forgot_" + r.Email, out string cachedOtp) || cachedOtp != r.OtpCode)
                throw new Exception("MÃ£ OTP khÃ´ng chÃ­nh xÃ¡c hoáº·c Ä‘Ã£ háº¿t háº¡n.");

            var user = await LayNguoiDungKemThietBiAsync(r.Email);
            if (user == null) throw new Exception("NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i.");

            // 1. Cáº­p nháº­t máº­t kháº©u má»›i
            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(r.MatKhauMoi);
            await _context.SaveChangesAsync();
            
            // 2. XÃ³a OTP quÃªn máº­t kháº©u khá»i cache
            _memoryCache.Remove("OTP_Forgot_" + r.Email);

            // 3. LOGIC Äá»’NG Bá»˜ Vá»šI ÄÄ‚NG NHáº¬P: KIá»‚M TRA THIáº¾T Bá»Š
            var activeSessions = user.DanhSachPhienDangNhap.Where(p => p.DangHoatDong).ToList();
            
            // Náº¿u thiáº¿t bá»‹ hiá»‡n táº¡i chÆ°a cÃ³ phiÃªn VÃ€ Ä‘Ã£ Ä‘á»§ 3 thiáº¿t bá»‹ khÃ¡c Ä‘ang hoáº¡t Ä‘á»™ng
            if (activeSessions.Count >= 3 && !activeSessions.Any(p => p.MaThietBi == r.MaThietBi))
            {
                var oldest = activeSessions.OrderBy(p => p.ThoiGianHoatDongCuoi).First();
                string otp = new Random().Next(100000, 999999).ToString();
                
                // LÆ°u OTP thay tháº¿ thiáº¿t bá»‹ vÃ o cache
                _memoryCache.Set("OTP_ReplaceDevice_" + user.Email, 
                    (Otp: otp, NewMaThietBi: r.MaThietBi, NewTenThietBi: r.TenThietBi, OldMaPhien: oldest.MaPhien), 
                    TimeSpan.FromMinutes(5));

                await EmailHelper.SendEmailAsync(user.Email, "XÃ¡c nháº­n thay tháº¿ thiáº¿t bá»‹ sau khi Ä‘á»•i máº­t kháº©u", 
                    $"Báº¡n vá»«a Ä‘áº·t láº¡i máº­t kháº©u vÃ  Ä‘ang Ä‘Äƒng nháº­p trÃªn thiáº¿t bá»‹ má»›i. Vui lÃ²ng nháº­p mÃ£ <b>{otp}</b> Ä‘á»ƒ Ä‘Äƒng xuáº¥t thiáº¿t bá»‹ <b>{oldest.TenThietBi}</b> vÃ  tiáº¿p tá»¥c vÃ o há»‡ thá»‘ng.");

                return new { 
                    requiresLogoutOldest = true, 
                    oldestDeviceName = oldest.TenThietBi, 
                    email = user.Email, 
                    message = "Äáº·t láº¡i máº­t kháº©u thÃ nh cÃ´ng! Tuy nhiÃªn báº¡n Ä‘Ã£ Ä‘áº¡t giá»›i háº¡n 3 thiáº¿t bá»‹. Vui lÃ²ng xÃ¡c nháº­n thay tháº¿ thiáº¿t bá»‹ Ä‘á»ƒ vÃ o há»‡ thá»‘ng." 
                };
            }

            // 4. Náº¿u há»£p lá»‡ (thiáº¿t bá»‹ cÅ© hoáº·c cÃ²n chá»—) -> Tá»± Ä‘á»™ng Ä‘Äƒng nháº­p
            var loginResult = await XuLyDangNhapThanhCongAsync(user, r.MaThietBi, r.TenThietBi);
            
            // Tráº£ vá» cáº£ message thÃ´ng bÃ¡o thÃ nh cÃ´ng vÃ  dá»¯ liá»‡u Ä‘Äƒng nháº­p
            return new {
                message = "Äáº·t láº¡i máº­t kháº©u thÃ nh cÃ´ng vÃ  Ä‘Ã£ tá»± Ä‘á»™ng Ä‘Äƒng nháº­p!",
                loginData = loginResult
            };
        }

        public async Task<bool> DoiMatKhauAsync(int userId, DoiMatKhauRequest r) {
            var user = await _context.NguoiDungs.FindAsync(userId);
            if (user == null) throw new Exception("NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i.");

            if (!BCrypt.Net.BCrypt.Verify(r.MatKhauCu, user.MatKhau))
                throw new Exception("Máº­t kháº©u hiá»‡n táº¡i khÃ´ng chÃ­nh xÃ¡c.");

            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(r.MatKhauMoi);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<object> LayDanhSachThietBiAsync(int userId, string maThietBiHienTai) {
            var sessions = await _context.PhienDangNhaps
                .Where(p => p.MaNguoiDung == userId && p.DangHoatDong)
                .OrderByDescending(p => p.ThoiGianHoatDongCuoi)
                .ToListAsync();

            // So sÃ¡nh dá»±a trÃªn mÃ£ Fingerprint (maThietBiHienTai gá»­i tá»« FE lÃªn)
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
        public async Task<object> DangKyGiangVienAsync(DangKyGiangVienRequest request)
        {
            var email = request.Email.Trim().ToLower();
            var taiKhoan = request.TaiKhoan.Trim();
            var soGiayTo = request.SoGiayTo.Trim();

            // 1. Kiểm tra trùng với tài khoản đã hoạt động (NguoiDungs)
            if (await _context.NguoiDungs.AnyAsync(u => u.Email.ToLower() == email))
                throw new Exception("Email này đã được sử dụng bởi một tài khoản khác.");

            if (await _context.NguoiDungs.AnyAsync(u => u.TaiKhoan == taiKhoan))
                throw new Exception("Tên tài khoản này đã tồn tại.");

            // 2. Kiểm tra trùng trong hồ sơ đang xử lý (chưa bị từ chối hẳn)
            if (await _context.HoSoDangKyGiangViens.AnyAsync(x => x.Email == email && x.TrangThaiHoSo != "TuChoi"))
                throw new Exception("Email này đang có hồ sơ chờ xử lý. Vui lòng tra cứu trạng thái hồ sơ để cập nhật.");

            if (await _context.HoSoDangKyGiangViens.AnyAsync(x => x.SoGiayTo == soGiayTo && x.TrangThaiHoSo != "TuChoi"))
                throw new Exception("Số giấy tờ này đang có hồ sơ chờ xử lý.");

            // 3. Validate file upload (chỉ chấp nhận ảnh, tối đa 5MB)
            const long MaxFileSize = 5 * 1024 * 1024;

            void ValidateFile(IFormFile f, string label)
            {
                if (f == null || f.Length == 0)
                    throw new Exception($"Vui lòng tải lên {label}.");
                if (f.Length > MaxFileSize)
                    throw new Exception($"{label} vượt quá 5MB.");
                var ext = Path.GetExtension(f.FileName);
                if (!_allowedImgExtensions.Contains(ext))
                    throw new Exception($"{label} phải là ảnh JPG, PNG hoặc WEBP.");
                if (!f.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                    throw new Exception($"{label} không phải là file ảnh hợp lệ.");
            }

            ValidateFile(request.AnhGiayToMatTruoc, "ảnh mặt trước giấy tờ");
            ValidateFile(request.AnhGiayToMatSau, "ảnh mặt sau giấy tờ");
            if (request.AnhDaiDien != null && request.AnhDaiDien.Length > 0)
                ValidateFile(request.AnhDaiDien, "ảnh đại diện");

            // 4. Lưu file upload ( GUID + ext, chống path traversal)
            var uploadRoot = Path.Combine(_env.WebRootPath, "uploads", "dang-ky-giang-vien");
            var avatarRoot = Path.Combine(uploadRoot, "avatars");
            var docRoot = Path.Combine(uploadRoot, "giay-to");
            Directory.CreateDirectory(avatarRoot);
            Directory.CreateDirectory(docRoot);

            string? avatarPath = null;
            List<string> savedFiles = new();

            try
            {
                if (request.AnhDaiDien != null && request.AnhDaiDien.Length > 0)
                {
                    avatarPath = await LuuFileAsync(request.AnhDaiDien, avatarRoot, "/uploads/dang-ky-giang-vien/avatars");
                    savedFiles.Add(Path.Combine(avatarRoot, Path.GetFileName(avatarPath)));
                }

                var frontPath = await LuuFileAsync(request.AnhGiayToMatTruoc, docRoot, "/uploads/dang-ky-giang-vien/giay-to");
                savedFiles.Add(Path.Combine(docRoot, Path.GetFileName(frontPath)));

                var backPath = await LuuFileAsync(request.AnhGiayToMatSau, docRoot, "/uploads/dang-ky-giang-vien/giay-to");
                savedFiles.Add(Path.Combine(docRoot, Path.GetFileName(backPath)));

                // 5. Tạo hồ sơ đăng ký trong transaction (bọc trong execution strategy vì Npgsql retry không cho BeginTransaction trực tiếp)
                var strategy = _context.Database.CreateExecutionStrategy();
                long maHoSoTao = 0;
                string trangThaiTao = string.Empty;

                await strategy.ExecuteAsync(async () =>
                {
                    await using var tx = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        var hoSo = new HoSoDangKyGiangVienModel
                        {
                            // MaNguoiDung = null (chưa có tài khoản - admin duyệt sẽ tạo)
                            HoTen = request.HoTen.Trim(),
                            Email = email,
                            TaiKhoan = taiKhoan,
                            MatKhau = BCrypt.Net.BCrypt.HashPassword(request.MatKhau),
                            SoDienThoai = request.SoDienThoai?.Trim(),
                            LinhVucGiangDay = request.LinhVucGiangDay.Trim(),
                            TieuSu = request.TieuSu.Trim(),
                            LinkedInUrl = request.LinkedInUrl?.Trim(),
                            WebsiteUrl = request.WebsiteUrl?.Trim(),
                            LoaiGiayTo = request.LoaiGiayTo.Trim(),
                            SoGiayTo = soGiayTo,
                            AnhDaiDienUrl = avatarPath,
                            AnhGiayToMatTruocUrl = frontPath,
                            AnhGiayToMatSauUrl = backPath,
                            PhuongThucThanhToan = request.PhuongThucThanhToan.Trim(),
                            TenNganHang = request.TenNganHang?.Trim(),
                            SoTaiKhoanNhanTien = request.SoTaiKhoanNhanTien?.Trim(),
                            TenChuTaiKhoan = request.TenChuTaiKhoan?.Trim(),
                            MaSoThue = request.MaSoThue?.Trim(),
                            TrangThaiHoSo = "ChoDuyet",
                            NgayTao = DateTime.UtcNow,
                            NgayCapNhat = DateTime.UtcNow
                        };

                        _context.HoSoDangKyGiangViens.Add(hoSo);
                        await _context.SaveChangesAsync();
                        await tx.CommitAsync();

                        maHoSoTao = hoSo.MaHoSoDangKyGiangVien;
                        trangThaiTao = hoSo.TrangThaiHoSo;
                    }
                    catch
                    {
                        await tx.RollbackAsync();
                        // Dọn file đã lưu nếu DB fail
                        foreach (var p in savedFiles)
                        {
                            try { if (File.Exists(p)) File.Delete(p); } catch { }
                        }
                        throw;
                    }
                });

                _memoryCache.Remove("VERIFIED_InstructorEmail_" + email);

                return new
                {
                    success = true,
                    message = "Hồ sơ giảng viên đã được gửi và đang chờ duyệt.",
                    maHoSo = maHoSoTao,
                    trangThai = trangThaiTao
                };
            }
            catch
            {
                // Dọn file nếu lỗi trước khi vào transaction
                foreach (var p in savedFiles)
                {
                    try { if (File.Exists(p)) File.Delete(p); } catch { }
                }
                throw;
            }
        }


        private static readonly HashSet<string> _allowedImgExtensions = new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp" };
        private const long _maxFileSize = 5 * 1024 * 1024;

        private static async Task<string> LuuFileAsync(IFormFile file, string folderPath, string publicPrefix)
        {
            // Validate phòng vệ (layer 2)
            var ext = Path.GetExtension(file.FileName);
            if (!_allowedImgExtensions.Contains(ext) || file.Length > _maxFileSize)
                throw new Exception("File không hợp lệ.");

            var fileName = $"{Guid.NewGuid()}{ext.ToLowerInvariant()}";
            var fullPath = Path.Combine(folderPath, fileName);
            await using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream);
            return $"{publicPrefix}/{fileName}";
        }


        /// <summary>
        /// Giảng viên tra cứu trạng thái hồ sơ đăng ký theo email (public, không cần token).
        /// </summary>
        public async Task<object> TraCuuTrangThaiHoSoAsync(string email)
        {
            var normalizedEmail = email.Trim().ToLower();
            if (string.IsNullOrWhiteSpace(normalizedEmail))
                throw new Exception("Vui lòng nhập email.");

            var hoSo = await _context.HoSoDangKyGiangViens
                .AsNoTracking()
                .Where(x => x.Email == normalizedEmail)
                .OrderByDescending(x => x.NgayTao)
                .Select(x => new
                {
                    x.MaHoSoDangKyGiangVien,
                    x.HoTen,
                    x.Email,
                    x.TrangThaiHoSo,
                    x.LyDoTuChoi,
                    x.NgayTao,
                    x.NgayCapNhat,
                    x.NgayDuyet,
                    x.DaNopBoSung,
                    x.NgayNopBoSung
                })
                .FirstOrDefaultAsync();

            if (hoSo == null)
                throw new Exception("Không tìm thấy hồ sơ đăng ký với email này.");

            string trangThaiHienThi = hoSo.TrangThaiHoSo switch
            {
                "ChoDuyet" => "Đang chờ duyệt",
                "CanBoSung" => "Cần bổ sung thông tin",
                "DaDuyet" => "Đã được duyệt",
                "TuChoi" => "Đã bị từ chối",
                _ => hoSo.TrangThaiHoSo
            };

            return new
            {
                success = true,
                maHoSo = hoSo.MaHoSoDangKyGiangVien,
                hoTen = hoSo.HoTen,
                email = hoSo.Email,
                trangThai = hoSo.TrangThaiHoSo,
                trangThaiHienThi,
                lyDo = hoSo.LyDoTuChoi,
                ngayTao = hoSo.NgayTao,
                ngayCapNhat = hoSo.NgayCapNhat,
                ngayDuyet = hoSo.NgayDuyet
            };
        }



        /// <summary>
        /// Kiểm tra quyền bổ sung hồ sơ: hợp lệ khi hồ sơ ở trạng thái CanBoSung, token đúng, còn hạn, và chưa nộp bổ sung.
        /// </summary>
        public async Task<object> KiemTraQuyenBoSungHoSoAsync(long maHoSo, string token)
        {
            var hoSo = await _context.HoSoDangKyGiangViens
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaHoSoDangKyGiangVien == maHoSo);
            if (hoSo == null)
                throw new Exception("Không tìm thấy hồ sơ đăng ký.");

            if (hoSo.TrangThaiHoSo != "CanBoSung")
                throw new Exception("Hồ sơ không ở trạng thái cần bổ sung.");

            if (string.IsNullOrWhiteSpace(token) || hoSo.BoSungToken != token.Trim() || hoSo.BoSungTokenHetHan <= DateTime.UtcNow)
                throw new Exception("Mã xác thực không hợp lệ hoặc đã hết hạn.");

            if (hoSo.DaNopBoSung)
                throw new Exception("Hồ sơ đã được gửi bổ sung. Vui lòng đợi kết quả.");

            return new { valid = true };
        }
        /// <summary>
        /// Giảng viên nộp lại hồ sơ bổ sung (chỉ áp dụng khi trạng thái = CanBoSung).
        /// </summary>
        public async Task<object> BoSungHoSoAsync(long maHoSo, BoSungHoSoRequest request)
        {
            var hoSo = await _context.HoSoDangKyGiangViens
                .FirstOrDefaultAsync(x => x.MaHoSoDangKyGiangVien == maHoSo);
            if (hoSo == null)
                throw new Exception("Không tìm thấy hồ sơ đăng ký.");

            if (hoSo.TrangThaiHoSo != "CanBoSung")
                throw new Exception("Hồ sơ không ở trạng thái cần bổ sung. Không thể cập nhật.");

            // Verify token xác thực bổ sung
            var tokenNhap = request.Token?.Trim();
            if (string.IsNullOrEmpty(tokenNhap) || hoSo.BoSungToken != tokenNhap || hoSo.BoSungTokenHetHan <= DateTime.UtcNow)
                throw new Exception("Mã xác thực bổ sung không hợp lệ hoặc đã hết hạn.");
            if (hoSo.DaNopBoSung)
                throw new Exception("Hồ sơ đã được gửi bổ sung. Vui lòng đợi kết quả.");

            // Cập nhật thông tin text nếu có
            if (!string.IsNullOrWhiteSpace(request.HoTen)) hoSo.HoTen = request.HoTen.Trim();
            if (!string.IsNullOrWhiteSpace(request.TieuSu)) hoSo.TieuSu = request.TieuSu.Trim();
            if (!string.IsNullOrWhiteSpace(request.LinhVucGiangDay)) hoSo.LinhVucGiangDay = request.LinhVucGiangDay.Trim();
            if (!string.IsNullOrWhiteSpace(request.SoDienThoai)) hoSo.SoDienThoai = request.SoDienThoai.Trim();
            if (request.LinkedInUrl != null) hoSo.LinkedInUrl = request.LinkedInUrl.Trim();
            if (request.WebsiteUrl != null) hoSo.WebsiteUrl = request.WebsiteUrl.Trim();
            if (!string.IsNullOrWhiteSpace(request.SoGiayTo)) hoSo.SoGiayTo = request.SoGiayTo.Trim();
            if (!string.IsNullOrWhiteSpace(request.TenNganHang)) hoSo.TenNganHang = request.TenNganHang.Trim();
            if (!string.IsNullOrWhiteSpace(request.SoTaiKhoanNhanTien)) hoSo.SoTaiKhoanNhanTien = request.SoTaiKhoanNhanTien.Trim();
            if (!string.IsNullOrWhiteSpace(request.TenChuTaiKhoan)) hoSo.TenChuTaiKhoan = request.TenChuTaiKhoan.Trim();
            if (request.MaSoThue != null) hoSo.MaSoThue = request.MaSoThue.Trim();

            // Cập nhật file mới nếu có
            var uploadRoot = Path.Combine(_env.WebRootPath, "uploads", "dang-ky-giang-vien");
            var avatarRoot = Path.Combine(uploadRoot, "avatars");
            var docRoot = Path.Combine(uploadRoot, "giay-to");
            Directory.CreateDirectory(avatarRoot);
            Directory.CreateDirectory(docRoot);

            string? oldAvatar = hoSo.AnhDaiDienUrl, oldFront = hoSo.AnhGiayToMatTruocUrl, oldBack = hoSo.AnhGiayToMatSauUrl;

            if (request.AnhDaiDien != null && request.AnhDaiDien.Length > 0)
            {
                var p = await LuuFileAsync(request.AnhDaiDien, avatarRoot, "/uploads/dang-ky-giang-vien/avatars");
                hoSo.AnhDaiDienUrl = p;
            }
            if (request.AnhGiayToMatTruoc != null && request.AnhGiayToMatTruoc.Length > 0)
            {
                var p = await LuuFileAsync(request.AnhGiayToMatTruoc, docRoot, "/uploads/dang-ky-giang-vien/giay-to");
                hoSo.AnhGiayToMatTruocUrl = p;
            }
            if (request.AnhGiayToMatSau != null && request.AnhGiayToMatSau.Length > 0)
            {
                var p = await LuuFileAsync(request.AnhGiayToMatSau, docRoot, "/uploads/dang-ky-giang-vien/giay-to");
                hoSo.AnhGiayToMatSauUrl = p;
            }

            // Đặt lại trạng thái chờ duyệt
            hoSo.TrangThaiHoSo = "ChoDuyet";
            hoSo.LyDoTuChoi = null;
            hoSo.NgayCapNhat = DateTime.UtcNow;
            // Đánh dấu đã nộp bổ sung và vô hiệu hóa token
            hoSo.DaNopBoSung = true;
            hoSo.NgayNopBoSung = DateTime.UtcNow;
            hoSo.BoSungToken = null;
            hoSo.BoSungTokenHetHan = null;
            await _context.SaveChangesAsync();

            // Dọn file cũ đã thay (tránh rác ổ đĩa)
            static void XoaFileCu(string? url, string webRoot)
            {
                if (string.IsNullOrWhiteSpace(url)) return;
                try
                {
                    var rel = url.TrimStart('/');
                    var full = Path.Combine(webRoot, rel.Replace('/', Path.DirectorySeparatorChar));
                    if (File.Exists(full)) File.Delete(full);
                }
                catch { }
            }
            if (request.AnhDaiDien != null && request.AnhDaiDien.Length > 0) XoaFileCu(oldAvatar, _env.WebRootPath);
            if (request.AnhGiayToMatTruoc != null && request.AnhGiayToMatTruoc.Length > 0) XoaFileCu(oldFront, _env.WebRootPath);
            if (request.AnhGiayToMatSau != null && request.AnhGiayToMatSau.Length > 0) XoaFileCu(oldBack, _env.WebRootPath);

            return new
            {
                success = true,
                message = "Đã cập nhật hồ sơ và gửi lại để duyệt.",
                maHoSo = hoSo.MaHoSoDangKyGiangVien,
                trangThai = hoSo.TrangThaiHoSo
            };
        }
        #endregion
    }
}

