namespace educodeai_server.DTOs.XacThuc
{
    /// <summary>Payload OTP xác minh thiết bị mới (LoginNewDevice) — trả lại khi verify đúng (D.1).</summary>
    public sealed record ThietBiOtpPayload(string MaThietBi, string TenThietBi);

    /// <summary>Payload OTP thay thế thiết bị (ReplaceDevice): thiết bị mới + phiên cũ nhất cần đăng xuất.</summary>
    public sealed record ThayTheThietBiOtpPayload(string NewMaThietBi, string NewTenThietBi, int OldMaPhien);

    /// <summary>
    /// Payload OTP đăng ký học viên (D.7): chỉ giữ hash mật khẩu (BCrypt), không lưu plain trong cache.
    /// Email đã normalize trước khi tạo OTP.
    /// </summary>
    public sealed record DangKyOtpPayload(string HoTen, string Email, string MatKhauHash);
}
