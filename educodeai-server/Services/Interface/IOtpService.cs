namespace educodeai_server.Services.Interface
{
    /// <summary>
    /// Mục đích OTP — mỗi purpose tách key riêng để phát/verify độc lập, không đè nhau (D.1).
    /// </summary>
    public enum OtpPurpose
    {
        Register,
        ForgotPassword,
        LoginNewDevice,
        ReplaceDevice,
        RemoteLogout,
        InstructorEmail,
        BoSungHoSo
    }

    /// <summary>
    /// OTP service dùng chung cho mọi flow xác thực (D.1/D.2).
    /// Sinh CSPRNG 6 số, chỉ lưu hash trên <see cref="Microsoft.Extensions.Caching.Distributed.IDistributedCache"/>
    /// (Redis nếu có, memory fallback dev), TTL 5 phút, single-use, tối đa 5 lần nhập sai.
    /// Payload đi kèm (thông tin thiết bị/đăng ký) lưu cùng entry, trả lại khi verify đúng.
    /// Không log giá trị OTP hay payload (D.9).
    /// </summary>
    public interface IOtpService
    {
        /// <summary>
        /// Phát OTP mới cho (purpose, identifier). Ghi đè OTP cũ cùng key (invalidate OTP cũ khi phát mới).
        /// Trả về mã OTP plain để gửi qua email — KHÔNG lưu plain, chỉ lưu hash.
        /// </summary>
        /// <param name="identifier">Email đã normalize hoặc userId; dùng làm phần định danh của key.</param>
        /// <param name="payloadJson">Dữ liệu đi kèm (JSON) sẽ trả lại khi verify đúng; null nếu không cần.</param>
        Task<string> CreateOtpAsync(OtpPurpose purpose, string identifier, string? payloadJson = null);

        /// <summary>
        /// Xác minh OTP. Sai → tăng bộ đếm, vượt 5 lần → vô hiệu OTP. Đúng → single-use (xóa) và trả payload.
        /// So sánh hash bằng constant-time.
        /// </summary>
        Task<OtpVerifyResult> VerifyOtpAsync(OtpPurpose purpose, string identifier, string otpCode);
    }

    /// <summary>Kết quả verify OTP. <see cref="PayloadJson"/> chỉ có giá trị khi <see cref="Success"/> = true.</summary>
    public sealed record OtpVerifyResult(bool Success, string? PayloadJson, string? ErrorMessage)
    {
        public static OtpVerifyResult Ok(string? payloadJson) => new(true, payloadJson, null);
        public static OtpVerifyResult Fail(string message) => new(false, null, message);
    }
}
