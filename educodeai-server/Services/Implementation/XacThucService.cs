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
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace educodeai_server.Services.Implementation
{
    public class XacThucService : IXacThucService
    {
        private const string RefreshCookieName = "ecai_rt";

        // E.3: hash BCrypt hợp lệ tính một lần lúc load để chạy Verify giả khi user không tồn tại,
        // giữ thời gian phản hồi đồng đều chống timing enumeration. Không phải mật khẩu thật.
        private static readonly string DummyBcryptHash = BCrypt.Net.BCrypt.HashPassword("dummy-timing-guard");

        private readonly EduCodeAIDbContext _context;
        private readonly IConfiguration _config;
        private readonly ICaptchaService _captchaService;
        private readonly IMemoryCache _memoryCache;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWebHostEnvironment _env;
        private readonly IGiayToScanningService _giayToScanningService;
        private readonly IDataProtector _cccdDataProtector;
        private readonly ITokenService _tokenService;
        private readonly ISessionStateCache _sessionStateCache;
        private readonly ISessionRealtimeNotifier _sessionRealtimeNotifier;
        private readonly IOtpService _otpService;
        private readonly IOtpRateLimiter _otpRateLimiter;
        private readonly ILogger<XacThucService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;

        public XacThucService(EduCodeAIDbContext context, IConfiguration config, ICaptchaService captchaService, IMemoryCache memoryCache, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment env, IGiayToScanningService giayToScanningService, IDataProtectionProvider dataProtectionProvider, ITokenService tokenService, ISessionStateCache sessionStateCache, ISessionRealtimeNotifier sessionRealtimeNotifier, IOtpService otpService, IOtpRateLimiter otpRateLimiter, ILogger<XacThucService> logger, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _config = config;
            _captchaService = captchaService;
            _memoryCache = memoryCache;
            _httpContextAccessor = httpContextAccessor;
            _env = env;
            _giayToScanningService = giayToScanningService;
            _cccdDataProtector = dataProtectionProvider.CreateProtector("EduCodeAI.CCCD.OcrData.v1");
            _tokenService = tokenService;
            _sessionStateCache = sessionStateCache;
            _sessionRealtimeNotifier = sessionRealtimeNotifier;
            _otpService = otpService;
            _otpRateLimiter = otpRateLimiter;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        // IP client cho rate-limit; null nếu không xác định được (rate-limiter tự bỏ qua phần IP).
        private string? ClientIp() =>
            _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();

        // Verify CAPTCHA server-side (D.4). "SKIP_CAPTCHA" chỉ được chấp nhận ngoài production (D.5):
        // dev/test cho qua để tự động hóa, production luôn bắt buộc token hợp lệ.
        private async Task XacThucCaptchaHoacNemAsync(string? captchaToken)
        {
            if (!_env.IsProduction()
                && (string.IsNullOrEmpty(captchaToken) || captchaToken == "SKIP_CAPTCHA"))
            {
                return;
            }

            if (string.IsNullOrEmpty(captchaToken) || captchaToken == "SKIP_CAPTCHA")
                throw ApiException.InvalidRequest("Vui lòng xác thực CAPTCHA.");

            var ok = await _captchaService.XacNhanCaptchaAsync(captchaToken);
            if (!ok)
                throw ApiException.InvalidRequest("Mã CAPTCHA không hợp lệ hoặc đã hết hạn.");
        }

        // Password policy dùng chung cho reset và change (F.3): tối thiểu 8 ký tự, không chứa phần local
        // của email (dễ đoán), và không trùng mật khẩu cũ. currentHash null nghĩa là không có mật khẩu cũ để so.
        private static void KiemTraPasswordPolicyHoacNem(string? matKhauMoi, string? email, string? currentHash)
            => PasswordPolicy.KiemTraHoacNem(matKhauMoi, email, currentHash);


        #region 1. LUá»’NG ÄÄ‚NG NHáº¬P

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
                                   remaining.TotalHours >= 1 ? $"{(int)remaining.TotalHours} giá»" :
                                   remaining.TotalMinutes >= 1 ? $"{(int)remaining.TotalMinutes} phút" :
                                   $"{(int)remaining.TotalSeconds} giây";
                    throw ApiException.Forbidden($"Tài khoản bị khóa. Lý do: {user.LyDoKhoa}. Còn lại: {timeStr}");
                }
            }
            else if (string.Equals(user.TrangThai, "Khóa vĩnh viễn", StringComparison.OrdinalIgnoreCase) || 
                     string.Equals(user.TrangThai, "Bị khóa", StringComparison.OrdinalIgnoreCase))
            {
                throw ApiException.Forbidden($"Tài khoản bị khóa vĩnh viễn. Lý do: {user.LyDoKhoa}");
            }
        }

        public async Task<object> DangNhapAsync(DangNhapRequest request, string ipAddress)
        {
            // 1. XÃ¡c Ä‘á»‹nh Key Ä‘áº¿m sá»‘ láº§n sai dá»±a trÃªn IP (á»”n Ä‘á»‹nh nháº¥t Ä‘á»ƒ cháº·n spam unauthenticated)
            string cleanIp = string.IsNullOrEmpty(ipAddress) ? "unknown" : ipAddress.Replace(":", "_").Replace(".", "_");
            string cacheKey = $"FailedLogin_IP_{cleanIp}";
            int failedAttempts = _memoryCache.Get<int?>(cacheKey) ?? 0;

            // E.1: đếm sai theo cả normalized account, không chỉ IP — chặn credential stuffing phân tán IP
            // nhắm một tài khoản. Ngưỡng account cao hơn IP một chút vì có thể có nhiều thiết bị hợp lệ.
            string normalizedAccount = (request.TaiKhoan ?? string.Empty).Trim().ToLowerInvariant();
            string accountCacheKey = $"FailedLogin_Acc_{normalizedAccount}";
            int failedAccountAttempts = _memoryCache.Get<int?>(accountCacheKey) ?? 0;

            // 2. Nếu đã sai quá ngưỡng (theo IP HOẶC theo account), bắt buộc check Captcha
            if (failedAttempts >= 3 || failedAccountAttempts >= 5)
            {
                if (string.IsNullOrEmpty(request.CaptchaToken) || request.CaptchaToken == "SKIP_CAPTCHA")
                {
                    return new { 
                        requiresCaptcha = true, 
                        message = "Bạn đã nhập sai quá 3 lần. Vui lòng xác thực CAPTCHA." 
                    };
                }

                // XÃ¡c thá»±c Captcha tháº­t vá»›i Google
                bool isCaptchaValid = await _captchaService.XacNhanCaptchaAsync(request.CaptchaToken);
                if (!isCaptchaValid) throw ApiException.InvalidRequest("Mã CAPTCHA không hợp lệ hoặc đã hết hạn.");
                
                // GIáº¢I ÄÃšNG CAPTCHA -> XÃ“A Sáº CH Sá» Láº¦N SAI Vá»€ 0
                _memoryCache.Remove(cacheKey);
                _memoryCache.Remove(accountCacheKey);
                failedAttempts = 0;
                failedAccountAttempts = 0;
            }

            // 3. TÃ¬m user trong Database
            var user = await LayNguoiDungKemThietBiAsync(request.TaiKhoan);
            
            // 4. Kiá»ƒm tra tÃ­nh há»£p lá»‡ (TÃ i khoáº£n tá»“n táº¡i + Máº­t kháº©u Ä‘Ãºng)
            // E.3: chống timing enumeration — khi user không tồn tại vẫn chạy một BCrypt.Verify giả
            // (dummy hash) để thời gian phản hồi đồng đều với trường hợp user tồn tại nhưng sai mật khẩu.
            bool isLoginValid;
            if (user != null)
            {
                isLoginValid = BCrypt.Net.BCrypt.Verify(request.MatKhau, user.MatKhau);
            }
            else
            {
                BCrypt.Net.BCrypt.Verify(request.MatKhau, DummyBcryptHash);
                isLoginValid = false;
            }

            if (!isLoginValid)
            {
                failedAttempts++;
                failedAccountAttempts++;
                _memoryCache.Set(cacheKey, failedAttempts, TimeSpan.FromMinutes(30));
                _memoryCache.Set(accountCacheKey, failedAccountAttempts, TimeSpan.FromMinutes(30));

                // K.1: audit login fail — không log tài khoản/mật khẩu, chỉ userId (nếu tồn tại) + IP + số lần sai.
                _logger.LogWarning("Đăng nhập thất bại cho user {UserId} từ IP {Ip} (lần {FailedAttempts}).",
                    user?.MaNguoiDung, ClientIp(), failedAttempts);
                
                // Náº¿u Ä‘Ã¢y lÃ  láº§n thá»­ ngay sau khi giáº£i Captcha (failedAttempts vá»«a reset vá» 0 vÃ  tÄƒng lÃªn 1)
                if (failedAttempts == 1 && !string.IsNullOrEmpty(request.CaptchaToken) && request.CaptchaToken != "SKIP_CAPTCHA")
                {
                    throw ApiException.InvalidRequest("Xác minh thành công! Vui lòng kiểm tra và nhập lại chính xác tài khoản, mật khẩu.");
                }

                if (failedAttempts >= 3) {
                    return new { requiresCaptcha = true, message = "Bạn đã nhập sai quá 3 lần. Vui lòng xác thực CAPTCHA." };
                }

                throw ApiException.InvalidRequest($"Tài khoản hoặc mật khẩu không chính xác. (Lần {failedAttempts}/3)");
            }

            // 5. Náº¿u Ä‘Äƒng nháº­p Ä‘Ãºng thÃ´ng tin -> Kiá»ƒm tra tÃ i khoáº£n cÃ³ bá»‹ Admin khÃ³a khÃ´ng
            await KiemTraTrangThaiKhoaAsync(user!);

            // ÄÄ‚NG NHáº¬P THÃ€NH CÃ”NG -> RESET Sá» Láº¦N SAI CHO IP NÃ€Y
            _memoryCache.Remove(cacheKey);

            // 6. KIá»‚M TRA THIáº¾T Bá»Š (Má»šI / CÅ¨ / Äáº¦Y PHIÃŠN)
            _memoryCache.Remove(accountCacheKey);
            _logger.LogInformation("Đăng nhập thành công cho user {UserId}.", user!.MaNguoiDung);

            var activeSessions = user!.DanhSachPhienDangNhap.Where(p => p.DangHoatDong).ToList();
            var currentSession = activeSessions.FirstOrDefault(p => p.MaThietBi == request.MaThietBi);

            // Náº¿u thiáº¿t bá»‹ nÃ y CHÆ¯A Tá»ªNG Ä‘Äƒng nháº­p (hoáº·c Ä‘Ã£ bá»‹ Ä‘Äƒng xuáº¥t/xÃ³a phiÃªn)
            if (currentSession == null)
            {
                // TRÆ¯á»œNG Há»¢P A: ÄÃ£ Ä‘á»§ 3 thiáº¿t bá»‹ -> YÃªu cáº§u OTP Ä‘á»ƒ thay tháº¿ thiáº¿t bá»‹ cÅ© nháº¥t
                if (activeSessions.Count >= 3)
                {
                    var oldest = activeSessions.OrderBy(p => p.ThoiGianHoatDongCuoi).First();
                    var replacePayload = JsonSerializer.Serialize(new ThayTheThietBiOtpPayload(request.MaThietBi, request.TenThietBi, oldest.MaPhien));
                    string otp = await _otpService.CreateOtpAsync(OtpPurpose.ReplaceDevice, user.Email, replacePayload);

                    string body = TaoGiaoDienEmail("Xác nhận thay thế thiết bị", $"Bạn đang đăng nhập trên một thiết bị mới. Vì tài khoản đã đạt giới hạn 3 thiết bị, vui lòng nhập mã bên dưới để đăng xuất thiết bị <b>{oldest.TenThietBi}</b> và tiếp tục.", otp);
                    await EmailHelper.SendEmailAsync(user.Email, "Xác nhận thay thế thiết bị - EduCodeAI", body);
                    
                    return new { requiresLogoutOldest = true, oldestDeviceName = oldest.TenThietBi, email = user.Email, message = $"Tài khoản đã đạt giới hạn 3 thiết bị. Hệ thống đã gửi mã xác nhận thay thế thiết bị {oldest.TenThietBi} đến Email của bạn." };
                }
                
                // TRÆ¯á»œNG Há»¢P B: ChÆ°a Ä‘á»§ 3 thiáº¿t bá»‹ nhÆ°ng lÃ  THIáº¾T Bá»Š Má»šI -> YÃªu cáº§u OTP xÃ¡c minh thiáº¿t bá»‹ má»›i
                else
                {
                    var newDevicePayload = JsonSerializer.Serialize(new ThietBiOtpPayload(request.MaThietBi, request.TenThietBi));
                    string otp = await _otpService.CreateOtpAsync(OtpPurpose.LoginNewDevice, user.Email, newDevicePayload);

                    string body = TaoGiaoDienEmail("Xác minh thiết bị mới", $"Hệ thống phát hiện bạn đang đăng nhập trên một thiết bị lạ. Để bảo vệ tài khoản, vui lòng nhập mã xác thực bên dưới để hoàn tất đăng nhập.", otp);
                    await EmailHelper.SendEmailAsync(user.Email, "Xác minh thiết bị mới - EduCodeAI", body);
                    
                    return new { requiresOtp = true, email = user.Email, message = "Bạn đang đăng nhập trên thiết bị mới. Vui lòng nhập mã OTP đã được gửi đến Email để xác minh." };
                }
            }

            // Náº¿u lÃ  thiáº¿t bá»‹ cÅ© Ä‘Ã£ quen -> Cho vÃ o luÃ´n
            return await XuLyDangNhapThanhCongAsync(user, request.MaThietBi, request.TenThietBi);
        }

        // API Má»šI: XÃ¡c nháº­n OTP Ä‘á»ƒ Ä‘Ã¡ thiáº¿t bá»‹ cÅ© vÃ  cho thiáº¿t bá»‹ má»›i vÃ o
        public async Task<object> XacNhanThayTheThietBiAsync(XacNhanOtpRequest r) {
            var user = await LayNguoiDungKemThietBiAsync(r.TaiKhoan);
            if (user == null) throw ApiException.InvalidRequest("NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i.");

            if (!await _otpRateLimiter.TryConsumeVerifyAsync(OtpPurpose.ReplaceDevice, user.Email, ClientIp()))
                throw ApiException.InvalidRequest("Bạn thao tác quá nhiều lần. Vui lòng thử lại sau ít phút.");

            var verify = await _otpService.VerifyOtpAsync(OtpPurpose.ReplaceDevice, user.Email, r.OtpCode);
            if (!verify.Success)
                throw ApiException.InvalidRequest(verify.ErrorMessage ?? "Mã OTP không chính xác hoặc đã hết hạn.");

            var payload = JsonSerializer.Deserialize<ThayTheThietBiOtpPayload>(verify.PayloadJson ?? "{}")
                          ?? throw ApiException.InvalidRequest("Dữ liệu xác thực không hợp lệ.");

            // 1. ÄÄƒng xuáº¥t thiáº¿t bá»‹ cÅ© nháº¥t
            var oldestSession = user.DanhSachPhienDangNhap.FirstOrDefault(p => p.MaPhien == payload.OldMaPhien);
            if (oldestSession != null) oldestSession.DangHoatDong = false;

            // 2. Xá»­ lÃ½ Ä‘Äƒng nháº­p cho thiáº¿t bá»‹ má»›i
            return await XuLyDangNhapThanhCongAsync(user, payload.NewMaThietBi, payload.NewTenThietBi);
        }

        public async Task<object> DangNhapGoogleAsync(GoogleLoginRequest request, string maThietBi, string tenThietBi)
        {
            // E.5: verify id_token với Google — KHÔNG tin email/name/picture do client tự gửi.
            var clientId = _config["SocialLogin:Google:ClientId"];
            if (string.IsNullOrWhiteSpace(clientId))
                throw ApiException.InvalidRequest("Đăng nhập Google chưa được cấu hình.");
            if (string.IsNullOrWhiteSpace(request.Credential))
                throw ApiException.InvalidRequest("Thiếu thông tin xác thực Google.");

            Google.Apis.Auth.GoogleJsonWebSignature.Payload payload;
            try
            {
                payload = await Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(
                    request.Credential,
                    new Google.Apis.Auth.GoogleJsonWebSignature.ValidationSettings
                    {
                        // Chỉ chấp nhận token phát cho client ID của ứng dụng này (chống token của app khác).
                        Audience = new[] { clientId }
                    });
            }
            catch (Exception)
            {
                // ValidateAsync đã kiểm chữ ký, issuer, audience, expiry. Lỗi bất kỳ → từ chối.
                throw ApiException.AuthenticationFailed("Xác thực Google không hợp lệ.");
            }

            // Chỉ dùng identity từ payload đã verify; bỏ qua mọi dữ liệu client gửi kèm.
            if (!payload.EmailVerified || string.IsNullOrWhiteSpace(payload.Email))
                throw ApiException.AuthenticationFailed("Email Google chưa được xác minh.");

            var user = await LinkHoacTaoUserSocialAsync(payload.Email, payload.Name, payload.Picture, "Google");
            await KiemTraTrangThaiKhoaAsync(user);
            _logger.LogInformation("Đăng nhập Google thành công cho user {UserId}.", user.MaNguoiDung);
            return await XuLyDangNhapThanhCongAsync(user, maThietBi, tenThietBi);
        }

        // Link vào tài khoản email đã tồn tại (đăng ký thường hoặc provider khác) hoặc tạo mới nếu chưa có.
        // Email đã được provider verify nên link an toàn. VaiTro luôn = 2, không nhận từ client.
        private async Task<NguoiDungModel> LinkHoacTaoUserSocialAsync(string email, string? name, string? picture, string provider)
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();
            var user = await _context.NguoiDungs
                .Include(u => u.DanhSachPhienDangNhap)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

            if (user == null)
            {
                user = new NguoiDungModel
                {
                    Email = normalizedEmail,
                    HoTen = name ?? normalizedEmail,
                    AnhDaiDien = picture,
                    TaiKhoan = normalizedEmail,
                    MatKhau = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                    VaiTro = 2,
                    TrangThai = "Hoạt động",
                    NgayThamGia = DateTime.UtcNow
                };
                _context.NguoiDungs.Add(user);
                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateException)
                {
                    // Race: user khác vừa tạo cùng email — nạp lại bản ghi đã có để link.
                    user = await _context.NguoiDungs
                        .Include(u => u.DanhSachPhienDangNhap)
                        .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail)
                        ?? throw ApiException.AuthenticationFailed("Không thể tạo tài khoản.");
                }
            }

            return user;
        }

        public async Task<object> DangNhapFacebookAsync(FacebookDTO request, string maThietBi, string tenThietBi)
        {
            // E.6: verify access token với Facebook — KHÔNG tin email/name do client tự gửi.
            var appId = _config["SocialLogin:Facebook:AppId"];
            var appSecret = _config["SocialLogin:Facebook:AppSecret"];
            if (string.IsNullOrWhiteSpace(appId) || string.IsNullOrWhiteSpace(appSecret))
                throw ApiException.InvalidRequest("Đăng nhập Facebook chưa được cấu hình.");
            if (string.IsNullOrWhiteSpace(request.AccessToken))
                throw ApiException.InvalidRequest("Thiếu thông tin xác thực Facebook.");

            var (email, name, picture) = await XacThucFacebookTokenAsync(request.AccessToken, appId, appSecret);
            if (string.IsNullOrWhiteSpace(email))
                throw ApiException.AuthenticationFailed("Tài khoản Facebook không chia sẻ email hợp lệ.");

            var user = await LinkHoacTaoUserSocialAsync(email, name, picture, "Facebook");
            await KiemTraTrangThaiKhoaAsync(user);
            _logger.LogInformation("Đăng nhập Facebook thành công cho user {UserId}.", user.MaNguoiDung);
            return await XuLyDangNhapThanhCongAsync(user, maThietBi, tenThietBi);
        }

        // Verify token với Graph API: debug_token xác nhận token thuộc đúng app + còn hiệu lực,
        // rồi lấy profile từ /me. Chỉ trả identity do Facebook cung cấp, không tin client.
        private async Task<(string? Email, string? Name, string? Picture)> XacThucFacebookTokenAsync(
            string accessToken, string appId, string appSecret)
        {
            var client = _httpClientFactory.CreateClient();
            try
            {
                var appToken = $"{appId}|{appSecret}";
                var debugUrl = $"https://graph.facebook.com/debug_token?input_token={Uri.EscapeDataString(accessToken)}&access_token={Uri.EscapeDataString(appToken)}";
                using var debugRes = await client.GetAsync(debugUrl);
                if (!debugRes.IsSuccessStatusCode)
                    throw ApiException.AuthenticationFailed("Xác thực Facebook không hợp lệ.");

                using var debugDoc = JsonDocument.Parse(await debugRes.Content.ReadAsStringAsync());
                var data = debugDoc.RootElement.GetProperty("data");
                bool isValid = data.TryGetProperty("is_valid", out var v) && v.GetBoolean();
                string? tokenAppId = data.TryGetProperty("app_id", out var a) ? a.GetString() : null;
                if (!isValid || tokenAppId != appId)
                    throw ApiException.AuthenticationFailed("Xác thực Facebook không hợp lệ.");

                var meUrl = $"https://graph.facebook.com/me?fields=id,name,email,picture&access_token={Uri.EscapeDataString(accessToken)}";
                using var meRes = await client.GetAsync(meUrl);
                if (!meRes.IsSuccessStatusCode)
                    throw ApiException.AuthenticationFailed("Xác thực Facebook không hợp lệ.");

                using var meDoc = JsonDocument.Parse(await meRes.Content.ReadAsStringAsync());
                var root = meDoc.RootElement;
                string? email = root.TryGetProperty("email", out var e) ? e.GetString() : null;
                string? name = root.TryGetProperty("name", out var n) ? n.GetString() : null;
                string? picture = root.TryGetProperty("picture", out var p)
                    && p.TryGetProperty("data", out var pd) && pd.TryGetProperty("url", out var pu)
                    ? pu.GetString() : null;
                return (email, name, picture);
            }
            catch (ApiException)
            {
                throw;
            }
            catch (Exception)
            {
                // Lỗi mạng/parse → từ chối, không lộ chi tiết.
                throw ApiException.AuthenticationFailed("Không xác thực được tài khoản Facebook.");
            }
        }

        public async Task<object> LamMoiTokenAsync(string refreshToken, string maThietBi)
        {
            var httpContext = _httpContextAccessor.HttpContext;

            // Phase C: refresh token đọc từ HttpOnly cookie; giá trị query cũ chỉ dùng để backward compat cho client chưa cập nhật
            string? cookieToken = httpContext?.Request.Cookies[RefreshCookieName];
            string? plainToken = !string.IsNullOrWhiteSpace(cookieToken)
                ? cookieToken
                : (!string.IsNullOrWhiteSpace(refreshToken) ? refreshToken : null);

            if (string.IsNullOrWhiteSpace(plainToken))
            {
                throw ApiException.AuthenticationFailed("Phiên làm việc đã hết hạn hoặc bị đăng xuất.");
            }

            var tokenHash = _tokenService.HashRefreshToken(plainToken);
            var stored = await _context.RefreshTokens
                .FirstOrDefaultAsync(r => r.TokenHash == tokenHash);

            // Không thấy hash trong DB → token không hợp lệ. Không có fallback cấp phiên mới
            // để tránh đường cấp token bỏ qua rotation/reuse-detection (Phase C).
            if (stored == null)
            {
                throw ApiException.AuthenticationFailed("Phiên làm việc đã hết hạn hoặc bị đăng xuất.");
            }

            // Phát hiện reuse: token đã bị revoke hoặc đã có replacement -> revoke toàn bộ family
            if (stored.NgayThuHoi.HasValue || !string.IsNullOrEmpty(stored.ReplacedByTokenHash))
            {
                var ipReuse = httpContext?.Connection.RemoteIpAddress?.ToString();
                var familyTokens = await _context.RefreshTokens
                    .Where(r => r.FamilyId == stored.FamilyId && r.NgayThuHoi == null)
                    .ToListAsync();
                foreach (var t in familyTokens)
                {
                    t.NgayThuHoi = DateTime.UtcNow;
                    t.LyDoThuHoi = "REUSE_DETECTED";
                    t.IpThuHoi = ipReuse;
                }

                if (stored.MaPhien.HasValue)
                {
                    var phienReuse = await _context.PhienDangNhaps.FirstOrDefaultAsync(p => p.MaPhien == stored.MaPhien.Value);
                    if (phienReuse != null) phienReuse.DangHoatDong = false;
                }

                await _context.SaveChangesAsync();
                ClearRefreshCookie();
                // K.1: reuse token là sự kiện bảo mật cao — log để điều tra (không log giá trị token).
                _logger.LogWarning("Phát hiện reuse refresh token, revoke family {FamilyId} của user {UserId} từ IP {Ip}.",
                    stored.FamilyId, stored.MaNguoiDung, ipReuse);
                throw ApiException.AuthenticationFailed("Phiên làm việc đã bị vô hiệu hóa do phát hiện sử dụng lại token.");
            }

            if (stored.ThoiGianHetHan <= DateTime.UtcNow)
            {
                stored.NgayThuHoi = DateTime.UtcNow;
                stored.LyDoThuHoi = "EXPIRED";
                await _context.SaveChangesAsync();
                ClearRefreshCookie();
                throw ApiException.AuthenticationFailed("Phiên làm việc đã hết hạn.");
            }

            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.MaNguoiDung == stored.MaNguoiDung);
            if (user == null)
            {
                throw ApiException.AuthenticationFailed("Phiên làm việc không hợp lệ.");
            }

            await KiemTraTrangThaiKhoaAsync(user);

            var phien = stored.MaPhien.HasValue
                ? user.DanhSachPhienDangNhap.FirstOrDefault(p => p.MaPhien == stored.MaPhien.Value)
                : user.DanhSachPhienDangNhap.FirstOrDefault(p => p.MaThietBi == maThietBi);
            if (phien == null || !phien.DangHoatDong)
            {
                stored.NgayThuHoi = DateTime.UtcNow;
                stored.LyDoThuHoi = "SESSION_INACTIVE";
                await _context.SaveChangesAsync();
                ClearRefreshCookie();
                throw ApiException.AuthenticationFailed("Phiên làm việc đã hết hạn hoặc bị đăng xuất từ xa.");
            }

            // Rotate: tạo refresh token mới cùng family, revoke token cũ
            var newMaterial = _tokenService.CreateRefreshTokenMaterial();
            var ipCurrent = httpContext?.Connection.RemoteIpAddress?.ToString();
            var uaCurrent = httpContext?.Request.Headers.UserAgent.ToString();

            // Chống double-spend: atomic claim revoke token cũ với điều kiện NgayThuHoi==null.
            // Hai request đồng thời cùng token → chỉ request đầu flip được (rows=1); request thua (rows=0)
            // buộc đăng nhập lại, không cấp token trùng family. UPDATE...WHERE ở tầng DB đóng hẳn cửa sổ race.
            var claimed = await _context.RefreshTokens
                .Where(r => r.MaRefreshToken == stored.MaRefreshToken && r.NgayThuHoi == null)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(r => r.NgayThuHoi, DateTime.UtcNow)
                    .SetProperty(r => r.LyDoThuHoi, "ROTATED")
                    .SetProperty(r => r.ReplacedByTokenHash, newMaterial.TokenHash)
                    .SetProperty(r => r.IpThuHoi, ipCurrent));

            if (claimed == 0)
            {
                ClearRefreshCookie();
                throw ApiException.AuthenticationFailed("Phiên làm việc đã hết hạn hoặc bị đăng xuất.");
            }

            var newToken = new RefreshTokenModel
            {
                MaNguoiDung = user.MaNguoiDung,
                MaPhien = phien.MaPhien,
                TokenHash = newMaterial.TokenHash,
                FamilyId = stored.FamilyId,
                Jti = newMaterial.Jti,
                ThoiGianHetHan = newMaterial.ExpiresAtUtc,
                NgayTao = DateTime.UtcNow,
                IpTao = ipCurrent,
                UserAgentTao = uaCurrent != null && uaCurrent.Length > 256 ? uaCurrent.Substring(0, 256) : uaCurrent
            };
            _context.RefreshTokens.Add(newToken);

            phien.ThoiGianHoatDongCuoi = DateTime.UtcNow;
            user.NgayDangNhapCuoi = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // K.1: audit refresh rotate thành công (không log giá trị token).
            _logger.LogInformation("Refresh token rotate cho user {UserId} phiên {MaPhien}.", user.MaNguoiDung, phien.MaPhien);

            var accessToken = _tokenService.CreateAccessToken(user, phien.MaPhien);
            SetRefreshCookie(newMaterial.PlainToken, newMaterial.ExpiresAtUtc);

            return new
            {
                token = accessToken.Token,
                user = new
                {
                    maNguoiDung = user.MaNguoiDung,
                    id = user.MaNguoiDung,
                    taiKhoan = user.TaiKhoan,
                    hoTen = user.HoTen,
                    email = user.Email,
                    vaiTro = user.VaiTro,
                    anhDaiDien = user.AnhDaiDien
                }
            };
        }
        #endregion

        #region HELPERS
        private string TaoGiaoDienEmail(string tieuDe, string noiDung, string otp)
        {
            return $@"
            <!doctype html>
            <html lang='vi'>
            <head>
                <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
                <meta charset='utf-8'>
            </head>
            <body style='margin:0; padding:0; background-color:#f5f5f5;'>
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
                            <div style='font-size: 13px; color: #fb873f; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;'>M&#227; x&#225;c th&#7921;c c&#7911;a b&#7841;n</div>
                            <h1 style='color: #fb873f; font-size: 42px; font-weight: 800; letter-spacing: 8px; margin: 0; padding-left: 8px;'>{otp}</h1>
                        </div>
                        <p style='color: #888; font-size: 14px; text-align: center; margin-top: 30px;'>
                            M&#227; x&#225;c th&#7921;c n&#224;y c&#243; hi&#7879;u l&#7921;c trong <b style='color: #555;'>5 ph&#250;t</b>.<br>Vui l&#242;ng kh&#244;ng chia s&#7867; m&#227; n&#224;y cho b&#7845;t k&#7923; ai &#273;&#7875; &#273;&#7843;m b&#7843;o an to&#224;n.
                        </p>
                    </div>
                    <div style='background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;'>
                        <p style='color: #999; font-size: 13px; margin: 0 0 10px 0;'>N&#7871;u b&#7841;n kh&#244;ng y&#234;u c&#7847;u m&#227; n&#224;y, vui l&#242;ng b&#7887; qua email ho&#7863;c li&#234;n h&#7879; v&#7899;i b&#7897; ph&#7853;n h&#7895; tr&#7907;.</p>
                        <p style='color: #bbb; font-size: 12px; margin: 0;'>© {DateTime.Now.Year} EduCodeAI. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>";
        }

        private async Task<NguoiDungModel?> LayNguoiDungKemThietBiAsync(string t)
        {
            // Email so sánh case-insensitive (đồng bộ với chỗ tạo/normalize email); TaiKhoan giữ khớp nguyên.
            var emailLower = (t ?? string.Empty).Trim().ToLower();
            return await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap)
                .FirstOrDefaultAsync(u => u.TaiKhoan == t || u.Email.ToLower() == emailLower);
        }
        
        private async Task<object> XuLyDangNhapThanhCongAsync(NguoiDungModel u, string? maThietBi, string? tenThietBi) { 
            // maThietBi lÃºc nÃ y lÃ  Fingerprint gá»­i tá»« FE
            string devId = string.IsNullOrEmpty(maThietBi) ? "FP-UNKNOWN-" + Guid.NewGuid().ToString("N").Substring(0, 8) : maThietBi;
            string deviceName = string.IsNullOrEmpty(tenThietBi) ? "Thiết bị không xác định" : tenThietBi;
            
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

            // Phase C: refresh token CSPRNG hash trong DB + HttpOnly cookie
            var material = _tokenService.CreateRefreshTokenMaterial();
            var httpContext = _httpContextAccessor.HttpContext;
            var ipTao = httpContext?.Connection.RemoteIpAddress?.ToString();
            var uaTao = httpContext?.Request.Headers["User-Agent"].ToString();
            if (!string.IsNullOrEmpty(uaTao) && uaTao!.Length > 256) uaTao = uaTao.Substring(0, 256);

            _context.RefreshTokens.Add(new RefreshTokenModel
            {
                MaNguoiDung = u.MaNguoiDung,
                MaPhien = phien.MaPhien,
                TokenHash = material.TokenHash,
                FamilyId = material.FamilyId,
                Jti = material.Jti,
                ThoiGianHetHan = material.ExpiresAtUtc,
                NgayTao = DateTime.UtcNow,
                IpTao = ipTao,
                UserAgentTao = uaTao
            });
            await _context.SaveChangesAsync();

            SetRefreshCookie(material.PlainToken, material.ExpiresAtUtc);

            var accessToken = _tokenService.CreateAccessToken(u, phien.MaPhien);

            return new {
                token = accessToken.Token,
                tokenExpiresAt = accessToken.ExpiresAtUtc,
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

        private void KiemTraGioiHanThietBi(NguoiDungModel u, string d) {
            // Náº¿u Ä‘Ã£ Ä‘á»§ 3 thiáº¿t bá»‹ VÃ€ thiáº¿t bá»‹ hiá»‡n táº¡i khÃ´ng náº±m trong danh sÃ¡ch Ä‘ang hoáº¡t Ä‘á»™ng
            if (u.DanhSachPhienDangNhap.Count(p => p.DangHoatDong) >= 3 &&
                !u.DanhSachPhienDangNhap.Any(p => p.MaThietBi == d && p.DangHoatDong))
            {
                throw ApiException.InvalidRequest("Tài khoản của bạn đã đạt giới hạn đăng nhập trên 3 thiết bị. Vui lòng đăng xuất bớt thiết bị cũ.");
            }
        }

        private void SetRefreshCookie(string plainToken, DateTime expiresAtUtc)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return;

            var options = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/api/XacThuc",
                Expires = expiresAtUtc,
                IsEssential = true
            };
            httpContext.Response.Cookies.Append(RefreshCookieName, plainToken, options);
        }

        // Lấy MaPhien từ JWT của request hiện tại (căn cứ revoke — G.4/G.6).
        private int? LayMaPhienTuJwt()
        {
            var raw = _httpContextAccessor.HttpContext?.User?.FindFirst("MaPhien")?.Value;
            return int.TryParse(raw, out var maPhien) ? maPhien : (int?)null;
        }

        private void ClearRefreshCookie()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return;

            var options = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/api/XacThuc",
                Expires = DateTime.UtcNow.AddDays(-1),
                IsEssential = true
            };
            httpContext.Response.Cookies.Append(RefreshCookieName, string.Empty, options);
        }

        // --- Triá»ƒn khai cÃ¡c hÃ m OTP báº£o máº­t qua MemoryCache ---


        public async Task<bool> GuiOtpEmailGiangVienAsync(string email, string? captchaToken)
        {
            email = (email ?? string.Empty).Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(email)) throw ApiException.InvalidRequest("Vui lòng nhập email.");

            await XacThucCaptchaHoacNemAsync(captchaToken);

            if (!await _otpRateLimiter.TryConsumeSendAsync(OtpPurpose.InstructorEmail, email, ClientIp()))
                throw ApiException.InvalidRequest("Bạn yêu cầu mã quá nhiều lần. Vui lòng thử lại sau ít phút.");

            if (await _context.NguoiDungs.AnyAsync(u => u.Email.ToLower() == email))
                throw ApiException.InvalidRequest("Email này đã được sử dụng.");

            if (await _context.HoSoDangKyGiangViens.AnyAsync(h => h.Email.ToLower() == email.ToLower() && h.TrangThaiHoSo != "TuChoi"))
                throw ApiException.InvalidRequest("Email này đã có hồ sơ giảng viên đang chờ xử lý hoặc đã được duyệt.");

            var otp = await _otpService.CreateOtpAsync(OtpPurpose.InstructorEmail, email);

            string subject = "Mã xác thực email đăng ký giảng viên EduCodeAI";
            string body = TaoGiaoDienEmail("Xác thực email đăng ký giảng viên", "Bạn đang đăng ký trở thành giảng viên EduCodeAI. Vui lòng nhập mã xác thực dưới đây để tiếp tục.", otp);
            return await EmailHelper.SendEmailAsync(email, subject, body);
        }

        public async Task<bool> XacMinhOtpEmailGiangVienAsync(string email, string otpCode)
        {
            email = (email ?? string.Empty).Trim().ToLowerInvariant();
            otpCode = (otpCode ?? string.Empty).Trim();

            if (!await _otpRateLimiter.TryConsumeVerifyAsync(OtpPurpose.InstructorEmail, email, ClientIp()))
                throw ApiException.InvalidRequest("Bạn thử mã quá nhiều lần. Vui lòng thử lại sau.");

            var result = await _otpService.VerifyOtpAsync(OtpPurpose.InstructorEmail, email, otpCode);
            if (!result.Success)
                throw ApiException.InvalidRequest(result.ErrorMessage ?? "Mã OTP không chính xác hoặc đã hết hạn.");

            _memoryCache.Set("VERIFIED_InstructorEmail_" + email, true, TimeSpan.FromMinutes(30));
            return true;
        }

        public async Task<bool> YeuCauDangKyAsync(DangKyRequest r, string i) {
            await XacThucCaptchaHoacNemAsync(r.CaptchaToken);

            // D.6: normalize email trước khi rate-limit key/query/lưu để nhất quán và chống trùng theo case.
            var email = (r.Email ?? string.Empty).Trim().ToLowerInvariant();

            if (!await _otpRateLimiter.TryConsumeSendAsync(OtpPurpose.Register, email, ClientIp()))
                throw ApiException.InvalidRequest("Bạn yêu cầu mã quá nhiều lần. Vui lòng thử lại sau ít phút.");

            if (await _context.NguoiDungs.AnyAsync(u => u.Email.ToLower() == email))
                throw ApiException.InvalidRequest("Email này đã được sử dụng.");

            // D.7: hash mật khẩu ngay, chỉ cache hash (không lưu plain trong OTP payload).
            var payload = JsonSerializer.Serialize(new DangKyOtpPayload(
                r.HoTen, email, BCrypt.Net.BCrypt.HashPassword(r.MatKhau)));
            string otp = await _otpService.CreateOtpAsync(OtpPurpose.Register, email, payload);
            // LÆ°u vÃ o Cache 5 phÃºt, Key lÃ  Email
            string subject = "Mã xác thực đăng ký EduCodeAI";
            string body = $"Mã OTP của bạn là: <h1 style='color: #fb873f;'>{otp}</h1> Mã có hiệu lực trong 5 ph&#250;t.";
            return await EmailHelper.SendEmailAsync(email, subject, body);
        }

        public async Task<object> XacNhanDangKyVaLuuDbAsync(XacNhanOtpRequest r) {
            if (!await _otpRateLimiter.TryConsumeVerifyAsync(OtpPurpose.Register, r.TaiKhoan, ClientIp()))
                throw ApiException.InvalidRequest("Bạn thử mã quá nhiều lần. Vui lòng thử lại sau.");

            var verify = await _otpService.VerifyOtpAsync(OtpPurpose.Register, r.TaiKhoan, r.OtpCode);
            if (!verify.Success || string.IsNullOrEmpty(verify.PayloadJson))
                throw ApiException.InvalidRequest(verify.ErrorMessage ?? "Mã OTP không chính xác.");

            var data = JsonSerializer.Deserialize<DangKyOtpPayload>(verify.PayloadJson)
                ?? throw ApiException.InvalidRequest("Dữ liệu đăng ký không hợp lệ.");

            var user = new NguoiDungModel {
                TaiKhoan = data.Email,
                Email = data.Email,
                HoTen = data.HoTen,
                MatKhau = data.MatKhauHash, // D.7: đã hash lúc yêu cầu OTP, không lưu plain.
                VaiTro = 2,
                TrangThai = "Hoạt động",
                NgayThamGia = DateTime.UtcNow
            };

            // D.8: re-check trùng ngay trước khi lưu (email có thể bị chiếm giữa lúc gửi OTP và xác minh).
            if (await _context.NguoiDungs.AnyAsync(u => u.Email.ToLower() == data.Email || u.TaiKhoan == data.Email))
                throw ApiException.InvalidRequest("Email này đã được sử dụng bởi một tài khoản khác.");

            _context.NguoiDungs.Add(user);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // D.8: unique index Email/TaiKhoan là hàng phòng thủ cuối chống race tạo trùng.
                throw ApiException.InvalidRequest("Email này đã được sử dụng bởi một tài khoản khác.");
            }

            // K.1: audit tạo tài khoản mới (không log email/mật khẩu — chỉ userId + IP).
            _logger.LogInformation("Đăng ký tài khoản mới thành công: user {UserId} từ IP {Ip}.", user.MaNguoiDung, ClientIp());

            // Äáº£m báº£o khÃ´ng truyá»n rá»—ng vÃ o XuLyDangNhapThanhCongAsync
            string finalDeviceId = string.IsNullOrEmpty(r.MaThietBi) ? "FP-INIT-ERR" : r.MaThietBi;
            string finalDeviceName = string.IsNullOrEmpty(r.TenThietBi) ? "Thiáº¿t bá»‹ khÃ´ng xÃ¡c Ä‘á»‹nh (ÄÄƒng kÃ½)" : r.TenThietBi;

            return await XuLyDangNhapThanhCongAsync(user, finalDeviceId, finalDeviceName);
        }

        public async Task<bool> YeuCauOtpDangXuatTuXaAsync(int userId) {
            var user = await _context.NguoiDungs.FindAsync(userId);
            if (user == null) return false;

            string otp = await _otpService.CreateOtpAsync(OtpPurpose.RemoteLogout, userId.ToString());

            string emailBody = TaoGiaoDienEmail("Đăng xuất từ xa", "Bạn vừa gửi yêu cầu đăng xuất tài khoản khỏi các thiết bị khác. Để đảm bảo an toàn, vui lòng nhập mã xác thực dưới đây để xác nhận hành động này.", otp);
            await EmailHelper.SendEmailAsync(user.Email, "Xác nhận đăng xuất từ xa", emailBody);
            return true;
        }

        public async Task<bool> XacNhanDangXuatTuXaAsync(int userId, DangXuatTuXaRequest r) {
            var otpResult = await _otpService.VerifyOtpAsync(OtpPurpose.RemoteLogout, userId.ToString(), r.OtpCode);
            if (!otpResult.Success)
                throw ApiException.InvalidRequest(otpResult.ErrorMessage ?? "Mã OTP không chính xác hoặc đã hết hạn.");

            var ipThuHoi = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
            var deactivatedSessionIds = new List<int>();

            // G.6: "Đăng xuất tất cả" phải giữ phiên hiện tại (lấy MaPhien từ JWT đã verify).
            var maPhienHienTai = LayMaPhienTuJwt();

            if (r.DangXuatTatCa) {
                var allSessions = await _context.PhienDangNhaps
                    .Where(p => p.MaNguoiDung == userId && p.DangHoatDong
                                && (!maPhienHienTai.HasValue || p.MaPhien != maPhienHienTai.Value))
                    .ToListAsync();
                foreach (var s in allSessions) { s.DangHoatDong = false; deactivatedSessionIds.Add(s.MaPhien); }
            } else if (r.DanhSachMaPhien != null && r.DanhSachMaPhien.Any()) {
                // G.5: chỉ thao tác phiên thuộc user hiện tại (filter MaNguoiDung == userId chống IDOR).
                var sessions = await _context.PhienDangNhaps
                    .Where(p => p.MaNguoiDung == userId && r.DanhSachMaPhien.Contains(p.MaPhien))
                    .ToListAsync();
                foreach (var s in sessions) { s.DangHoatDong = false; deactivatedSessionIds.Add(s.MaPhien); }
            }

            if (deactivatedSessionIds.Count > 0)
            {
                var tokens = await _context.RefreshTokens
                    .Where(t => t.MaNguoiDung == userId
                                && t.NgayThuHoi == null
                                && t.MaPhien.HasValue
                                && deactivatedSessionIds.Contains(t.MaPhien.Value))
                    .ToListAsync();
                foreach (var t in tokens)
                {
                    t.NgayThuHoi = DateTime.UtcNow;
                    t.LyDoThuHoi = "REMOTE_LOGOUT";
                    t.IpThuHoi = ipThuHoi;
                }
            }

            await _context.SaveChangesAsync();

            // Invalidate cache từng phiên bị revoke để request kế tiếp bị chặn ngay (G.5/G.6).
            foreach (var maPhien in deactivatedSessionIds)
            {
                await _sessionStateCache.InvalidateSessionAsync(maPhien);
            }

            // Publish sau commit + invalidate cache: đẩy các thiết bị bị revoke thoát tức thời (G.8).
            foreach (var maPhien in deactivatedSessionIds)
            {
                await _sessionRealtimeNotifier.SessionRevokedAsync(maPhien);
            }
            if (deactivatedSessionIds.Count > 0)
            {
                await _sessionRealtimeNotifier.SessionListChangedAsync(userId);
            }

            _logger.LogInformation("Remote logout cho user {UserId}; thu hồi {Count} phiên từ IP {Ip}.",
                userId, deactivatedSessionIds.Count, ipThuHoi);

            return true;
        }

        public async Task<object> XacNhanOtpVaDangNhapAsync(XacNhanOtpRequest r) {
            var user = await LayNguoiDungKemThietBiAsync(r.TaiKhoan);
            if (user == null) throw ApiException.InvalidRequest("NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i.");

            // HÃ m nÃ y dÃ¹ng cho luá»“ng Ä‘Äƒng nháº­p thiáº¿t bá»‹ má»›i yÃªu cáº§u OTP
            if (!await _otpRateLimiter.TryConsumeVerifyAsync(OtpPurpose.LoginNewDevice, user.Email, ClientIp()))
                throw ApiException.InvalidRequest("Bạn thử mã quá nhiều lần. Vui lòng thử lại sau.");

            var verify = await _otpService.VerifyOtpAsync(OtpPurpose.LoginNewDevice, user.Email, r.OtpCode);
            if (!verify.Success)
                throw ApiException.InvalidRequest(verify.ErrorMessage ?? "Mã OTP không chính xác.");

            var payload = JsonSerializer.Deserialize<ThietBiOtpPayload>(verify.PayloadJson ?? "{}")!;
            return await XuLyDangNhapThanhCongAsync(user, payload.MaThietBi, payload.TenThietBi);
        }

        public async Task<object> YeuCauQuenMatKhauAsync(QuenMatKhauRequest r, string i) {
            await XacThucCaptchaHoacNemAsync(r.CaptchaToken);

            // F.1: normalize email trước rate-limit key/query để nhất quán và ổn định key.
            var email = (r.Email ?? string.Empty).Trim().ToLowerInvariant();

            if (!await _otpRateLimiter.TryConsumeSendAsync(OtpPurpose.ForgotPassword, email, ClientIp()))
                throw ApiException.InvalidRequest("Bạn yêu cầu mã quá nhiều lần. Vui lòng thử lại sau.");

            // F.1: KHÔNG tiết lộ email có tồn tại hay không. Chỉ gửi OTP khi email thật sự có tài khoản,
            // nhưng response luôn giống nhau để chống user enumeration.
            var user = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
            if (user != null)
            {
                // Gửi email nền (fire-and-forget) để thời gian phản hồi đồng đều dù email tồn tại hay không,
                // chống enumeration qua timing. OTP vẫn tạo đồng bộ để lưu trước khi response trả về.
                string otp = await _otpService.CreateOtpAsync(OtpPurpose.ForgotPassword, email);
                string emailBody = TaoGiaoDienEmail("Đặt lại mật khẩu", "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhập mã xác thực dưới đây để tiến hành thiết lập mật khẩu mới.", otp);
                _ = Task.Run(() => EmailHelper.SendEmailAsync(email, "Mã xác nhận đặt lại mật khẩu", emailBody));
            }

            return new { message = "Nếu email tồn tại trong hệ thống, mã xác thực đã được gửi. Vui lòng kiểm tra hộp thư." };
        }

        public async Task<object> DatLaiMatKhauAsync(DatLaiMatKhauRequest r) {
            if (!await _otpRateLimiter.TryConsumeVerifyAsync(OtpPurpose.ForgotPassword, r.Email, ClientIp()))
                throw ApiException.InvalidRequest("Bạn thử mã quá nhiều lần. Vui lòng thử lại sau.");

            var verify = await _otpService.VerifyOtpAsync(OtpPurpose.ForgotPassword, r.Email, r.OtpCode);
            if (!verify.Success)
                throw ApiException.InvalidRequest(verify.ErrorMessage ?? "Mã OTP không chính xác hoặc đã hết hạn.");

            var user = await LayNguoiDungKemThietBiAsync(r.Email);
            if (user == null) throw ApiException.InvalidRequest("Phiên làm việc không hợp lệ.");

            // F.3: áp password policy chung (>=8 ký tự, không chứa local email, không trùng mật khẩu cũ).
            KiemTraPasswordPolicyHoacNem(r.MatKhauMoi, user.Email, user.MatKhau);

            // Cập nhật mật khẩu mới. OTP đã single-use tự xóa trong VerifyOtpAsync.
            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(r.MatKhauMoi);

            // F.4: revoke TOÀN BỘ phiên + refresh token của user (không giữ phiên nào), KHÔNG auto-login.
            var ipThuHoi = ClientIp();
            var revokedSessionIds = user.DanhSachPhienDangNhap
                .Where(p => p.DangHoatDong)
                .Select(p => p.MaPhien)
                .ToList();
            foreach (var p in user.DanhSachPhienDangNhap.Where(p => p.DangHoatDong))
            {
                p.DangHoatDong = false;
            }

            var tokens = await _context.RefreshTokens
                .Where(t => t.MaNguoiDung == user.MaNguoiDung && t.NgayThuHoi == null)
                .ToListAsync();
            foreach (var t in tokens)
            {
                t.NgayThuHoi = DateTime.UtcNow;
                t.LyDoThuHoi = "PASSWORD_RESET";
                t.IpThuHoi = ipThuHoi;
            }

            await _context.SaveChangesAsync();

            // Sau commit: invalidate cache + push SignalR để mọi thiết bị bị đá ngay (tái dùng pattern G).
            await _sessionStateCache.InvalidateUserStatusAsync(user.MaNguoiDung);
            foreach (var maPhien in revokedSessionIds)
            {
                await _sessionStateCache.InvalidateSessionAsync(maPhien);
            }
            foreach (var maPhien in revokedSessionIds)
            {
                await _sessionRealtimeNotifier.SessionRevokedAsync(maPhien);
            }
            await _sessionRealtimeNotifier.SessionListChangedAsync(user.MaNguoiDung);

            // Xóa cookie refresh của thiết bị hiện tại; KHÔNG auto-login, buộc đăng nhập lại.
            ClearRefreshCookie();

            // F.7: audit mức thông tin, không log password/hash/OTP.
            _logger.LogInformation("Password reset for user {UserId}; revoked {Count} session(s).", user.MaNguoiDung, revokedSessionIds.Count);

            return new { message = "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại bằng mật khẩu mới." };
        }

        public async Task<bool> DoiMatKhauAsync(int userId, DoiMatKhauRequest r) {
            var user = await _context.NguoiDungs.FindAsync(userId);
            if (user == null) throw ApiException.InvalidRequest("NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i.");

            if (!BCrypt.Net.BCrypt.Verify(r.MatKhauCu, user.MatKhau))
                throw ApiException.InvalidRequest("Mật khẩu hiện tại không chính xác.");

            // F.3: áp password policy chung (>=8 ký tự, không chứa local email, không trùng mật khẩu cũ).
            KiemTraPasswordPolicyHoacNem(r.MatKhauMoi, user.Email, user.MatKhau);

            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(r.MatKhauMoi);

            // F.6: revoke các phiên KHÁC, giữ phiên hiện tại (lấy MaPhien từ JWT đã verify).
            var maPhienHienTai = LayMaPhienTuJwt();
            var ipThuHoi = ClientIp();
            var revokedSessionIds = await _context.PhienDangNhaps
                .Where(p => p.MaNguoiDung == userId && p.DangHoatDong
                            && (!maPhienHienTai.HasValue || p.MaPhien != maPhienHienTai.Value))
                .Select(p => p.MaPhien)
                .ToListAsync();

            if (revokedSessionIds.Count > 0)
            {
                var sessions = await _context.PhienDangNhaps
                    .Where(p => revokedSessionIds.Contains(p.MaPhien))
                    .ToListAsync();
                foreach (var p in sessions) p.DangHoatDong = false;

                var tokens = await _context.RefreshTokens
                    .Where(t => t.MaNguoiDung == userId && t.NgayThuHoi == null
                                && t.MaPhien.HasValue && revokedSessionIds.Contains(t.MaPhien.Value))
                    .ToListAsync();
                foreach (var t in tokens)
                {
                    t.NgayThuHoi = DateTime.UtcNow;
                    t.LyDoThuHoi = "PASSWORD_CHANGE";
                    t.IpThuHoi = ipThuHoi;
                }
            }

            await _context.SaveChangesAsync();

            // Sau commit: invalidate cache + push SignalR cho các phiên bị revoke (tái dùng pattern G).
            foreach (var maPhien in revokedSessionIds)
            {
                await _sessionStateCache.InvalidateSessionAsync(maPhien);
            }
            foreach (var maPhien in revokedSessionIds)
            {
                await _sessionRealtimeNotifier.SessionRevokedAsync(maPhien);
            }
            if (revokedSessionIds.Count > 0)
            {
                await _sessionRealtimeNotifier.SessionListChangedAsync(userId);
            }

            // F.7: audit mức thông tin, không log password/hash/OTP.
            _logger.LogInformation("Password changed for user {UserId}; revoked {Count} other session(s).", userId, revokedSessionIds.Count);

            return true;
        }

        public async Task<object> LayTrangThaiPhienAsync(int userId) {
            // G.12: endpoint đồng bộ một lần khi SignalR reconnect — trả trạng thái phiên hiện tại
            // (lấy MaPhien từ JWT) để frontend biết có bị revoke/khóa trong lúc mất kết nối không.
            var user = await _context.NguoiDungs
                .AsNoTracking()
                .Select(u => new { u.MaNguoiDung, u.TrangThai })
                .FirstOrDefaultAsync(u => u.MaNguoiDung == userId);

            bool isBanned = user == null
                || string.Equals(user.TrangThai, "Bị khóa", StringComparison.OrdinalIgnoreCase)
                || string.Equals(user.TrangThai, "Khóa vĩnh viễn", StringComparison.OrdinalIgnoreCase);

            var maPhien = LayMaPhienTuJwt();
            bool sessionActive = true;
            if (maPhien.HasValue)
            {
                sessionActive = await _context.PhienDangNhaps
                    .AsNoTracking()
                    .AnyAsync(p => p.MaPhien == maPhien.Value && p.MaNguoiDung == userId && p.DangHoatDong);
            }

            return new
            {
                isBanned,
                sessionActive,
                isValid = !isBanned && sessionActive
            };
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
            // G.4: MaPhien trong JWT là căn cứ chính (không tin device ID từ body).
            // Chỉ khi claim thiếu (token legacy) mới fallback tra theo maThietBi.
            var maPhienJwt = LayMaPhienTuJwt();
            var phien = maPhienJwt.HasValue
                ? await _context.PhienDangNhaps.FirstOrDefaultAsync(p => p.MaPhien == maPhienJwt.Value && p.MaNguoiDung == userId)
                : await _context.PhienDangNhaps.FirstOrDefaultAsync(p => p.MaNguoiDung == userId && p.MaThietBi == maThietBi);

            if (phien != null) {
                phien.DangHoatDong = false;

                // Phase C: revoke refresh tokens của phiên này để không thể lam-moi được nữa
                var tokens = await _context.RefreshTokens
                    .Where(r => r.MaPhien == phien.MaPhien && r.NgayThuHoi == null)
                    .ToListAsync();
                var ipRevoke = _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
                foreach (var t in tokens)
                {
                    t.NgayThuHoi = DateTime.UtcNow;
                    t.LyDoThuHoi = "LOGOUT";
                    t.IpThuHoi = ipRevoke;
                }

                await _context.SaveChangesAsync();

                // Invalidate cache ngay sau commit để request kế tiếp bị từ chối (G.4).
                await _sessionStateCache.InvalidateSessionAsync(phien.MaPhien);

                // Push realtime để các tab của chính phiên này thoát UI ngay (G.8).
                await _sessionRealtimeNotifier.SessionRevokedAsync(phien.MaPhien);
                await _sessionRealtimeNotifier.SessionListChangedAsync(userId);

                // K.1: audit logout (không log token/secret).
                _logger.LogInformation("Đăng xuất user {UserId} phiên {MaPhien}.", userId, phien.MaPhien);
            }

            // Clear cookie refresh của thiết bị hiện tại
            ClearRefreshCookie();
            return true;
        }
        public async Task<object> DangKyGiangVienAsync(DangKyGiangVienRequest request)
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var taiKhoan = request.TaiKhoan.Trim();
            var soGiayTo = request.SoGiayTo.Trim();

            if (request.LoaiDoiTuongThue is not ("CaNhan" or "DoanhNghiep"))
                throw ApiException.InvalidRequest("Vui lòng chọn loại đối tượng nộp thuế.");

            // I.1: backend enforce email đã xác minh OTP (cờ set ở XacMinhOtpEmailGiangVienAsync).
            // Trước đây chỉ frontend chặn nên có thể submit hồ sơ mà không cần verify email.
            if (!_memoryCache.TryGetValue("VERIFIED_InstructorEmail_" + email, out bool daXacMinh) || !daXacMinh)
                throw ApiException.InvalidRequest("Vui lòng xác minh email trước khi gửi hồ sơ.");

            // I.2: validate mã số thuế server-side (10 hoặc 13 chữ số) — không chỉ tin frontend.
            var maSoThue = request.MaSoThue?.Trim();
            if (!string.IsNullOrEmpty(maSoThue) && !System.Text.RegularExpressions.Regex.IsMatch(maSoThue, @"^\d{10}(\d{3})?$"))
                throw ApiException.InvalidRequest("Mã số thuế phải gồm 10 hoặc 13 chữ số.");

            // 1. Kiểm tra trùng với tài khoản đã hoạt động (NguoiDungs)
            if (await _context.NguoiDungs.AnyAsync(u => u.Email.ToLower() == email))
                throw ApiException.InvalidRequest("Email này đã được sử dụng bởi một tài khoản khác.");

            if (await _context.NguoiDungs.AnyAsync(u => u.TaiKhoan == taiKhoan))
                throw ApiException.InvalidRequest("Tên tài khoản này đã tồn tại.");

            // 2. Kiểm tra trùng trong hồ sơ đang xử lý (chưa bị từ chối hẳn)
            if (await _context.HoSoDangKyGiangViens.AnyAsync(x => x.Email == email && x.TrangThaiHoSo != "TuChoi"))
                throw ApiException.InvalidRequest("Email này đang có hồ sơ chờ xử lý. Vui lòng tra cứu trạng thái hồ sơ để cập nhật.");

            if (await _context.HoSoDangKyGiangViens.AnyAsync(x => x.TaiKhoan.ToLower() == taiKhoan.ToLower() && x.TrangThaiHoSo != "TuChoi"))
                throw ApiException.InvalidRequest("T\u00ean t\u00e0i kho\u1ea3n n\u00e0y \u0111\u00e3 \u0111\u01b0\u1ee3c d\u00f9ng trong m\u1ed9t h\u1ed3 s\u01a1 \u0111\u0103ng k\u00fd \u0111ang x\u1eed l\u00fd.");

            if (await _context.HoSoDangKyGiangViens.AnyAsync(x => x.SoGiayTo == soGiayTo && x.TrangThaiHoSo != "TuChoi"))
                throw ApiException.InvalidRequest("Số giấy tờ này đang có hồ sơ chờ xử lý.");

            // 3. Validate file upload (chỉ chấp nhận ảnh, tối đa 5MB)
            const long MaxFileSize = 5 * 1024 * 1024;

            async Task ValidateFile(IFormFile f, string label)
            {
                if (f == null || f.Length == 0)
                    throw ApiException.InvalidRequest($"Vui lòng tải lên {label}.");
                if (f.Length > MaxFileSize)
                    throw ApiException.InvalidRequest($"{label} vượt quá 5MB.");
                var ext = Path.GetExtension(f.FileName);
                if (!_allowedImgExtensions.Contains(ext))
                    throw ApiException.InvalidRequest($"{label} phải là ảnh JPG, PNG hoặc WEBP.");
                if (!f.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                    throw ApiException.InvalidRequest($"{label} không phải là file ảnh hợp lệ.");
                // I.3: kiểm magic bytes — không tin ContentType/ext do client gửi (file giả .jpg lọt được).
                if (!await KiemTraMagicBytesAnhAsync(f))
                    throw ApiException.InvalidRequest($"{label} không phải là ảnh hợp lệ (nội dung file sai định dạng).");
            }

            await ValidateFile(request.AnhGiayToMatTruoc, "ảnh mặt trước giấy tờ");
            await ValidateFile(request.AnhGiayToMatSau, "ảnh mặt sau giấy tờ");
            if (request.AnhDaiDien != null && request.AnhDaiDien.Length > 0)
                await ValidateFile(request.AnhDaiDien, "ảnh đại diện");

            // 4. Quét OCR ngay trong request. Ảnh CCCD không được ghi xuống ổ đĩa.
            var ketQuaQuet = await _giayToScanningService.QuetGiayToAsync(new GiayToScanningRequest
            {
                AnhMatTruoc = request.AnhGiayToMatTruoc,
                AnhMatSau = request.AnhGiayToMatSau,
                LoaiGiayTo = request.LoaiGiayTo.Trim()
            });
            if (!ketQuaQuet.ThanhCong || string.IsNullOrWhiteSpace(ketQuaQuet.SoGiayTo))
                throw ApiException.InvalidRequest(ketQuaQuet.ThongBao ?? "Không thể đọc số giấy tờ từ ảnh tải lên.");
            if (!string.Equals(ketQuaQuet.SoGiayTo.Trim(), soGiayTo, StringComparison.OrdinalIgnoreCase))
                throw ApiException.InvalidRequest("Số giấy tờ nhập vào không khớp với ảnh CCCD đã quét.");

            var duLieuCccdMaHoa = _cccdDataProtector.Protect(JsonSerializer.Serialize(new
            {
                loaiGiayTo = request.LoaiGiayTo.Trim(),
                hoTen = ketQuaQuet.HoTen,
                soGiayTo = ketQuaQuet.SoGiayTo,
                ngaySinh = ketQuaQuet.NgaySinh,
                gioiTinh = ketQuaQuet.GioiTinh,
                ngayCap = ketQuaQuet.NgayCap,
                // ?u ti?n n?i c?p ng??i d?ng nh?p tay; fallback OCR n?u tr?ng.
                noiCap = !string.IsNullOrWhiteSpace(request.NoiCap) ? request.NoiCap.Trim() : ketQuaQuet.NoiCap,
                diaChi = ketQuaQuet.DiaChi,
                quocTich = ketQuaQuet.QuocTich,
                nguyenQuan = ketQuaQuet.NguyenQuan
            }));

            // Chỉ avatar được lưu. Ảnh CCCD không được lưu ở bất kỳ thư mục nào.
            var avatarRoot = Path.Combine(_env.WebRootPath, "uploads", "dang-ky-giang-vien", "avatars");
            Directory.CreateDirectory(avatarRoot);
            string? avatarPath = null;
            List<string> savedFiles = new();

            try
            {
                if (request.AnhDaiDien != null && request.AnhDaiDien.Length > 0)
                {
                    avatarPath = await LuuFileAsync(request.AnhDaiDien, avatarRoot, "/uploads/dang-ky-giang-vien/avatars");
                    savedFiles.Add(Path.Combine(avatarRoot, Path.GetFileName(avatarPath)));
                }

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
                            DuLieuCccdMaHoa = duLieuCccdMaHoa,
                            AnhGiayToMatTruocUrl = string.Empty,
                            AnhGiayToMatSauUrl = string.Empty,
                            PhuongThucThanhToan = request.PhuongThucThanhToan.Trim(),
                            TenNganHang = request.TenNganHang?.Trim(),
                            SoTaiKhoanNhanTien = request.SoTaiKhoanNhanTien?.Trim(),
                            TenChuTaiKhoan = request.TenChuTaiKhoan?.Trim(),
                            MaSoThue = maSoThue,
                            LoaiDoiTuongThue = request.LoaiDoiTuongThue?.Trim(),
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
                    catch (DbUpdateException)
                    {
                        // I.2: unique index chống TOCTOU race — 2 request đồng thời vượt qua check AnyAsync
                        // đều insert, index chặn cái sau. Trả lỗi thân thiện thay vì 500.
                        await tx.RollbackAsync();
                        foreach (var p in savedFiles)
                        {
                            try { if (File.Exists(p)) File.Delete(p); } catch { }
                        }
                        throw ApiException.InvalidRequest("Email, tài khoản hoặc số giấy tờ đã có hồ sơ đang xử lý.");
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

        // I.8: verify token bổ sung — DB lưu hash, token nhập là plaintext. Hash token nhập rồi so
        // constant-time với hash trong DB; kiểm còn hạn. Trả false nếu thiếu/sai/hết hạn.
        private bool XacThucBoSungToken(string? tokenNhap, string? tokenHashDb, DateTime? hetHan)
        {
            tokenNhap = tokenNhap?.Trim();
            if (string.IsNullOrEmpty(tokenNhap) || string.IsNullOrEmpty(tokenHashDb))
                return false;
            if (!hetHan.HasValue || hetHan.Value <= DateTime.UtcNow)
                return false;

            var hashNhap = _tokenService.HashRefreshToken(tokenNhap);
            return System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(
                System.Text.Encoding.UTF8.GetBytes(hashNhap),
                System.Text.Encoding.UTF8.GetBytes(tokenHashDb));
        }

        // I.3: kiểm magic bytes của ảnh (JPEG/PNG/WEBP) thay vì tin ContentType/ext client gửi.
        // Chống upload file giả .jpg (polyglot/HTML/SVG) — avatar được serve public nên rủi ro stored-XSS.
        private static async Task<bool> KiemTraMagicBytesAnhAsync(IFormFile file)
        {
            try
            {
                var header = new byte[12];
                await using var stream = file.OpenReadStream();
                // ReadExactly: Stream không đảm bảo fill buffer trong 1 lần đọc; đọc đủ 12 byte
                // (ném EndOfStreamException nếu file ngắn hơn → catch trả false), tránh từ chối nhầm ảnh hợp lệ.
                await stream.ReadExactlyAsync(header, 0, 12);

                // JPEG: FF D8 FF
                if (header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
                    return true;
                // PNG: 89 50 4E 47 0D 0A 1A 0A
                if (header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47
                    && header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A)
                    return true;
                // WEBP: "RIFF" .... "WEBP"
                if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46
                    && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50)
                    return true;

                return false;
            }
            catch
            {
                return false;
            }
        }

        private static async Task<string> LuuFileAsync(IFormFile file, string folderPath, string publicPrefix)
        {
            // Validate phòng vệ (layer 2)
            var ext = Path.GetExtension(file.FileName);
            if (!_allowedImgExtensions.Contains(ext) || file.Length > _maxFileSize)
                throw ApiException.InvalidRequest("File không hợp lệ.");

            var fileName = $"{Guid.NewGuid()}{ext.ToLowerInvariant()}";
            var fullPath = Path.Combine(folderPath, fileName);
            await using var stream = new FileStream(fullPath, FileMode.Create);
            await file.CopyToAsync(stream);
            return $"{publicPrefix}/{fileName}";
        }

        /// <summary>
        /// Lưu ảnh CCCD/private vào thư mục ngoài wwwroot.
        /// Trả về token nội bộ: private://giay-to/{fileName}
        /// </summary>
        private static async Task<string> LuuFilePrivateAsync(IFormFile file, string folderPath)
        {
            var ext = Path.GetExtension(file.FileName);
            if (!_allowedImgExtensions.Contains(ext) || file.Length > _maxFileSize)
                throw ApiException.InvalidRequest("File không hợp lệ.");

            var fileName = $"{Guid.NewGuid()}{ext.ToLowerInvariant()}";
            var fullPath = Path.Combine(folderPath, fileName);
            await using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            return $"private://giay-to/{fileName}";
        }



        /// <summary>
        /// Giảng viên tra cứu trạng thái hồ sơ đăng ký theo email (public, không cần token).
        /// </summary>
        public async Task<object> TraCuuTrangThaiHoSoAsync(string email)
        {
            var normalizedEmail = email.Trim().ToLower();
            if (string.IsNullOrWhiteSpace(normalizedEmail))
                throw ApiException.InvalidRequest("Vui lòng nhập email.");

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
                throw ApiException.InvalidRequest("Không tìm thấy hồ sơ đăng ký với email này.");

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
            // I.8: rate-limit theo hồ sơ + IP để chặn brute-force token bổ sung.
            if (!await _otpRateLimiter.TryConsumeVerifyAsync(OtpPurpose.BoSungHoSo, maHoSo.ToString(), ClientIp()))
                throw ApiException.InvalidRequest("Bạn thử quá nhiều lần. Vui lòng thử lại sau.");

            var hoSo = await _context.HoSoDangKyGiangViens
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaHoSoDangKyGiangVien == maHoSo);
            if (hoSo == null)
                throw ApiException.InvalidRequest("Không tìm thấy hồ sơ đăng ký.");

            if (hoSo.TrangThaiHoSo != "CanBoSung")
                throw ApiException.InvalidRequest("Hồ sơ không ở trạng thái cần bổ sung.");

            // I.8: token gửi qua email là plaintext; DB chỉ lưu hash. Hash token nhập rồi so constant-time.
            if (!XacThucBoSungToken(token, hoSo.BoSungToken, hoSo.BoSungTokenHetHan))
                throw ApiException.InvalidRequest("Mã xác thực không hợp lệ hoặc đã hết hạn.");

            if (hoSo.DaNopBoSung)
                throw ApiException.InvalidRequest("Hồ sơ đã được gửi bổ sung. Vui lòng đợi kết quả.");

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
                throw ApiException.InvalidRequest("Không tìm thấy hồ sơ đăng ký.");

            if (hoSo.TrangThaiHoSo != "CanBoSung")
                throw ApiException.InvalidRequest("Hồ sơ không ở trạng thái cần bổ sung. Không thể cập nhật.");

            // I.8: rate-limit + verify token qua hash constant-time (DB chỉ lưu hash).
            if (!await _otpRateLimiter.TryConsumeVerifyAsync(OtpPurpose.BoSungHoSo, maHoSo.ToString(), ClientIp()))
                throw ApiException.InvalidRequest("Bạn thử quá nhiều lần. Vui lòng thử lại sau.");
            if (!XacThucBoSungToken(request.Token, hoSo.BoSungToken, hoSo.BoSungTokenHetHan))
                throw ApiException.InvalidRequest("Mã xác thực bổ sung không hợp lệ hoặc đã hết hạn.");
            if (hoSo.DaNopBoSung)
                throw ApiException.InvalidRequest("Hồ sơ đã được gửi bổ sung. Vui lòng đợi kết quả.");

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
            if (!string.IsNullOrWhiteSpace(request.LoaiDoiTuongThue)) hoSo.LoaiDoiTuongThue = request.LoaiDoiTuongThue.Trim();

            // Cập nhật file/avatar nếu có. Ảnh CCCD chỉ dùng tạm để OCR, không lưu file.
            var avatarRoot = Path.Combine(_env.WebRootPath, "uploads", "dang-ky-giang-vien", "avatars");
            Directory.CreateDirectory(avatarRoot);
            string? oldAvatar = hoSo.AnhDaiDienUrl;

            if (request.AnhDaiDien != null && request.AnhDaiDien.Length > 0)
            {
                // I.3: kiểm magic bytes cả ở luồng bổ sung (LuuFileAsync chỉ check ext+size) —
                // tránh upload file giả .jpg làm avatar serve public → stored-XSS.
                if (!await KiemTraMagicBytesAnhAsync(request.AnhDaiDien))
                    throw ApiException.InvalidRequest("Ảnh đại diện không phải là ảnh hợp lệ (nội dung file sai định dạng).");
                var p = await LuuFileAsync(request.AnhDaiDien, avatarRoot, "/uploads/dang-ky-giang-vien/avatars");
                hoSo.AnhDaiDienUrl = p;
            }

            // Nếu giảng viên gửi lại 2 mặt CCCD thì quét lại và mã hóa dữ liệu mới.
            if (request.AnhGiayToMatTruoc != null && request.AnhGiayToMatTruoc.Length > 0
                && request.AnhGiayToMatSau != null && request.AnhGiayToMatSau.Length > 0)
            {
                var ketQuaQuet = await _giayToScanningService.QuetGiayToAsync(new GiayToScanningRequest
                {
                    AnhMatTruoc = request.AnhGiayToMatTruoc,
                    AnhMatSau = request.AnhGiayToMatSau,
                    LoaiGiayTo = string.IsNullOrWhiteSpace(hoSo.LoaiGiayTo) ? "CCCD" : hoSo.LoaiGiayTo
                });
                if (!ketQuaQuet.ThanhCong || string.IsNullOrWhiteSpace(ketQuaQuet.SoGiayTo))
                    throw ApiException.InvalidRequest(ketQuaQuet.ThongBao ?? "Không thể đọc số giấy tờ từ ảnh tải lên.");

                var soGiayToMoi = !string.IsNullOrWhiteSpace(request.SoGiayTo) ? request.SoGiayTo.Trim() : hoSo.SoGiayTo;
                if (!string.Equals(ketQuaQuet.SoGiayTo.Trim(), soGiayToMoi, StringComparison.OrdinalIgnoreCase))
                    throw ApiException.InvalidRequest("Số giấy tờ nhập vào không khớp với ảnh CCCD đã quét.");

                hoSo.SoGiayTo = soGiayToMoi;
                hoSo.DuLieuCccdMaHoa = _cccdDataProtector.Protect(JsonSerializer.Serialize(new
                {
                    loaiGiayTo = hoSo.LoaiGiayTo,
                    hoTen = ketQuaQuet.HoTen,
                    soGiayTo = ketQuaQuet.SoGiayTo,
                    ngaySinh = ketQuaQuet.NgaySinh,
                    gioiTinh = ketQuaQuet.GioiTinh,
                    ngayCap = ketQuaQuet.NgayCap,
                    // ?u ti?n n?i c?p ng??i d?ng nh?p tay; fallback OCR n?u tr?ng.
                    noiCap = !string.IsNullOrWhiteSpace(request.NoiCap) ? request.NoiCap.Trim() : ketQuaQuet.NoiCap,
                    diaChi = ketQuaQuet.DiaChi,
                    quocTich = ketQuaQuet.QuocTich,
                    nguyenQuan = ketQuaQuet.NguyenQuan
                }));
                hoSo.AnhGiayToMatTruocUrl = string.Empty;
                hoSo.AnhGiayToMatSauUrl = string.Empty;
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

            // Dọn avatar cũ nếu đã thay
            if (request.AnhDaiDien != null && request.AnhDaiDien.Length > 0 && !string.IsNullOrWhiteSpace(oldAvatar))
            {
                try
                {
                    var rel = oldAvatar.TrimStart('/');
                    var full = Path.Combine(_env.WebRootPath, rel.Replace('/', Path.DirectorySeparatorChar));
                    if (File.Exists(full)) File.Delete(full);
                }
                catch { /* ignore */ }
            }

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

