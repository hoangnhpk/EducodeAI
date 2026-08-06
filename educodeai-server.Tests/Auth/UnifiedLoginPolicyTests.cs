using educodeai_server.Models;
using educodeai_server.Services.Security;

namespace educodeai_server.Tests.Auth;

public sealed class UnifiedLoginPolicyTests
{
    public static TheoryData<LoginProvider> Providers => new()
    {
        LoginProvider.Password,
        LoginProvider.Google,
        LoginProvider.Facebook
    };

    [Theory]
    [MemberData(nameof(Providers))]
    public void NewOrRevokedDevice_RequiresOtp_ForEveryProvider(LoginProvider provider)
    {
        var sessions = new[] { CreateSession("known", isActive: false, trustedUntil: null, revokedAt: DateTime.UtcNow) };

        var decision = UnifiedLoginPolicy.Decide(provider, sessions, "new-device", securityVersion: 4, DateTime.UtcNow);

        Assert.Equal(LoginPolicyOutcome.RequireNewDeviceOtp, decision.Outcome);
    }

    [Theory]
    [MemberData(nameof(Providers))]
    public void TrustedDevice_CompletesLoginWithoutOtp_ForEveryProvider(LoginProvider provider)
    {
        var now = DateTime.UtcNow;
        var sessions = new[] { CreateSession("trusted", isActive: false, trustedUntil: now.AddDays(1), trustVersion: 4) };

        var decision = UnifiedLoginPolicy.Decide(provider, sessions, "trusted", securityVersion: 4, now);

        Assert.Equal(LoginPolicyOutcome.CompleteLogin, decision.Outcome);
    }

    [Theory]
    [MemberData(nameof(Providers))]
    public void DeviceLimit_RequiresReplacement_ForEveryProvider(LoginProvider provider)
    {
        var now = DateTime.UtcNow;
        var sessions = Enumerable.Range(1, 3)
            .Select(index => CreateSession($"device-{index}", isActive: true, trustedUntil: now.AddDays(1), trustVersion: 4, lastActivity: now.AddMinutes(index)))
            .ToArray();

        var decision = UnifiedLoginPolicy.Decide(provider, sessions, "new-device", securityVersion: 4, now);

        Assert.Equal(LoginPolicyOutcome.RequireDeviceReplacementOtp, decision.Outcome);
        Assert.Equal("device-1", decision.SessionToReplace?.MaThietBi);
    }

    [Fact]
    public void FacebookIdentity_RejectsProfileSubjectDifferentFromVerifiedTokenSubject()
    {
        Assert.Throws<InvalidOperationException>(() =>
            SocialProviderIdentityPolicy.ValidateFacebook(
                expectedAppId: "app-1",
                tokenAppId: "app-1",
                tokenSubject: "subject-1",
                profileSubject: "subject-2",
                email: "verified@example.test"));
    }

    [Fact]
    public void FacebookIdentity_AcceptsMatchingAppAndSubjectWithEmail()
    {
        SocialProviderIdentityPolicy.ValidateFacebook(
            expectedAppId: "app-1",
            tokenAppId: "app-1",
            tokenSubject: "subject-1",
            profileSubject: "subject-1",
            email: "verified@example.test");
    }

    private static PhienDangNhapModel CreateSession(
        string deviceId,
        bool isActive,
        DateTime? trustedUntil,
        DateTime? revokedAt = null,
        int trustVersion = 0,
        DateTime? lastActivity = null) => new()
        {
            MaThietBi = deviceId,
            TenThietBi = deviceId,
            DangHoatDong = isActive,
            TrustedUntilUtc = trustedUntil,
            TrustRevokedAtUtc = revokedAt,
            TrustVersion = trustVersion,
            ThoiGianHoatDongCuoi = lastActivity ?? DateTime.UtcNow
        };
}
