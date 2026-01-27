using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;
using educodeai_server.DTOs.NguoiDung;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace educodeai_server.Services.Implementation
{
    public class NguoiDungService : INguoiDungService
    {
        private readonly INguoiDungRepository _repository;
        private readonly IConfiguration _configuration;

        public NguoiDungService(INguoiDungRepository repository, IConfiguration configuration)
        {
            _repository = repository;
            _configuration = configuration;
        }

        // ================= LOGIN =================
        public async Task<NguoiDungModel?> CheckLoginAsync(string identifier, string password)
        {
            var user = await _repository.GetUserByIdentifierAsync(identifier);
            if (user == null) return null;

            // 🔐 SO SÁNH BCRYPT
            bool isValid = BCrypt.Net.BCrypt.Verify(password, user.MatKhau);
            return isValid ? user : null;
        }

        // ================= QUÊN MẬT KHẨU =================
        public async Task<bool> IsEmailExistAsync(string email)
        {
            var user = await _repository.GetUserByEmailAsync(email);
            return user != null;
        }

        public async Task<bool> UpdatePasswordAsync(string email, string newPassword)
        {
            var user = await _repository.GetUserByEmailAsync(email);
            if (user == null) return false;

            // 🔐 HASH MẬT KHẨU MỚI
            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(newPassword);

            return await _repository.UpdateUserAsync(user);
        }

        // ================= ĐĂNG KÝ =================
        public async Task<bool> RegisterAsync(RegisterDto model)
        {
            var newUser = new NguoiDungModel
            {
                HoTen = model.HoTen,
                Email = model.Email,
                TaiKhoan = model.TaiKhoan,

                // 🔐 HASH NGAY TỪ ĐẦU
                MatKhau = BCrypt.Net.BCrypt.HashPassword(model.MatKhau),

                NgayThamGia = DateTime.Now,
                VaiTro = 3 // mặc định học viên
            };

            return await _repository.AddUserAsync(newUser);
        }

        // ================= JWT =================
        public string GenerateJwtToken(NguoiDungModel user)
        {
            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])
            );
            Console.WriteLine("JWT KEY (SIGN): " + _configuration["Jwt:Key"]);//Tạm thời log key

            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            string role = user.VaiTro switch
            {
                1 => "Admin",
                2 => "GiangVien",
                3 => "HocVien",
                _ => "User"
            };

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email ?? ""),
                new Claim("MaNguoiDung", user.MaNguoiDung.ToString()),
                new Claim(ClaimTypes.Name, user.HoTen ?? ""),
                new Claim(ClaimTypes.Role, role)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ================= ĐỔI MẬT KHẨU =================
        public async Task DoiMatKhauAsync(int userId, DoiMatKhauDTO dto)
        {
            if (dto.MatKhauMoi != dto.XacNhanMatKhauMoi)
                throw new Exception("Mật khẩu xác nhận không khớp");

            var user = await _repository.GetUserByIdAsync(userId);
            if (user == null)
                throw new Exception("Người dùng không tồn tại");

            // 🔐 CHECK MẬT KHẨU CŨ
            if (!BCrypt.Net.BCrypt.Verify(dto.MatKhauCu, user.MatKhau))
                throw new Exception("Mật khẩu hiện tại không đúng");

            // 🔐 HASH MẬT KHẨU MỚI
            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.MatKhauMoi);

            var updated = await _repository.UpdateUserAsync(user);
            if (!updated)
                throw new Exception("Không thể cập nhật mật khẩu");
        }
    }
}
