using educodeai_server.Services.Interface;
using Microsoft.Extensions.Caching.Distributed;

namespace educodeai_server.Services.Implementation
{
    /// <summary>
    /// Rate-limit phát/verify OTP bằng fixed-window counter trên IDistributedCache (D.3).
    /// IDistributedCache không có atomic INCR nên dùng get-then-set: rate-limit chỉ cần chặn lạm dụng,
    /// sai số nhỏ khi race chấp nhận được. Fail-open khi cache lỗi (không chặn user hợp lệ).
    /// </summary>
    public sealed class OtpRateLimiter : IOtpRateLimiter
    {
        // Phát OTP: tối đa 5 lần/identifier/15 phút; 20 lần/IP/15 phút (một IP có thể phục vụ nhiều user hợp lệ).
        private const int SendPerIdentifier = 5;
        private const int SendPerIp = 20;
        private static readonly TimeSpan SendWindow = TimeSpan.FromMinutes(15);

        // Verify OTP: tối đa 10 lần/identifier/15 phút; 50 lần/IP/15 phút (chặn brute-force endpoint verify).
        private const int VerifyPerIdentifier = 10;
        private const int VerifyPerIp = 50;
        private static readonly TimeSpan VerifyWindow = TimeSpan.FromMinutes(15);

        private readonly IDistributedCache _cache;
        private readonly ILogger<OtpRateLimiter> _logger;

        public OtpRateLimiter(IDistributedCache cache, ILogger<OtpRateLimiter> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        public Task<bool> TryConsumeSendAsync(OtpPurpose purpose, string identifier, string? ipAddress) =>
            TryConsumeAsync("send", purpose, identifier, ipAddress, SendPerIdentifier, SendPerIp, SendWindow);

        public Task<bool> TryConsumeVerifyAsync(OtpPurpose purpose, string identifier, string? ipAddress) =>
            TryConsumeAsync("verify", purpose, identifier, ipAddress, VerifyPerIdentifier, VerifyPerIp, VerifyWindow);

        private async Task<bool> TryConsumeAsync(
            string action, OtpPurpose purpose, string identifier, string? ipAddress,
            int perIdentifierLimit, int perIpLimit, TimeSpan window)
        {
            try
            {
                var idKey = $"otp-rl:{action}:{purpose}:id:{Normalize(identifier)}";
                if (!await ConsumeAsync(idKey, perIdentifierLimit, window))
                {
                    return false;
                }

                if (!string.IsNullOrEmpty(ipAddress))
                {
                    var ipKey = $"otp-rl:{action}:{purpose}:ip:{Normalize(ipAddress)}";
                    if (!await ConsumeAsync(ipKey, perIpLimit, window))
                    {
                        return false;
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                // Fail-open: không chặn user hợp lệ khi cache trục trặc.
                _logger.LogWarning(ex, "OTP rate-limit cache lỗi cho {Action}/{Purpose}; tạm cho qua.", action, purpose);
                return true;
            }
        }

        private async Task<bool> ConsumeAsync(string key, int limit, TimeSpan window)
        {
            var raw = await _cache.GetStringAsync(key);
            int count = int.TryParse(raw, out var c) ? c : 0;

            if (count >= limit)
            {
                return false;
            }

            await _cache.SetStringAsync(
                key,
                (count + 1).ToString(),
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = window });
            return true;
        }

        private static string Normalize(string value) =>
            value.Trim().ToLowerInvariant().Replace(':', '_').Replace('.', '_');
    }
}
