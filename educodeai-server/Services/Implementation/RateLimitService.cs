using System;
using System.Threading.Tasks;
using educodeai_server.Constants;
using educodeai_server.Services.Interface;
using Microsoft.Extensions.Logging;

namespace educodeai_server.Services.Implementation
{
    public class RateLimitService : IRateLimitService
    {
        private readonly IRedisService _redisService;
        private readonly ILogger<RateLimitService> _logger;

        private const string LUA_RESERVE_SCRIPT = @"
            local rpmKey = KEYS[1]
            local tpmKey = KEYS[2]
            local rpdKey = KEYS[3]
            local dailyTpmKey = KEYS[4]

            local rpmLimit = tonumber(ARGV[1])
            local tpmLimit = tonumber(ARGV[2])
            local rpdLimit = tonumber(ARGV[3])
            local estimatedTokens = tonumber(ARGV[4])
            local rpdTtl = tonumber(ARGV[5]) -- in seconds

            local currentRpm = tonumber(redis.call('GET', rpmKey) or '0')
            local currentTpm = tonumber(redis.call('GET', tpmKey) or '0')
            local currentRpd = tonumber(redis.call('GET', rpdKey) or '0')

            if currentRpm + 1 > rpmLimit then return 1 end
            if currentTpm + estimatedTokens > tpmLimit then return 2 end
            if currentRpd + 1 > rpdLimit then return 3 end

            -- All limits OK, increment
            local newRpm = redis.call('INCR', rpmKey)
            if newRpm == 1 then redis.call('EXPIRE', rpmKey, 60) end

            local newTpm = redis.call('INCRBY', tpmKey, estimatedTokens)
            if newTpm == estimatedTokens then redis.call('EXPIRE', tpmKey, 60) end

            local newRpd = redis.call('INCR', rpdKey)
            if newRpd == 1 then redis.call('EXPIRE', rpdKey, rpdTtl) end

            local newDailyTpm = redis.call('INCRBY', dailyTpmKey, estimatedTokens)
            if newDailyTpm == estimatedTokens then redis.call('EXPIRE', dailyTpmKey, rpdTtl) end

            return 0
        ";

        private const string LUA_COMMIT_SCRIPT = @"
            local tpmKey = KEYS[1]
            local dailyTpmKey = KEYS[2]
            local diffTokens = tonumber(ARGV[1])
            
            if diffTokens ~= 0 then
                local newTpm = redis.call('INCRBY', tpmKey, diffTokens)
                if newTpm < 0 then redis.call('SET', tpmKey, '0') end
                
                local newDailyTpm = redis.call('INCRBY', dailyTpmKey, diffTokens)
                if newDailyTpm < 0 then redis.call('SET', dailyTpmKey, '0') end
            end
            return 0
        ";

        public RateLimitService(IRedisService redisService, ILogger<RateLimitService> logger)
        {
            _redisService = redisService;
            _logger = logger;
        }

        public async Task<QuotaReservation?> ReserveQuotaAsync(int keyId, int rpmLimit, int tpmLimit, int rpdLimit, int estimatedTokens)
        {
            try
            {
                var now = DateTime.UtcNow;
                string phutSuffix = now.ToString("yyyyMMddHHmm");
                string ngaySuffix = now.ToString("yyyyMMdd");
                string rpmKey = CacheKeys.UsageRpm(keyId, phutSuffix);
                string tpmKey = CacheKeys.UsageTpm(keyId, phutSuffix);
                string rpdKey = CacheKeys.UsageRpd(keyId, ngaySuffix);
                string dailyTpmKey = CacheKeys.UsageDailyToken(keyId, ngaySuffix);

                string[] keys = { rpmKey, tpmKey, rpdKey, dailyTpmKey };

                // RPD TTL: 48 hours = 172800 seconds
                string[] args = { rpmLimit.ToString(), tpmLimit.ToString(), rpdLimit.ToString(), estimatedTokens.ToString(), "172800" };

                var result = await _redisService.ThucThiLuaScriptAsync(LUA_RESERVE_SCRIPT, keys, args);

                int code = (int)result;
                if (code == 0)
                    return new QuotaReservation(keyId, phutSuffix, ngaySuffix, estimatedTokens);

                if (code == 1) _logger.LogWarning($"[RateLimit] Key {keyId} vượt quá RPM Limit ({rpmLimit}).");
                if (code == 2) _logger.LogWarning($"[RateLimit] Key {keyId} vượt quá TPM Limit ({tpmLimit}).");
                if (code == 3) _logger.LogWarning($"[RateLimit] Key {keyId} vượt quá RPD Limit ({rpdLimit}).");

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[RateLimit Error] ReserveQuotaAsync failed for Key {keyId}");
                return null; // Fallback: block request if Redis fails (or we could choose to allow it)
            }
        }

        public async Task CommitQuotaAsync(QuotaReservation reservation, int actualTokens)
        {
            try
            {
                int diff = actualTokens - reservation.EstimatedTokens;
                if (diff == 0) return;

                // Dùng lại đúng bucket lúc reserve, không tính lại theo UtcNow.
                string tpmKey = CacheKeys.UsageTpm(reservation.KeyId, reservation.PhutSuffix);
                string dailyTpmKey = CacheKeys.UsageDailyToken(reservation.KeyId, reservation.NgaySuffix);

                string[] keys = { tpmKey, dailyTpmKey };
                string[] args = { diff.ToString() };

                await _redisService.ThucThiLuaScriptAsync(LUA_COMMIT_SCRIPT, keys, args);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[RateLimit Error] CommitQuotaAsync failed for Key {reservation.KeyId}");
            }
        }
    }
}
