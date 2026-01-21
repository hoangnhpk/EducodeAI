using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;
using educodeai_server.DTOs.NguoiDung; // Đảm bảo đã import DTO
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

        public async Task<NguoiDungModel?> CheckLoginAsync(string identifier, string password)
        {
            return await _repository.GetUserForLoginAsync(identifier, password);
        }
        // --- MỚI: KIỂM TRA EMAIL TỒN TẠI (Dùng cho Quên mật khẩu) ---
        public async Task<bool> IsEmailExistAsync(string email)
        {
            // Bạn cần thêm hàm này vào Repository
            var user = await _repository.GetUserByEmailAsync(email);
            return user != null;
        }

        // --- MỚI: CẬP NHẬT MẬT KHẨU MỚI ---
        public async Task<bool> UpdatePasswordAsync(string email, string newPassword)
        {
            var user = await _repository.GetUserByEmailAsync(email);
            if (user == null) return false;

            user.MatKhau = newPassword; // Cập nhật mật khẩu mới
            return await _repository.UpdateUserAsync(user); // Bạn cần thêm hàm Update vào Repository
        }
        // --- BỔ SUNG HÀM ĐĂNG KÝ NÀY ---
        public async Task<bool> RegisterAsync(RegisterDto model)
        {
            // Chuyển đổi từ DTO sang Model Database
            var newUser = new NguoiDungModel
            {
                HoTen = model.HoTen,
                Email = model.Email,
                TaiKhoan = model.TaiKhoan,
                MatKhau = model.MatKhau, // Sau này nên dùng BCrypt để mã hóa
                NgayThamGia = DateTime.Now
            };

            // Gọi Repository để lưu vào Database thông qua DbContext
            return await _repository.AddUserAsync(newUser);
        }

        public string GenerateJwtToken(NguoiDungModel user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim("id", user.MaNguoiDung.ToString()),
                new Claim(ClaimTypes.Name, user.HoTen ?? ""),
                new Claim(ClaimTypes.Role, "User")
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}