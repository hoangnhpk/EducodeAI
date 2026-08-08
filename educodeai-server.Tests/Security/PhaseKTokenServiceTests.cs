using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using educodeai_server.Models;
using educodeai_server.Services.Implementation;
using Microsoft.Extensions.Configuration;

namespace educodeai_server.Tests.Security;

public sealed class PhaseKTokenServiceTests
{
    // ---- Access token (C.2): TTL <=15', có MaPhien/jti/iat ----

    [Fact]
    public void CreateAccessToken_TtlWithin15Minutes()
    {
        var svc = NewService();
        var user = new NguoiDungModel { MaNguoiDung = 7, TaiKhoan = "u", MatKhau = "x", Email = "u@example.com", VaiTro = 2 };

        var result = svc.CreateAccessToken(user, maPhien: 42);

        var ttl = result.ExpiresAtUtc - result.IssuedAtUtc;
        Assert.True(ttl <= TimeSpan.FromMinutes(15));
        Assert.True(ttl > TimeSpan.FromMinutes(14));
    }

    [Fact]
    public void CreateAccessToken_HasMaPhienJtiIatClaims()
    {
        var svc = NewService();
        var user = new NguoiDungModel { MaNguoiDung = 7, TaiKhoan = "u", MatKhau = "x", Email = "u@example.com", VaiTro = 1 };

        var result = svc.CreateAccessToken(user, maPhien: 99);

        var token = new JwtSecurityTokenHandler().ReadJwtToken(result.Token);
        Assert.Equal("99", token.Claims.First(c => c.Type == "MaPhien").Value);
        Assert.Equal(result.Jti, token.Claims.First(c => c.Type == JwtRegisteredClaimNames.Jti).Value);
        Assert.Contains(token.Claims, c => c.Type == JwtRegisteredClaimNames.Iat);
        Assert.Equal("GiangVien", token.Claims.First(c => c.Type == ClaimTypes.Role).Value);
    }

    [Fact]
    public void CreateAccessToken_RoleMapsByVaiTro()
    {
        var svc = NewService();

        var admin = svc.CreateAccessToken(new NguoiDungModel { MaNguoiDung = 1, TaiKhoan = "a", MatKhau = "x", VaiTro = 0 }, 1);
        var hocVien = svc.CreateAccessToken(new NguoiDungModel { MaNguoiDung = 2, TaiKhoan = "h", MatKhau = "x", VaiTro = 2 }, 1);

        Assert.Equal("Admin", RoleOf(admin.Token));
        Assert.Equal("HocVien", RoleOf(hocVien.Token));
    }

    // ---- Refresh token (C.4): CSPRNG + hash SHA256, không lưu plain ----

    [Fact]
    public void CreateRefreshTokenMaterial_HashMatchesPlain()
    {
        var svc = NewService();

        var material = svc.CreateRefreshTokenMaterial();

        Assert.Equal(material.TokenHash, svc.HashRefreshToken(material.PlainToken));
        Assert.NotEqual(material.PlainToken, material.TokenHash);
    }

    [Fact]
    public void CreateRefreshTokenMaterial_ProducesUniqueTokens()
    {
        var svc = NewService();

        var a = svc.CreateRefreshTokenMaterial();
        var b = svc.CreateRefreshTokenMaterial();

        Assert.NotEqual(a.PlainToken, b.PlainToken);
        Assert.NotEqual(a.FamilyId, b.FamilyId);
    }

    [Fact]
    public void HashRefreshToken_IsDeterministicSha256Hex()
    {
        var svc = NewService();

        var hash = svc.HashRefreshToken("abc");

        // SHA256 hex = 64 ký tự, deterministic.
        Assert.Equal(64, hash.Length);
        Assert.Equal(hash, svc.HashRefreshToken("abc"));
    }

    [Fact]
    public void HashRefreshToken_EmptyInput_Throws()
    {
        var svc = NewService();
        Assert.Throws<ArgumentException>(() => svc.HashRefreshToken(""));
    }

    private static string RoleOf(string token) =>
        new JwtSecurityTokenHandler().ReadJwtToken(token).Claims.First(c => c.Type == ClaimTypes.Role).Value;

    private static TokenService NewService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "test-signing-key-at-least-32-bytes-long-for-hs256",
                ["Jwt:Issuer"] = "educodeai-server",
                ["Jwt:Audience"] = "educodeai-client",
            })
            .Build();
        return new TokenService(config);
    }
}
