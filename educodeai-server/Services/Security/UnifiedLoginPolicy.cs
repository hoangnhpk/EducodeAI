using educodeai_server.Models;

namespace educodeai_server.Services.Security;

public enum LoginProvider
{
    Password,
    Google,
    Facebook
}

public enum LoginPolicyOutcome
{
    CompleteLogin,
    RequireNewDeviceOtp,
    RequireDeviceReplacementOtp
}

public sealed record LoginPolicyDecision(LoginPolicyOutcome Outcome, PhienDangNhapModel? SessionToReplace = null);

public static class UnifiedLoginPolicy
{
    private const int MaxActiveDevices = 3;

    public static LoginPolicyDecision Decide(
        LoginProvider provider,
        IEnumerable<PhienDangNhapModel> sessions,
        string deviceId,
        int securityVersion,
        DateTime now)
    {
        _ = provider;
        var sessionList = sessions.ToList();
        var currentSession = sessionList.FirstOrDefault(session =>
            session.MaThietBi == deviceId
            && session.TrustRevokedAtUtc == null
            && session.TrustedUntilUtc > now
            && session.TrustVersion == securityVersion);

        if (currentSession != null)
            return new LoginPolicyDecision(LoginPolicyOutcome.CompleteLogin);

        var activeSessions = sessionList.Where(session => session.DangHoatDong).ToList();
        if (activeSessions.Count >= MaxActiveDevices)
        {
            return new LoginPolicyDecision(
                LoginPolicyOutcome.RequireDeviceReplacementOtp,
                activeSessions.OrderBy(session => session.ThoiGianHoatDongCuoi).First());
        }

        return new LoginPolicyDecision(LoginPolicyOutcome.RequireNewDeviceOtp);
    }
}

public static class SocialProviderIdentityPolicy
{
    public static void ValidateFacebook(
        string expectedAppId,
        string? tokenAppId,
        string? tokenSubject,
        string? profileSubject,
        string? email)
    {
        if (!string.Equals(tokenAppId, expectedAppId, StringComparison.Ordinal)
            || string.IsNullOrWhiteSpace(tokenSubject)
            || !string.Equals(tokenSubject, profileSubject, StringComparison.Ordinal)
            || string.IsNullOrWhiteSpace(email))
        {
            throw new InvalidOperationException("Facebook identity verification failed.");
        }
    }
}
