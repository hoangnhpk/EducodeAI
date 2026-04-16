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
            var user = await LayNguoiDungKemThietBiAsync(request.TaiKhoan);
            if (user == null) throw new Exception("Tài khoản hoặc mật khẩu không chính xác.");
            
            await KiemTraTrangThaiKhoaAsync(user);

            if (!BCrypt.Net.BCrypt.Verify(request.MatKhau, user.MatKhau))
                throw new Exception("Tài khoản hoặc mật khẩu không chính xác.");

            KiemTraGioiHanThietBi(user, request.MaThietBi);
            return await XuLyDangNhapThanhCongAsync(user, request.MaThietBi, request.TenThietBi);
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
        private async Task<NguoiDungModel?> LayNguoiDungKemThietBiAsync(string t) => await _context.NguoiDungs.Include(u => u.DanhSachPhienDangNhap).FirstOrDefaultAsync(u => u.TaiKhoan == t || u.Email == t);
        
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
                new Claim("id", u.MaNguoiDung.ToString()),
                new Claim("MaNguoiDung", u.MaNguoiDung.ToString()), 
                new Claim(ClaimTypes.NameIdentifier, u.MaNguoiDung.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, u.Email ?? ""), 
                new Claim("MaPhien", m.ToString()), 
                new Claim(ClaimTypes.Role, u.VaiTro == 0 ? "Admin" : (u.VaiTro == 1 ? "GiangVien" : "HocVien")) 
            };
            var token = new JwtSecurityToken(_config["Jwt:Issuer"], _config["Jwt:Audience"], claims, expires: DateTime.UtcNow.AddMinutes(1440), signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"])), SecurityAlgorithms.HmacSha256));
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private void KiemTraGioiHanThietBi(NguoiDungModel u, string d) { if (u.DanhSachPhienDangNhap.Count(p => p.DangHoatDong) >= 3 && !u.DanhSachPhienDangNhap.Any(p => p.MaThietBi == d && p.DangHoatDong)) throw new Exception("Đã đạt giới hạn 3 thiết bị."); }
        public async Task<object> XacNhanOtpVaDangNhapAsync(XacNhanOtpRequest r) { throw new NotImplementedException(); }
        public async Task<bool> YeuCauDangKyAsync(DangKyRequest r, string i) { throw new NotImplementedException(); }
        public async Task<object> XacNhanDangKyVaLuuDbAsync(XacNhanOtpRequest r) { throw new NotImplementedException(); }
        public async Task<object> LayDanhSachThietBiAsync(int m, string d) { throw new NotImplementedException(); }
        public async Task<bool> DangXuatAsync(int m, string d) { throw new NotImplementedException(); }
        public async Task<bool> YeuCauOtpDangXuatTuXaAsync(int m) { throw new NotImplementedException(); }
        public async Task<bool> XacNhanDangXuatTuXaAsync(int m, DangXuatTuXaRequest r) { throw new NotImplementedException(); }
        public async Task<object> YeuCauQuenMatKhauAsync(QuenMatKhauRequest r, string i) { throw new NotImplementedException(); }
        public async Task<object> DatLaiMatKhauAsync(DatLaiMatKhauRequest r) { throw new NotImplementedException(); }
        public async Task<bool> DoiMatKhauAsync(int m, DoiMatKhauRequest r) { throw new NotImplementedException(); }
        #endregion
    }
}