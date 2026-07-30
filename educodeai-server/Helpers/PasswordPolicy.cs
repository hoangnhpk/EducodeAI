namespace educodeai_server.Helpers;

/// <summary>
/// Password policy dùng chung cho reset và change (F.3): tối thiểu 8 ký tự, không chứa phần local
/// của email (dễ đoán), và không trùng mật khẩu cũ. Tách ra helper để unit test được (K.3).
/// </summary>
public static class PasswordPolicy
{
    public const int MinLength = 8;

    /// <summary>Ném <see cref="ApiException"/> nếu mật khẩu mới vi phạm policy. currentHash null = không có mật khẩu cũ để so.</summary>
    public static void KiemTraHoacNem(string? matKhauMoi, string? email, string? currentHash)
    {
        if (string.IsNullOrWhiteSpace(matKhauMoi) || matKhauMoi.Length < MinLength)
            throw ApiException.InvalidRequest("Mật khẩu mới phải có tối thiểu 8 ký tự.");

        var localPart = (email ?? string.Empty).Split('@').FirstOrDefault();
        if (!string.IsNullOrEmpty(localPart) && localPart.Length >= 3
            && matKhauMoi.Contains(localPart, StringComparison.OrdinalIgnoreCase))
            throw ApiException.InvalidRequest("Mật khẩu không được chứa tên đăng nhập/email dễ đoán.");

        if (!string.IsNullOrEmpty(currentHash) && BCrypt.Net.BCrypt.Verify(matKhauMoi, currentHash))
            throw ApiException.InvalidRequest("Mật khẩu mới không được trùng mật khẩu hiện tại.");
    }
}
