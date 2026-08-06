using educodeai_server.Models;
using educodeai_server.Services.Security;

namespace educodeai_server.Tests.Auth;

public sealed class RefreshTokenRacePolicyTests
{
    [Fact]
    public void ClassifyClaimLoser_WhenTokenWasRotated_RequiresFamilyRevocation()
    {
        var token = Token(ngayThuHoi: DateTime.UtcNow, replacedBy: "replacement-hash");

        var result = RefreshTokenRacePolicy.Classify(token, DateTime.UtcNow);

        Assert.Equal(RefreshTokenDisposition.ReuseDetected, result);
    }

    [Fact]
    public void ClassifyClaimLoser_WhenTokenRemainsActive_TreatsFailureAsTransient()
    {
        var token = Token();

        var result = RefreshTokenRacePolicy.Classify(token, DateTime.UtcNow);

        Assert.Equal(RefreshTokenDisposition.Active, result);
    }

    [Fact]
    public void Classify_WhenExpired_DoesNotMisclassifyAsReplay()
    {
        var now = DateTime.UtcNow;
        var token = Token(expiresAt: now.AddSeconds(-1));

        var result = RefreshTokenRacePolicy.Classify(token, now);

        Assert.Equal(RefreshTokenDisposition.Expired, result);
    }

    private static RefreshTokenModel Token(
        DateTime? ngayThuHoi = null,
        string? replacedBy = null,
        DateTime? expiresAt = null) => new()
        {
            MaNguoiDung = 1,
            TokenHash = "token-hash",
            FamilyId = "family-id",
            NgayTao = DateTime.UtcNow.AddMinutes(-1),
            ThoiGianHetHan = expiresAt ?? DateTime.UtcNow.AddMinutes(5),
            NgayThuHoi = ngayThuHoi,
            ReplacedByTokenHash = replacedBy
        };
}
