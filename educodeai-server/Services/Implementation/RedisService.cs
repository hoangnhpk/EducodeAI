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

        public async Task LuuGiaTriAsync(string key, string giaTri)
        {
            try { await _db.StringSetAsync(key, giaTri); }
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

        public async Task<IEnumerable<string>> LayTuDauListAsync(string key, int soLuong)
        {
            try
            {
                var danhSach = new List<string>();
                for (int i = 0; i < soLuong; i++)
                {
                    var giaTri = await _db.ListLeftPopAsync(key);
                    if (!giaTri.HasValue) break;
                    danhSach.Add(giaTri.ToString());
                }
                return danhSach;
            }
            catch (RedisConnectionException ex)
            {
                _logger.LogWarning(ex, "Redis unavailable – LayTuDauListAsync({Key}) returned empty", key);
                return Enumerable.Empty<string>();
            }
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
    }
}

