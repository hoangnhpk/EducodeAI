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
        private readonly IMemoryCache _memoryCache; // Khai báo bộ nhớ tạm RAM

        public XacThucService(EduCodeAIDbContext context, IConfiguration config, ICaptchaService captchaService, IMemoryCache memoryCache)
        {
            _context = context;
            _config = config;
            _captchaService = captchaService;
            _memoryCache = memoryCache;
        }

        #region 1. LUỒNG ĐĂNG NHẬP

        public async Task<object> DangNhapAsync(DangNhapRequest request, string ipAddress)
        {
            // A. CHỐNG SPAM: Nếu đã bị chặn (sau 5 lần spam bất kỳ)
            KiemTraChanSpam(request.TaiKhoan, ipAddress);

            // 1. Tìm tài khoản
            var user = await LayNguoiDungKemThietBiAsync(request.TaiKhoan);
            if (user == null || user.TrangThai != "Hoạt động")
            {
                GhiNhanSpam(request.TaiKhoan, ipAddress);
                throw new Exception("Tài khoản không tồn tại hoặc bị khóa.");
            }

            // B. KIỂM TRA SỐ LẦN SAI MẬT KHẨU -> BẮT CAPTCHA
            int failCount = LaySoLanSaiMatKhau(request.TaiKhoan);
            if (failCount >= 3 && (string.IsNullOrEmpty(request.CaptchaToken) || request.CaptchaToken == "SKIP_CAPTCHA"))
            {
                return new { requiresCaptcha = true, message = "Bạn đã nhập sai quá 3 lần, vui lòng xác minh người máy." };
            }

            // 2. ƯU TIÊN KIỂM TRA MẬT KHẨU TRƯỚC
            if (!BCrypt.Net.BCrypt.Verify(request.MatKhau, user.MatKhau))
            {
                TangSoLanSaiMatKhau(request.TaiKhoan);
                GhiNhanSpam(request.TaiKhoan, ipAddress);
                throw new Exception("Tài khoản hoặc mật khẩu không chính xác.");
            }

            // 3. Nếu lọt qua bước 3, nghĩa là Frontend đã gửi Token Captcha XỊN -> Gọi Google kiểm tra!
            if (failCount >= 3)
            {
                await ValidateCaptchaAsync(request.CaptchaToken);
            }

            // 4. Reset số lần sai khi đăng nhập thành công pass 1
            ResetSoLanSaiMatKhau(request.TaiKhoan);

            // 5. Kiểm tra giới hạn 3 thiết bị
            KiemTraGioiHanThietBi(user, request.MaThietBi);

            // 6. Kiểm tra thiết bị mới để gọi OTP
            bool canXacThucSauk3Ngay = LaThietBiMoiHoacQuaHan(user, request.MaThietBi, 3);
            if (canXacThucSauk3Ngay)
            {
                await TaoVaGuiOtpAsync(user, "Mã OTP Đăng nhập hệ thống", "Bạn đang đăng nhập trên thiết bị mới hoặc thiết bị lâu ngày không sử dụng.");
                return new { requiresOtp = true, message = "Vui lòng nhập mã OTP đã được gửi về Email." };
            }

            // 7. Hoàn tất đăng nhập
            return await XuLyDangNhapThanhCongAsync(user, request.MaThietBi, request.TenThietBi);
        }

        public async Task<object> DangNhapGoogleAsync(GoogleLoginRequest request, string maThietBi, string tenThietBi)
        {
            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                user = new NguoiDungModel
                {
                    Email = request.Email,
                    HoTen = request.Name,
                    AnhDaiDien = request.Picture,
                    TaiKhoan = request.Email,
                    MatKhau = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                    VaiTro = 2,
                    TrangThai = "Hoạt động",
                    NgayThamGia = DateTime.UtcNow,
                    DanhSachPhienDangNhap = new List<PhienDangNhapModel>()
                };
                _context.NguoiDungs.Add(user);
                await _context.SaveChangesAsync();
            }

            KiemTraGioiHanThietBi(user, maThietBi);
            return await XuLyDangNhapThanhCongAsync(user, maThietBi, tenThietBi);
        }

        public async Task<object> DangNhapFacebookAsync(FacebookDTO request, string maThietBi, string tenThietBi)
        {
            if (string.IsNullOrEmpty(request.Email))
            {
                throw new Exception("Không lấy được Email từ tài khoản Facebook của bạn.");
            }

            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                string fbId = !string.IsNullOrEmpty(request.UserID) ? request.UserID : Guid.NewGuid().ToString("N").Substring(0, 10);
                user = new NguoiDungModel
                {
                    Email = request.Email,
                    HoTen = !string.IsNullOrEmpty(request.Name) ? request.Name : "Người dùng Facebook",
                    AnhDaiDien = request.Picture ?? "",
                    TaiKhoan = "fb_" + fbId.Substring(0, Math.Min(fbId.Length, 10)),
                    MatKhau = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                    VaiTro = 2,
                    TrangThai = "Hoạt động",
                    NgayThamGia = DateTime.UtcNow,
                    DanhSachPhienDangNhap = new List<PhienDangNhapModel>()
                };
                _context.NguoiDungs.Add(user);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Cập nhật lại tên và ảnh nếu có thay đổi
                user.HoTen = !string.IsNullOrEmpty(request.Name) ? request.Name : user.HoTen;
                if (!string.IsNullOrEmpty(request.Picture)) user.AnhDaiDien = request.Picture;
                await _context.SaveChangesAsync();
            }

            KiemTraGioiHanThietBi(user, maThietBi);
            return await XuLyDangNhapThanhCongAsync(user, maThietBi, tenThietBi);
        }

        public async Task<object> LamMoiTokenAsync(string refreshToken, string maThietBi)
        {
            // Kiểm tra Refresh Token trong Cache
            if (!_memoryCache.TryGetValue("RefreshToken_" + refreshToken, out (int MaNguoiDung, string MaThietBi) data))
                throw new Exception("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");

            if (data.MaThietBi != maThietBi)
                throw new Exception("Thiết bị không hợp lệ.");

            var user = await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.MaNguoiDung == data.MaNguoiDung);
            if (user == null) throw new Exception("Tài khoản không tồn tại.");

            var phien = user.DanhSachPhienDangNhap.FirstOrDefault(p => p.MaThietBi == maThietBi && p.DangHoatDong);
            if (phien == null) throw new Exception("Phiên đăng nhập không tồn tại hoặc đã bị đăng xuất.");

            // Xóa Refresh Token cũ và tạo mới
            _memoryCache.Remove("RefreshToken_" + refreshToken);
            
            return await XuLyDangNhapThanhCongAsync(user, maThietBi, phien.TenThietBi);
        }

        public async Task<object> XacNhanOtpVaDangNhapAsync(XacNhanOtpRequest request)
        {
            // 1. KÍNH LÚP SỐ 1: Bắt lỗi Frontend gửi lên bị NULL
            if (string.IsNullOrEmpty(request.OtpCode))
                throw new Exception("Mã OTP không được để trống.");

            var user = await LayNguoiDungKemThietBiAsync(request.TaiKhoan);
            if (user == null)
                throw new Exception("Tài khoản không tồn tại.");

            if (user.MaOTP != request.OtpCode || user.ThoiGianHetHanOTP < DateTime.UtcNow)
            {
                GhiNhanSpam(request.TaiKhoan, "");
                throw new Exception("Mã OTP không chính xác hoặc đã hết hạn.");
            }

            // 2. Nếu qua được 2 ải trên thì chắc chắn thành công
            return await XuLyDangNhapThanhCongAsync(user, request.MaThietBi, request.TenThietBi);
        }

        #endregion

        #region 2. LUỒNG ĐĂNG KÝ (Dùng RAM, không chạm DB)

        public async Task<bool> YeuCauDangKyAsync(DangKyRequest request, string ipAddress)
        {
            KiemTraChanSpam(request.Email, ipAddress);
            await ValidateCaptchaAsync(request.CaptchaToken);

            // 1. Kiểm tra Email có tồn tại thực sự trên mạng hay không
            if (!KiemTraTenMienEmailHopLe(request.Email))
            {
                GhiNhanSpam(request.Email, ipAddress);
                throw new Exception("Tên miền email không tồn tại hoặc không hợp lệ. Vui lòng dùng email thật.");
            }

            // 2. Kiểm tra trùng lặp trong Database
            if (await _context.NguoiDungs.AnyAsync(u => u.Email == request.Email))
                throw new Exception("Email này đã được sử dụng trong hệ thống.");

            // 3. Tạo mã OTP và lưu thông tin đăng ký vào RAM trong 5 phút
            string otp = new Random().Next(100000, 999999).ToString();
            var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(5));
            _memoryCache.Set("Reg_" + request.Email, (Request: request, Otp: otp), cacheOptions);

            // 4. Gửi OTP qua Email
            string body = $"Mã OTP để hoàn tất đăng ký tài khoản EduCodeAI của bạn là: <b>{otp}</b>. Mã này sẽ hết hạn sau 5 phút.";
            await EmailHelper.SendEmailAsync(request.Email, "Xác minh tài khoản EduCodeAI", body);

            return true;
        }

        public async Task<object> XacNhanDangKyVaLuuDbAsync(XacNhanOtpRequest request)
        {
            // 1. Tìm thông tin đăng ký đang treo trên RAM bằng Email (Frontend gửi Email vào trường TaiKhoan)
            string email = request.TaiKhoan;

            if (!_memoryCache.TryGetValue("Reg_" + email, out (DangKyRequest Request, string Otp) cacheData))
                throw new Exception("Yêu cầu đăng ký không tồn tại hoặc đã quá 5 phút (hết hạn).");

            // 2. Kiểm tra mã OTP
            if (cacheData.Otp != request.OtpCode)
                throw new Exception("Mã OTP không chính xác.");

            // 3. ĐÚNG OTP -> Lưu chính thức vào Database
            var newUser = new NguoiDungModel
            {
                TaiKhoan = cacheData.Request.Email,
                Email = cacheData.Request.Email,
                HoTen = cacheData.Request.HoTen,
                MatKhau = BCrypt.Net.BCrypt.HashPassword(cacheData.Request.MatKhau),
                VaiTro = 2,
                TrangThai = "Hoạt động",
                NgayThamGia = DateTime.UtcNow,

                // QUAN TRỌNG: Phải khởi tạo list này để hàm XuLyDangNhapThanhCongAsync không bị lỗi Null
                DanhSachPhienDangNhap = new List<PhienDangNhapModel>()
            };

            _context.NguoiDungs.Add(newUser);
            await _context.SaveChangesAsync(); // Lưu user mới vào DB để có ID

            // 4. Dọn dẹp RAM
            _memoryCache.Remove("Reg_" + email);

            // 5. TỰ ĐỘNG TẠO PHIÊN ĐĂNG NHẬP VÀ TRẢ VỀ TOKEN
            // Gọi lại hàm Login thành công mà bạn đã viết sẵn để tạo JWT Token
            return await XuLyDangNhapThanhCongAsync(newUser, request.MaThietBi, request.TenThietBi);
        }

        #endregion

        #region 3. LUỒNG QUẢN LÝ THIẾT BỊ ĐĂNG NHẬP

        public async Task<object> LayDanhSachThietBiAsync(int maNguoiDung, string maThietBiHienTai)
        {
            return await _context.PhienDangNhaps
                .Where(p => p.MaNguoiDung == maNguoiDung && p.DangHoatDong)
                .Select(p => new
                {
                    p.MaPhien,
                    p.TenThietBi,
                    p.ThoiGianHoatDongCuoi,
                    IsCurrentDevice = p.MaThietBi == maThietBiHienTai
                })
                .ToListAsync();
        }

        public async Task<bool> DangXuatAsync(int maNguoiDung, string maThietBi)
        {
            var phien = await _context.PhienDangNhaps
                .FirstOrDefaultAsync(p => p.MaNguoiDung == maNguoiDung && p.MaThietBi == maThietBi && p.DangHoatDong);

            if (phien != null)
            {
                phien.DangHoatDong = false;
                await _context.SaveChangesAsync();
            }
            return true;
        }

        public async Task<bool> YeuCauOtpDangXuatTuXaAsync(int maNguoiDung)
        {
            var user = await _context.NguoiDungs.FindAsync(maNguoiDung);
            if (user == null) return false;

            await TaoVaGuiOtpAsync(user, "Mã OTP Đăng xuất từ xa", "Bạn đã yêu cầu đăng xuất khỏi các thiết bị khác.");
            return true;
        }

        public async Task<bool> XacNhanDangXuatTuXaAsync(int maNguoiDung, DangXuatTuXaRequest request)
        {
            await ValidateCaptchaAsync(request.CaptchaToken);

            var user = await _context.NguoiDungs.FindAsync(maNguoiDung);
            if (user == null || user.MaOTP != request.OtpCode || user.ThoiGianHetHanOTP < DateTime.UtcNow)
                throw new Exception("Mã OTP không hợp lệ hoặc đã hết hạn.");

            var phienDangHoatDong = _context.PhienDangNhaps.Where(p => p.MaNguoiDung == maNguoiDung && p.DangHoatDong);

            if (request.DangXuatTatCa)
            {
                await phienDangHoatDong.ForEachAsync(p => p.DangHoatDong = false);
            }
            else if (request.DanhSachMaPhien != null && request.DanhSachMaPhien.Any())
            {
                await phienDangHoatDong
                    .Where(p => request.DanhSachMaPhien.Contains(p.MaPhien))
                    .ForEachAsync(p => p.DangHoatDong = false);
            }

            user.MaOTP = null;
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region QUÊN MẬT KHẨU

        public async Task<object> YeuCauQuenMatKhauAsync(QuenMatKhauRequest request, string ipAddress)
        {
            KiemTraChanSpam(request.Email, ipAddress);

            // 1. Kiểm tra xem email có tồn tại trong DB không
            var user = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                GhiNhanSpam(request.Email, ipAddress);
                throw new Exception("Email không tồn tại trên hệ thống!");
            }

            // 2. Tạo mã OTP 6 số
            string otp = new Random().Next(100000, 999999).ToString();
            user.MaOTP = otp;
            user.ThoiGianHetHanOTP = DateTime.UtcNow.AddMinutes(5);
            await _context.SaveChangesAsync();

            // 3. Gửi Email cho người dùng
            string body = $"Mã xác nhận khôi phục mật khẩu của bạn là: <b style='font-size: 20px; color: #fb873f;'>{otp}</b>. Mã có hiệu lực trong 5 phút.";
            await EmailHelper.SendEmailAsync(user.Email, "Khôi phục mật khẩu EduCodeAI", body);

            return new
            {
                message = "Mã xác thực đã được gửi tới email của bạn!"
            };
        }

        public async Task<object> DatLaiMatKhauAsync(DatLaiMatKhauRequest request)
        {
            var user = await _context.NguoiDungs
                .Include(u => u.DanhSachPhienDangNhap)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                throw new Exception("Tài khoản không tồn tại.");

            // KIỂM TRA OTP
            if (user.MaOTP != request.OtpCode || user.ThoiGianHetHanOTP < DateTime.UtcNow)
                throw new Exception("Mã xác thực không chính xác hoặc đã hết hạn.");

            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(request.MatKhauMoi);
            user.MaOTP = null;
            await _context.SaveChangesAsync();

            return await XuLyDangNhapThanhCongAsync(user, request.MaThietBi, request.TenThietBi);
        }

        #endregion

        #region 4. CÁC HÀM HỖ TRỢ (PRIVATE HELPERS)

        private async Task ValidateCaptchaAsync(string token)
        {
            if (string.IsNullOrEmpty(token) || token == "string")
                throw new Exception("Vui lòng xác thực Captcha.");

            if (!await _captchaService.XacNhanCaptchaAsync(token))
                throw new Exception("Xác thực Captcha thất bại.");
        }

        private bool KiemTraTenMienEmailHopLe(string email)
        {
            try
            {
                // Chỉ cần kiểm tra định dạng email bằng MailAddress
                // Tránh dùng Dns.GetHostEntry vì nó hay ném SocketException 11004 nếu tên miền không có bản ghi A/AAAA
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        private async Task<NguoiDungModel?> LayNguoiDungKemThietBiAsync(string taiKhoan)
        {
            return await _context.NguoiDungs
                .Include(u => u.DanhSachPhienDangNhap)
                .FirstOrDefaultAsync(u => u.TaiKhoan == taiKhoan || u.Email == taiKhoan);
        }

        private void KiemTraGioiHanThietBi(NguoiDungModel user, string maThietBiHienTai)
        {
            // Yêu cầu: Không thể đăng nhập quá 3 phiên đăng nhập(3 thiết bị) cùng 1 tài khoản
            int gioiHanToiDa = 3;

            var danhSachHoatDong = user.DanhSachPhienDangNhap.Where(p => p.DangHoatDong).ToList();

            if (danhSachHoatDong.Count >= gioiHanToiDa && !danhSachHoatDong.Any(p => p.MaThietBi == maThietBiHienTai))
                throw new Exception($"Tài khoản đã đạt giới hạn {gioiHanToiDa} thiết bị đăng nhập. Vui lòng đăng xuất ở thiết bị khác.");
        }

        private bool LaThietBiMoiHoacQuaHan(NguoiDungModel user, string maThietBi, int soNgayToiDa)
        {
            var phien = user.DanhSachPhienDangNhap.FirstOrDefault(p => p.MaThietBi == maThietBi);

            if (phien == null) return true;

            if ((DateTime.UtcNow - phien.ThoiGianHoatDongCuoi).TotalDays > soNgayToiDa) return true;

            if (!phien.DangHoatDong) return true;

            return false;
        }

        private async Task TaoVaGuiOtpAsync(NguoiDungModel user, string subject, string messagePrefix)
        {
            string otp = new Random().Next(100000, 999999).ToString();
            user.MaOTP = otp;
            user.ThoiGianHetHanOTP = DateTime.UtcNow.AddMinutes(5);
            await _context.SaveChangesAsync();

            string body = $"{messagePrefix} Mã OTP của bạn là: <b>{otp}</b>. Mã có hiệu lực trong 5 phút.";
            await EmailHelper.SendEmailAsync(user.Email, subject, body);
        }

        private async Task<object> XuLyDangNhapThanhCongAsync(NguoiDungModel user, string maThietBi, string? tenThietBi)
        {
            var phien = user.DanhSachPhienDangNhap.FirstOrDefault(p => p.MaThietBi == maThietBi);
            if (phien == null)
            {
                phien = new PhienDangNhapModel
                {
                    MaNguoiDung = user.MaNguoiDung,
                    MaThietBi = maThietBi,
                    TenThietBi = tenThietBi ?? "Thiết bị không xác định",
                    ThoiGianDangNhap = DateTime.UtcNow
                };
                _context.PhienDangNhaps.Add(phien);
            }

            phien.ThoiGianHoatDongCuoi = DateTime.UtcNow;
            phien.DangHoatDong = true;
            user.NgayDangNhapCuoi = DateTime.UtcNow;
            user.MaOTP = null;

            await _context.SaveChangesAsync();

            // Tạo Refresh Token và lưu vào Cache (vòng đời token)
            string refreshToken = Guid.NewGuid().ToString();
            var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromDays(7));
            _memoryCache.Set("RefreshToken_" + refreshToken, (MaNguoiDung: user.MaNguoiDung, MaThietBi: maThietBi), cacheOptions);

            return new
            {
                requiresOtp = false,
                token = TaoJwtToken(user, phien.MaPhien),
                refreshToken = refreshToken,
                message = "Đăng nhập thành công",
                user = new
                {
                    maNguoiDung = user.MaNguoiDung,
                    taiKhoan = user.TaiKhoan,
                    hoTen = user.HoTen,
                    email = user.Email,
                    vaiTro = user.VaiTro
                }
            };
        }

        private string TaoJwtToken(NguoiDungModel user, int maPhien)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("id", user.MaNguoiDung.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim("MaPhien", maPhien.ToString()),
                new Claim(ClaimTypes.Role, user.VaiTro == 0 ? "Admin" : (user.VaiTro == 1 ? "GiangVien" : "HocVien"))
            };

            // Access Token có thời hạn ngắn (ví dụ 1 giờ)
            var token = new JwtSecurityToken(_config["Jwt:Issuer"], _config["Jwt:Audience"], claims,
                expires: DateTime.UtcNow.AddHours(1), signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // --- CÁC HÀM TRỢ GIÚP CHỐNG SPAM & SAI MẬT KHẨU ---

        private void KiemTraChanSpam(string identifier, string ipAddress)
        {
            if (_memoryCache.TryGetValue("Blocked_" + identifier, out _) || 
                (!string.IsNullOrEmpty(ipAddress) && _memoryCache.TryGetValue("BlockedIP_" + ipAddress, out _)))
            {
                throw new Exception("Bạn đã bị tạm chặn 30 phút do có quá nhiều yêu cầu thất bại.");
            }
        }

        private void GhiNhanSpam(string identifier, string ipAddress)
        {
            string keyId = "SpamCount_" + identifier;
            string keyIp = "SpamCountIP_" + ipAddress;

            int countId = _memoryCache.Get<int>(keyId) + 1;
            _memoryCache.Set(keyId, countId, TimeSpan.FromMinutes(30));

            if (countId >= 5)
            {
                _memoryCache.Set("Blocked_" + identifier, true, TimeSpan.FromMinutes(30));
            }

            if (!string.IsNullOrEmpty(ipAddress))
            {
                int countIp = _memoryCache.Get<int>(keyIp) + 1;
                _memoryCache.Set(keyIp, countIp, TimeSpan.FromMinutes(30));
                if (countIp >= 5)
                {
                    _memoryCache.Set("BlockedIP_" + ipAddress, true, TimeSpan.FromMinutes(30));
                }
            }
        }

        private int LaySoLanSaiMatKhau(string identifier)
        {
            return _memoryCache.Get<int>("FailPass_" + identifier);
        }

        private void TangSoLanSaiMatKhau(string identifier)
        {
            int count = LaySoLanSaiMatKhau(identifier) + 1;
            _memoryCache.Set("FailPass_" + identifier, count, TimeSpan.FromHours(1));
        }

        private void ResetSoLanSaiMatKhau(string identifier)
        {
            _memoryCache.Remove("FailPass_" + identifier);
        }

        #endregion
        #region 5. ĐỔI MẬT KHẨU (Có OTP)

        public async Task<bool> YeuCauOtpDoiMatKhauAsync(int maNguoiDung)
        {
            var user = await _context.NguoiDungs.FindAsync(maNguoiDung);
            if (user == null) throw new Exception("Không tìm thấy tài khoản.");

            await TaoVaGuiOtpAsync(user, "Mã OTP Đổi mật khẩu", "Bạn đang yêu cầu thay đổi mật khẩu tài khoản.");
            return true;
        }

        public async Task<bool> DoiMatKhauAsync(int maNguoiDung, DoiMatKhauRequest request)
        {
            var user = await _context.NguoiDungs.FindAsync(maNguoiDung);
            if (user == null) throw new Exception("Không tìm thấy tài khoản.");

            // 1. Kiểm tra OTP
            if (user.MaOTP != request.OtpCode || user.ThoiGianHetHanOTP < DateTime.UtcNow)
                throw new Exception("Mã OTP không chính xác hoặc đã hết hạn.");

            // 2. Kiểm tra Mật khẩu cũ
            if (!BCrypt.Net.BCrypt.Verify(request.MatKhauCu, user.MatKhau))
                throw new Exception("Mật khẩu hiện tại không chính xác.");

            // 3. Đổi mật khẩu và xóa OTP
            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(request.MatKhauMoi);
            user.MaOTP = null;
            await _context.SaveChangesAsync();

            return true;
        }

        #endregion
    }
}