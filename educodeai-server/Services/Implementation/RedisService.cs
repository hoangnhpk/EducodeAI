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
            // Tự động cộng dồn và trả về giá trị sau khi cộng
            return await _db.HashIncrementAsync(key, thuocTinh, mucTang);
        }

        // --- CÁC HÀM LIST ---
        public async Task DayVaoCuoiListAsync(string key, string giaTri)
        {
            await _db.ListRightPushAsync(key, giaTri);
        }

        public async Task<IEnumerable<string>> LayTuDauListAsync(string key, int soLuong)
        {
            var danhSach = new List<string>();
            for (int i = 0; i < soLuong; i++)
            {
                // Rút ra khỏi hàng đợi
                var giaTri = await _db.ListLeftPopAsync(key);

                // Nếu Redis rỗng (không còn log nào chờ) thì dừng vòng lặp luôn
                if (!giaTri.HasValue) break;

                danhSach.Add(giaTri.ToString());
            }
            return danhSach;
        }
    }
}
