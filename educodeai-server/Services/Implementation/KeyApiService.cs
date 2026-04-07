using educodeai_server.DTOs.AI;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;

namespace educodeai_server.Services.Implementation
{
    public class KeyApiService : IKeyApiService
    {
        private readonly IKeyApiRepository _keyApiRepo;
        private readonly IRedisService _redisService;

        public KeyApiService(IKeyApiRepository keyApiRepo, IRedisService redisService)
        {
            _keyApiRepo = keyApiRepo;
            _redisService = redisService;
        }

        public async Task<IEnumerable<KeyAPISummaryDto?>> GetAllKeysAsync()
        {
            var keys = (await _keyApiRepo.GetSummaryListAsync()).ToList();

            foreach (var key in keys)
            {
                if (key != null && key.TrangThai)
                {
                    string redisKey = $"EduCodeAI:KeyPool:{key.ID}";
                    var reqStr = await _redisService.LayHashAsync(redisKey, "RequestDaDung");
                    var tokStr = await _redisService.LayHashAsync(redisKey, "TokenDaDung");

                    if (int.TryParse(reqStr, out int req))
                    {
                        key.DaSuDungRequest = req;
                    }
                    if (int.TryParse(tokStr, out int tok))
                    {
                        key.DaSuDungToken = tok;
                    }

                    // Tính lại phần trăm sử dụng theo số từ Redis
                    key.PhanTramSuDung = key.HanMucRequest > 0 
                                         ? Math.Round((double)key.DaSuDungRequest / key.HanMucRequest * 100, 2) 
                                         : 0;
                }
            }

            return keys;
        }

        public async Task<KeyAPISummaryDto?> GetKeyByIdAsync(int id)
        {
            if (id <= 0) return null;
            var key = await _keyApiRepo.GetByIdAsync(id);

            if (key != null && key.TrangThai)
            {
                string redisKey = $"EduCodeAI:KeyPool:{key.ID}";
                var reqStr = await _redisService.LayHashAsync(redisKey, "RequestDaDung");
                var tokStr = await _redisService.LayHashAsync(redisKey, "TokenDaDung");

                if (int.TryParse(reqStr, out int req)) key.DaSuDungRequest = req;
                if (int.TryParse(tokStr, out int tok)) key.DaSuDungToken = tok;

                key.PhanTramSuDung = key.HanMucRequest > 0 
                                     ? Math.Round((double)key.DaSuDungRequest / key.HanMucRequest * 100, 2) 
                                     : 0;
            }

            return key;
        }

        public async Task<bool> CreateNewKeyAsync(KeyAPIManageDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.TenKey) || string.IsNullOrWhiteSpace(dto.MaKeyRaw))
            {
                return false;
            }
            int newKeyId = await _keyApiRepo.CreateKeyAsync(dto);
            if (newKeyId > 0)
            {
                await SyncKeyToRedisAsync(newKeyId);
                return true;
            }
            return false;
        }

        public async Task<bool> UpdateKeyAsync(int id, KeyAPIManageDto dto)
        {
            if (id <= 0 || string.IsNullOrWhiteSpace(dto.TenKey)) return false;

            var isUpdated = await _keyApiRepo.UpdateKeyAsync(id, dto);
            if (isUpdated)
            {
                await SyncKeyToRedisAsync(id);
            }
            return isUpdated;
        }

        public async Task<bool> ToggleKeyStatusAsync(int id, bool status)
        {
            if (id <= 0) return false;

            var isUpdated = await _keyApiRepo.UpdateStatusAsync(id, status);

            if (isUpdated)
            {
                string redisKey = $"EduCodeAI:KeyPool:{id}";

                if (status)
                {
                    await SyncKeyToRedisAsync(id);
                }
                else
                {
                    await _redisService.XoaKeyAsync(redisKey);
                }
            }

            return isUpdated;
        }

        public async Task<bool> DeleteKeyAsync(int id)
        {
            if (id <= 0) return false;

            var isDeleted = await _keyApiRepo.DeleteKeyAsync(id);

            if (isDeleted)
            {
                await _redisService.XoaKeyAsync($"EduCodeAI:KeyPool:{id}");
            }

            return isDeleted;
        }

        public async Task<bool> SyncKeyToRedisAsync(int id)
        {
            var rawKey = await _keyApiRepo.GetRawKeyForRedisAsync(id);

            if (rawKey == null || !rawKey.TrangThai) return false;

            string redisKey = $"EduCodeAI:KeyPool:{rawKey.ID}";

            await _redisService.LuuHashAsync(redisKey, "MaKeyMaHoa", rawKey.MaKeyMaHoa);
            await _redisService.LuuHashAsync(redisKey, "HanMucRequest", rawKey.HanMucRequest.ToString());
            await _redisService.LuuHashAsync(redisKey, "HanMucToken", rawKey.HanMucToken.ToString());

            await _redisService.LuuHashAsync(redisKey, "RequestDaDung", "0");
            await _redisService.LuuHashAsync(redisKey, "TokenDaDung", "0");
            await _redisService.LuuHashAsync(redisKey, "TrangThai", rawKey.TrangThai.ToString());

            return true;
        }
    }
}
