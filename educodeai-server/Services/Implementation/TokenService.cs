using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.IdentityModel.Tokens;

namespace educodeai_server.Services.Implementation
{
    /// <summary>
    /// Token service duy nhất. JWT access token 15 phút có jti/iat, refresh token CSPRNG 256-bit chỉ trả về plain một lần.
    /// </summary>
    public sealed class TokenService : ITokenService
    {
        private const int AccessTokenMinutes = 15;
        private const int RefreshTokenDays = 14;
        private const int AbsoluteRefreshTokenHours = 72;
        private const int RefreshTokenByteLength = 32; // 256-bit
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public TimeSpan RefreshTokenLifetime => TimeSpan.FromDays(RefreshTokenDays);

        public DateTime GetRefreshFamilyDeadlineUtc(DateTime nowUtc) => nowUtc.AddHours(AbsoluteRefreshTokenHours);

        public AccessTokenResult CreateAccessToken(NguoiDungModel user, int maPhien)
        {
            var issuedAt = DateTime.UtcNow;
            var expiresAt = issuedAt.AddMinutes(AccessTokenMinutes);
            var jti = Guid.NewGuid().ToString("N");

            var roleName = user.VaiTro == 0 ? "Admin" : (user.VaiTro == 1 ? "GiangVien" : "HocVien");

            var claims = new List<Claim>
            {
                new Claim("id", user.MaNguoiDung.ToString()),
                new Claim("MaNguoiDung", user.MaNguoiDung.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.MaNguoiDung.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim("MaPhien", maPhien.ToString()),
                new Claim(ClaimTypes.Role, roleName),
                new Claim(JwtRegisteredClaimNames.Jti, jti),
                new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(issuedAt).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            };

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.")));
            var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                notBefore: issuedAt,
                expires: expiresAt,
                signingCredentials: creds);

            var serialized = new JwtSecurityTokenHandler().WriteToken(token);
            return new AccessTokenResult(serialized, jti, issuedAt, expiresAt);
        }

        public RefreshTokenMaterial CreateRefreshTokenMaterial()
        {
            var bytes = RandomNumberGenerator.GetBytes(RefreshTokenByteLength);
            var plain = Convert.ToBase64String(bytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');
            var hash = HashRefreshToken(plain);
            var familyId = Guid.NewGuid().ToString("N");
            var jti = Guid.NewGuid().ToString("N");
            var expiresAt = DateTime.UtcNow.Add(RefreshTokenLifetime);
            return new RefreshTokenMaterial(plain, hash, familyId, jti, expiresAt);
        }

        public string HashRefreshToken(string plainToken)
        {
            if (string.IsNullOrEmpty(plainToken))
            {
                throw new ArgumentException("plainToken must not be empty.", nameof(plainToken));
            }
            var bytes = Encoding.UTF8.GetBytes(plainToken);
            var hashBytes = SHA256.HashData(bytes);
            return Convert.ToHexString(hashBytes);
        }
    }
}
