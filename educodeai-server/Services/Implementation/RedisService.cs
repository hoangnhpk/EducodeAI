using educodeai_server.Constants;
using educodeai_server.Services.Interface;
using StackExchange.Redis;

namespace educodeai_server.Services
{
    public class RedisService : IRedisService
    {
        private readonly IDatabase _db;
        private readonly ILogger<RedisService> _logger;

        public RedisService(IConnectionMultiplexer redis, ILogger<RedisService> logger)
        {
            _db = redis.GetDatabase();
            _logger = logger;
        }

        public async Task LuuGiaTriAsync(string key, string giaTri, TimeSpan? expiry = null)
        {
            try
            {
                if (expiry.HasValue)
                    await _db.StringSetAsync(key, giaTri, expiry.Value);
                else
                    await _db.StringSetAsync(key, giaTri);
            }
            catch (RedisConnectionException ex) { _logger.LogWarning(ex, "Redis unavailable – LuuGiaTriAsync({Key}) skipped", key); }
        }

        public async Task<string?> LayGiaTriAsync(string key)
        {
            try { return await _db.StringGetAsync(key); }
            catch (RedisConnectionException ex) { _logger.LogWarning(ex, "Redis unavailable – LayGiaTriAsync({Key}) returned null", key); return null; }
        }

        public async Task XoaKeyAsync(string key)
        {
            try { await _db.KeyDeleteAsync(key); }
            catch (RedisConnectionException ex) { _logger.LogWarning(ex, "Redis unavailable – XoaKeyAsync({Key}) skipped", key); }
        }

        public async Task LuuHashAsync(string key, string thuocTinh, string giaTri)
        {
            try { await _db.HashSetAsync(key, thuocTinh, giaTri); }
            catch (RedisConnectionException ex) { _logger.LogWarning(ex, "Redis unavailable – LuuHashAsync({Key}:{Field}) skipped", key, thuocTinh); }
        }

        public async Task<string> LayHashAsync(string key, string thuocTinh)
        {
            try
            {
                var giaTri = await _db.HashGetAsync(key, thuocTinh);
                return giaTri.ToString();
            }
            catch (RedisConnectionException ex)
            {
                _logger.LogWarning(ex, "Redis unavailable – LayHashAsync({Key}:{Field}) returned \"0\"", key, thuocTinh);
                return "0";
            }
        }

        public async Task<long> TangGiaTriHashAsync(string key, string thuocTinh, long mucTang = 1)
        {
            try { return await _db.HashIncrementAsync(key, thuocTinh, mucTang); }
            catch (RedisConnectionException ex) { _logger.LogWarning(ex, "Redis unavailable – TangGiaTriHashAsync({Key}:{Field}) returned 0", key, thuocTinh); return 0; }
        }

        public async Task DayVaoCuoiListAsync(string key, string giaTri)
        {
            try { await _db.ListRightPushAsync(key, giaTri); }
            catch (RedisConnectionException ex) { _logger.LogWarning(ex, "Redis unavailable – DayVaoCuoiListAsync({Key}) skipped", key); }
        }

        public async Task<IEnumerable<string>> DocDauListKhongXoaAsync(string key, int soLuong)
        {
            try
            {
                var values = await _db.ListRangeAsync(key, 0, soLuong - 1);
                return values.Select(v => v.ToString()).ToList();
            }
            catch (RedisConnectionException ex)
            {
                _logger.LogWarning(ex, "Redis unavailable – DocDauListKhongXoaAsync({Key}) returned empty", key);
                return Enumerable.Empty<string>();
            }
        }

        public async Task CatDauListAsync(string key, int soLuong)
        {
            try { await _db.ListTrimAsync(key, soLuong, -1); }
            catch (RedisConnectionException ex) { _logger.LogWarning(ex, "Redis unavailable – CatDauListAsync({Key}) skipped", key); }
        }

        public IEnumerable<string> LayDanhSachKeyTheoPattern(string pattern)
        {
            try
            {
                var server = _db.Multiplexer.GetServer(_db.Multiplexer.GetEndPoints().First());
                var keys = server.Keys(database: _db.Database, pattern: pattern);
                return keys.Select(k => (string)k!).ToList();
            }
            catch (RedisConnectionException ex)
            {
                _logger.LogWarning(ex, "Redis unavailable – LayDanhSachKeyTheoPattern({Pattern}) returned empty", pattern);
                return Enumerable.Empty<string>();
            }
        }

        // --- Course Cache Versioning ---
        public async Task<long> LayVersionKhoaHocAsync(int maKhoaHoc)
        {
            try
            {
                var key = CacheKeys.CourseVersion(maKhoaHoc);
                var val = await _db.StringGetAsync(key);
                if (val.HasValue && long.TryParse(val, out var v))
                {
                    return v;
                }
                
                await _db.StringSetAsync(key, 1, TimeSpan.FromDays(30));
                return 1;
            }
            catch (RedisConnectionException ex)
            {
                _logger.LogWarning(ex, "Redis unavailable – LayVersionKhoaHocAsync({MaKhoaHoc}) returned 1", maKhoaHoc);
                return 1;
            }
        }

        public async Task TangVersionKhoaHocAsync(int maKhoaHoc)
        {
            try
            {
                var key = CacheKeys.CourseVersion(maKhoaHoc);
                await _db.StringIncrementAsync(key);
                // Version key sống 30 ngày (Dài hơn detail)
                await _db.KeyExpireAsync(key, TimeSpan.FromDays(30));
            }
            catch (RedisConnectionException ex)
            {
                _logger.LogWarning(ex, "Redis unavailable – TangVersionKhoaHocAsync({MaKhoaHoc}) skipped", maKhoaHoc);
            }
        }

        public async Task<dynamic> ThucThiLuaScriptAsync(string script, string[] keys, string[] args)
        {
            try
            {
                var redisKeys = keys.Select(k => (RedisKey)k).ToArray();
                var redisArgs = args.Select(a => (RedisValue)a).ToArray();
                return await _db.ScriptEvaluateAsync(script, redisKeys, redisArgs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thực thi Lua Script trên Redis.");
                throw;
            }
        }
    }
}
