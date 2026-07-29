namespace educodeai_server.Services.Interface
{
    /// <summary>
    /// Rate-limit phát/verify OTP theo purpose + identifier + IP (D.3).
    /// Chạy trên IDistributedCache (Redis nếu có, memory fallback dev) — fixed-window counter.
    /// Fail-open khi cache lỗi: rate-limit chỉ chống lạm dụng, không chặn user hợp lệ lúc hạ tầng trục trặc
    /// (khác OTP verify vốn fail-closed). Không log giá trị OTP.
    /// </summary>
    public interface IOtpRateLimiter
    {
        /// <summary>
        /// Kiểm tra + tăng số lần phát OTP cho (purpose, identifier) và cho IP.
        /// Trả về false nếu vượt ngưỡng (caller nên từ chối và không gửi email).
        /// </summary>
        Task<bool> TryConsumeSendAsync(OtpPurpose purpose, string identifier, string? ipAddress);

        /// <summary>
        /// Kiểm tra + tăng số lần verify OTP theo (purpose, identifier) và IP để chặn brute-force endpoint verify.
        /// Trả về false nếu vượt ngưỡng.
        /// </summary>
        Task<bool> TryConsumeVerifyAsync(OtpPurpose purpose, string identifier, string? ipAddress);
    }
}
