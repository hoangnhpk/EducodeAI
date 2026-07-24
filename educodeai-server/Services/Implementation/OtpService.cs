using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using educodeai_server.Services.Interface;
using Microsoft.Extensions.Caching.Distributed;

namespace educodeai_server.Services.Implementation
{
    /// <summary>
    /// OTP service dùng chung (D.1/D.2). Sinh CSPRNG 6 số, chỉ lưu hash SHA-256 trên IDistributedCache
    /// (Redis nếu có, memory fallback dev), TTL 5 phút, single-use, tối đa 5 lần nhập sai rồi vô hiệu.
    /// So sánh hash constant-time. Không log OTP/payload (D.9).
    /// </summary>
    public sealed class OtpService : IOtpService
    {
        private const int OtpTtlMinutes = 5;
        private const int MaxAttempts = 5;

        private readonly IDistributedCache _cache;

        public OtpService(IDistributedCache cache)
        {
            _cache = cache;
        }

        private static string Key(OtpPurpose purpose, string identifier) =>
            $"otp:{purpose}:{identifier}";

        public async Task<string> CreateOtpAsync(OtpPurpose purpose, string identifier, string? payloadJson = null)
        {
            // CSPRNG 6 số 000000–999999 (không lệch modulo vì miền 0..10^6 chia hết cho 10^6).
            var otp = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");

            var entry = new OtpEntry
            {
                OtpHash = HashOtp(otp),
                PayloadJson = payloadJson,
                Attempts = 0,
                ExpiresAtUtc = DateTime.UtcNow.AddMinutes(OtpTtlMinutes)
            };

            // Ghi đè entry cũ cùng key → invalidate OTP cũ khi phát mới.
            await WriteEntryAsync(Key(purpose, identifier), entry);
            return otp;
        }

        public async Task<OtpVerifyResult> VerifyOtpAsync(OtpPurpose purpose, string identifier, string otpCode)
        {
            var key = Key(purpose, identifier);
            var raw = await _cache.GetStringAsync(key);
            if (string.IsNullOrEmpty(raw))
            {
                return OtpVerifyResult.Fail("Mã OTP đã hết hạn hoặc không tồn tại.");
            }

            OtpEntry? entry;
            try
            {
                entry = JsonSerializer.Deserialize<OtpEntry>(raw);
            }
            catch
            {
                entry = null;
            }
            if (entry is null || string.IsNullOrEmpty(entry.OtpHash))
            {
                await _cache.RemoveAsync(key);
                return OtpVerifyResult.Fail("Mã OTP không hợp lệ.");
            }

            var matches = CryptographicOperations.FixedTimeEquals(
                Convert.FromHexString(entry.OtpHash),
                HashOtpBytes(otpCode ?? string.Empty));

            if (!matches)
            {
                entry.Attempts++;
                if (entry.Attempts >= MaxAttempts)
                {
                    // Vượt ngưỡng → vô hiệu OTP, buộc phát lại mã mới.
                    await _cache.RemoveAsync(key);
                    return OtpVerifyResult.Fail("Bạn đã nhập sai quá số lần cho phép. Vui lòng yêu cầu mã mới.");
                }

                // Ghi lại attempt với TTL bằng phần đời CÒN LẠI của OTP, không nới hạn.
                await WriteEntryAsync(key, entry);

                int remaining = MaxAttempts - entry.Attempts;
                return OtpVerifyResult.Fail($"Mã OTP không chính xác. Còn {remaining} lần thử.");
            }

            // Đúng → single-use.
            await _cache.RemoveAsync(key);
            return OtpVerifyResult.Ok(entry.PayloadJson);
        }

        // TTL = phần đời còn lại tính từ ExpiresAtUtc; entry đã hết hạn thì bỏ qua (cache sẽ tự xóa).
        private async Task WriteEntryAsync(string key, OtpEntry entry)
        {
            var ttl = entry.ExpiresAtUtc - DateTime.UtcNow;
            if (ttl <= TimeSpan.Zero)
            {
                await _cache.RemoveAsync(key);
                return;
            }

            await _cache.SetStringAsync(
                key,
                JsonSerializer.Serialize(entry),
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = ttl });
        }

        private static string HashOtp(string otp) => Convert.ToHexString(HashOtpBytes(otp));

        private static byte[] HashOtpBytes(string otp) => SHA256.HashData(Encoding.UTF8.GetBytes(otp));

        private sealed class OtpEntry
        {
            public string OtpHash { get; set; } = string.Empty;
            public string? PayloadJson { get; set; }
            public int Attempts { get; set; }
            public DateTime ExpiresAtUtc { get; set; }
        }
    }
}
