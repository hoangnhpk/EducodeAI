using educodeai_server.Helpers;

namespace educodeai_server.Services.Security;

public static class PasswordLoginContract
{
    public static string NormalizeAccount(string? account) =>
        (account ?? string.Empty).Trim().ToLowerInvariant();

    public static void EnsureOtpDelivered(bool wasDelivered)
    {
        if (!wasDelivered)
        {
            throw ApiException.InvalidRequest(
                "Không thể gửi mã OTP. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.");
        }
    }
}
