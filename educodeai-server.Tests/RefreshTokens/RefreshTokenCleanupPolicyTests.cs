using educodeai_server.Models;
using educodeai_server.Services.RefreshTokens;

namespace educodeai_server.Tests.RefreshTokens;

public sealed class RefreshTokenCleanupPolicyTests
{
    private static readonly DateTime Now = new(2026, 8, 4, 12, 0, 0, DateTimeKind.Utc);
    private static readonly DateTime Cutoff = Now.AddDays(-30);

    [Theory]
    [InlineData(-31, null, true)]
    [InlineData(-31, -31, true)]
    [InlineData(-1, null, false)]
    [InlineData(-31, -1, false)]
    [InlineData(-30, -31, false)]
    public void IsEligible_DeletesOnlyTerminalRowsOutsideRetention(
        int expiryDaysFromNow,
        int? revokedDaysFromNow,
        bool expected)
    {
        var token = Token(
            Now.AddDays(expiryDaysFromNow),
            revokedDaysFromNow is null ? null : Now.AddDays(revokedDaysFromNow.Value));

        Assert.Equal(expected, RefreshTokenCleanupPolicy.IsEligible(token, Cutoff));
    }

    [Fact]
    public void GetCutoff_UsesInjectedClock()
    {
        var clock = new FixedTimeProvider(new DateTimeOffset(Now));

        Assert.Equal(Cutoff, RefreshTokenCleanupPolicy.GetCutoff(clock, 30));
    }

    private static RefreshTokenModel Token(DateTime expires, DateTime? revoked) => new()
    {
        TokenHash = "synthetic-hash",
        FamilyId = "synthetic-family",
        ThoiGianHetHan = expires,
        NgayThuHoi = revoked
    };

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }
}
