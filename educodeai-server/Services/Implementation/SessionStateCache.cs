using educodeai_server.Services.Interface;
using Microsoft.Extensions.Caching.Distributed;

namespace educodeai_server.Services.Implementation
{
    /// <summary>
    /// Cache trạng thái user/session trên IDistributedCache (Redis nếu có, memory fallback dev).
    /// Không nuốt lỗi kết nối: nếu cache lỗi thì ném ra để middleware fail-closed (G.2).
    /// </summary>
    public sealed class SessionStateCache : ISessionStateCache
    {
        // TTL ngắn: cache chỉ để giảm tải DB hot-path, invalidation chủ động khi revoke/ban.
        private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(5);

        private readonly IDistributedCache _cache;

        public SessionStateCache(IDistributedCache cache)
        {
            _cache = cache;
        }

        private static string UserStatusKey(int userId) => $"auth:user:{userId}:status";
        private static string SessionKey(int maPhien) => $"auth:session:{maPhien}:active";

        public async Task<string?> GetUserStatusAsync(int userId) =>
            await _cache.GetStringAsync(UserStatusKey(userId));

        public Task SetUserStatusAsync(int userId, string status) =>
            _cache.SetStringAsync(UserStatusKey(userId), status,
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = Ttl });

        public Task InvalidateUserStatusAsync(int userId) =>
            _cache.RemoveAsync(UserStatusKey(userId));

        public async Task<bool?> GetSessionActiveAsync(int maPhien)
        {
            var raw = await _cache.GetStringAsync(SessionKey(maPhien));
            if (raw is null) return null;
            return raw == "1";
        }

        public Task SetSessionActiveAsync(int maPhien, bool active) =>
            _cache.SetStringAsync(SessionKey(maPhien), active ? "1" : "0",
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = Ttl });

        public Task InvalidateSessionAsync(int maPhien) =>
            _cache.RemoveAsync(SessionKey(maPhien));
    }
}
