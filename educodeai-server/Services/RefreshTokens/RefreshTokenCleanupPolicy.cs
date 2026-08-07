using educodeai_server.Models;

namespace educodeai_server.Services.RefreshTokens;

public static class RefreshTokenCleanupPolicy
{
    public static DateTime GetCutoff(TimeProvider timeProvider, int retentionDays) =>
        timeProvider.GetUtcNow().UtcDateTime.AddDays(-Math.Max(0, retentionDays));

    public static bool IsEligible(RefreshTokenModel token, DateTime cutoff) =>
        token.ThoiGianHetHan < cutoff &&
        (token.NgayThuHoi is null || token.NgayThuHoi < cutoff);
}
