using educodeai_server.Services.Interface;
using StackExchange.Redis;

namespace educodeai_server.Services
{
    public class RedisService : IRedisService
    {
        private readonly StackExchange.Redis.IDatabase _db;

        public RedisService(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase();
        }

        public async Task LuuGiaTriAsync(string key, string giaTri) => await _db.StringSetAsync(key, giaTri);
        public async Task<string?> LayGiaTriAsync(string key) => await _db.StringGetAsync(key);
        public async Task XoaKeyAsync(string key) => await _db.KeyDeleteAsync(key);

        public async Task LuuHashAsync(string key, string thuocTinh, string giaTri)
        {
            await _db.HashSetAsync(key, thuocTinh, giaTri);
        }

        public async Task<string> LayHashAsync(string key, string thuocTinh)
        {
            var giaTri = await _db.HashGetAsync(key, thuocTinh);
            return giaTri.ToString();
        }

        public async Task<long> TangGiaTriHashAsync(string key, string thuocTinh, long mucTang = 1)
        {
            return await _db.HashIncrementAsync(key, thuocTinh, mucTang);
        }

        public async Task DayVaoCuoiListAsync(string key, string giaTri)
        {
            await _db.ListRightPushAsync(key, giaTri);
        }

        public async Task<IEnumerable<string>> LayTuDauListAsync(string key, int soLuong)
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

        public IEnumerable<string> LayDanhSachKeyTheoPattern(string pattern)
        {
            var server = _db.Multiplexer.GetServer(_db.Multiplexer.GetEndPoints().First());
            var keys = server.Keys(database: _db.Database, pattern: pattern);
            return keys.Select(k => (string)k!).ToList();
        }
    }
}
