using educodeai_server.Models;

namespace educodeai_server.Services.Security;

public enum RefreshTokenDisposition
{
    Active,
    Expired,
    ReuseDetected
}

public static class RefreshTokenRacePolicy
{
    public static RefreshTokenDisposition Classify(RefreshTokenModel token, DateTime nowUtc)
    {
        if (token.NgayThuHoi.HasValue || !string.IsNullOrEmpty(token.ReplacedByTokenHash))
        {
            return RefreshTokenDisposition.ReuseDetected;
        }

        return token.ThoiGianHetHan <= nowUtc
            ? RefreshTokenDisposition.Expired
            : RefreshTokenDisposition.Active;
    }
}
