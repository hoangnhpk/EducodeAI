using educodeai_server.Models;

namespace educodeai_server.Services.Interface
{
    /// <summary>
    /// Token service duy nhất phát JWT access token và refresh token cho phạm vi bảo mật xác thực.
    /// </summary>
    public interface ITokenService
    {
        /// <summary>Sinh JWT access token 15 phút với claims: id, MaNguoiDung, NameIdentifier, Email, MaPhien, Role, jti, iat.</summary>
        AccessTokenResult CreateAccessToken(NguoiDungModel user, int maPhien);

        /// <summary>Sinh refresh token CSPRNG 256-bit, trả giá trị plain (chỉ hiển thị một lần) và hash lưu DB.</summary>
        RefreshTokenMaterial CreateRefreshTokenMaterial();

        /// <summary>Hash refresh token dạng plain để so sánh với hash lưu DB.</summary>
        string HashRefreshToken(string plainToken);

        /// <summary>Thời hạn sống của refresh token.</summary>
        TimeSpan RefreshTokenLifetime { get; }
    }

    public sealed record AccessTokenResult(string Token, string Jti, DateTime IssuedAtUtc, DateTime ExpiresAtUtc);

    public sealed record RefreshTokenMaterial(string PlainToken, string TokenHash, string FamilyId, string Jti, DateTime ExpiresAtUtc);
}
