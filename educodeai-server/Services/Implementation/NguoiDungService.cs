using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;
using educodeai_server.DTOs.NguoiDung;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
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

        // Fix lỗi gạch đỏ: Cần thực thi hàm này từ Interface
        public async Task<NguoiDungModel?> GetUserByIdentifierAsync(string identifier)
        {
            if (string.IsNullOrWhiteSpace(identifier)) return null;
            return await _repository.GetUserByIdentifierAsync(identifier.Trim());
        }

        public async Task<NguoiDungModel?> CheckLoginAsync(string identifier, string password)
        {
            var user = await GetUserByIdentifierAsync(identifier);
            // Sử dụng BCrypt để kiểm tra mật khẩu đã mã hóa
            if (user != null && BCrypt.Net.BCrypt.Verify(password, user.MatKhau))
            {
                return user;
            }
            return null;
        }

        public async Task<bool> RegisterAsync(RegisterDto model)
        {
            var newUser = new NguoiDungModel
            {
                HoTen = model.HoTen,
                Email = model.Email.Trim().ToLower(),
                TaiKhoan = model.TaiKhoan.Trim(),
                MatKhau = BCrypt.Net.BCrypt.HashPassword(model.MatKhau),
                NgayThamGia = DateTime.Now,

                // Bổ sung các giá trị mặc định để tránh lỗi logic/font
                VaiTro = 2, 
                TrangThai = "Hoạt động", // Gán trực tiếp chuỗi chuẩn
                AnhDaiDien = null,
                GoogleID = null
            };

            // Đảm bảo Repository trả về true nếu SaveChanges > 0
            return await _repository.AddUserAsync(newUser);
        }

        public async Task<bool> UpdatePasswordAsync(string email, string newPassword)
        {
            var user = await _repository.GetUserByEmailAsync(email);
            if (user == null) return false;

            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(newPassword);
            return await _repository.UpdateUserAsync(user);
        }

        public async Task<bool> IsEmailExistAsync(string email) =>
            await _repository.GetUserByEmailAsync(email) != null;

        public string GenerateJwtToken(NguoiDungModel user)
        {
            // Logic tạo Token giữ nguyên như bạn đã viết...
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim("id", user.MaNguoiDung.ToString()),
                new Claim(ClaimTypes.Name, user.HoTen ?? ""),
                //new Claim(ClaimTypes.Role, role)
            };
            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Audience"],
                claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: credentials);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
