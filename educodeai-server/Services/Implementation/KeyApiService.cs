using educodeai_server.Constants;
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
                    string homNaySuffix = DateTime.UtcNow.ToString("yyyyMMdd");
                    var reqStr = await _redisService.LayGiaTriAsync(CacheKeys.UsageRpd(key.ID, homNaySuffix));
                    var tokStr = await _redisService.LayGiaTriAsync(CacheKeys.UsageDailyToken(key.ID, homNaySuffix));

                    if (int.TryParse(reqStr, out int req))
                    {
                        key.DaSuDungRequestHomNay = req;
                    }
                    if (int.TryParse(tokStr, out int tok))
                    {
                        key.DaSuDungTokenHomNay = tok;
                    }

                    // Tính lại phần trăm sử dụng theo số từ Redis (áp dụng cho RPD)
                    key.PhanTramRPD = key.RPDLimit > 0 
                                         ? Math.Round((double)key.DaSuDungRequestHomNay / key.RPDLimit * 100, 2) 
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
                string homNaySuffix = DateTime.UtcNow.ToString("yyyyMMdd");
                var reqStr = await _redisService.LayGiaTriAsync(CacheKeys.UsageRpd(key.ID, homNaySuffix));
                var tokStr = await _redisService.LayGiaTriAsync(CacheKeys.UsageDailyToken(key.ID, homNaySuffix));

                if (int.TryParse(reqStr, out int req)) key.DaSuDungRequestHomNay = req;
                if (int.TryParse(tokStr, out int tok)) key.DaSuDungTokenHomNay = tok;

                key.PhanTramRPD = key.RPDLimit > 0 
                                     ? Math.Round((double)key.DaSuDungRequestHomNay / key.RPDLimit * 100, 2) 
                                     : 0;
            }

            return key;
        }

        public async Task<bool> CreateNewKeyAsync(KeyAPIManageDto dto, int adminId, string? ipAddress)
        {
            if (string.IsNullOrWhiteSpace(dto.TenKey) || string.IsNullOrWhiteSpace(dto.MaKeyRaw) || 
                string.IsNullOrWhiteSpace(dto.ModelSuDung))
            {
                return false;
            }

            if (dto.RPMLimit <= 0 || dto.TPMLimit <= 0 || dto.RPDLimit <= 0)
            {
                return false;
            }

            int newKeyId = await _keyApiRepo.CreateKeyAsync(dto);
            if (newKeyId > 0)
            {
                await SyncKeyToRedisAsync(newKeyId, adminId, ipAddress);
                return true;
            }
            return false;
        }

        public async Task<bool> UpdateKeyAsync(int id, KeyAPIManageDto dto, int adminId, string? ipAddress)
        {
            if (string.IsNullOrWhiteSpace(dto.ModelSuDung)) dto.ModelSuDung = "gemma-4-31b-it";
            if (id <= 0 || string.IsNullOrWhiteSpace(dto.TenKey)) return false;

            if (dto.RPMLimit <= 0 || dto.TPMLimit <= 0 || dto.RPDLimit <= 0) return false;

            var isUpdated = await _keyApiRepo.UpdateKeyAsync(id, dto, adminId, ipAddress);
            if (isUpdated)
            {
                await SyncKeyToRedisAsync(id, adminId, ipAddress);
            }
            return isUpdated;
        }

        public async Task<bool> ToggleKeyStatusAsync(int id, bool status, int adminId, string? ipAddress)
        {
            if (id <= 0) return false;

            var isUpdated = await _keyApiRepo.UpdateStatusAsync(id, status, adminId, ipAddress);

            if (isUpdated)
            {
                string redisKey = CacheKeys.KeyPool(id);

                if (status)
                {
                    await SyncKeyToRedisAsync(id, adminId, ipAddress);
                }
                else
                {
                    await _redisService.XoaKeyAsync(redisKey);
                }
            }

            return isUpdated;
        }

        public async Task<bool> SoftDeleteKeyAsync(int id, int adminId, string? ipAddress)
        {
            if (id <= 0) return false;

            var isDeleted = await _keyApiRepo.SoftDeleteKeyAsync(id, adminId, ipAddress);

            if (isDeleted)
            {
                await _redisService.XoaKeyAsync(CacheKeys.KeyPool(id));
            }

            return isDeleted;
        }

        public async Task<bool> SyncKeyToRedisAsync(int id, int adminId, string? ipAddress)
        {
            var rawKey = await _keyApiRepo.GetRawKeyForRedisAsync(id);

            if (rawKey == null || !rawKey.TrangThai) return false;

            string redisKey = CacheKeys.KeyPool(rawKey.ID);

            // Gom kết quả từng lệnh ghi. Redis ngắt → LuuHashAsync trả false (đã nuốt
            // RedisConnectionException bên trong). Chỉ khi TẤT CẢ ghi được mới coi là sync thành công.
            bool tatCaGhiDuoc =
                await _redisService.LuuHashAsync(redisKey, "MaKeyMaHoa", rawKey.MaKeyMaHoa) &
                await _redisService.LuuHashAsync(redisKey, "RPMLimit", rawKey.RPMLimit.ToString()) &
                await _redisService.LuuHashAsync(redisKey, "TPMLimit", rawKey.TPMLimit.ToString()) &
                await _redisService.LuuHashAsync(redisKey, "RPDLimit", rawKey.RPDLimit.ToString()) &
                await _redisService.LuuHashAsync(redisKey, "ModelSuDung", rawKey.ModelSuDung) &
                await _redisService.LuuHashAsync(redisKey, "TrangThai", rawKey.TrangThai.ToString());

            if (!tatCaGhiDuoc)
            {
                // Không ghi audit SYNC_CONFIG khi sync thất bại để log phản ánh đúng thực tế.
                return false;
            }

            var auditLog = new educodeai_server.Models.ApiKeyAuditLog
            {
                Action = AuditAction.SYNC_CONFIG,
                AdminId = adminId,
                KeyApiId = id,
                MetadataJson = System.Text.Json.JsonSerializer.Serialize(new { rpmLimit = rawKey.RPMLimit, tpmLimit = rawKey.TPMLimit, rpdLimit = rawKey.RPDLimit, model = rawKey.ModelSuDung, trangThai = rawKey.TrangThai, redisKey }),
                IpAddress = ipAddress,
                CreatedAt = DateTime.UtcNow
            };
            await _keyApiRepo.AddAuditLogAsync(auditLog);

            return true;
        }

        public async Task<bool> ResetKeyUsageAsync(int id, int adminId, string? ipAddress)
        {
            if (id <= 0) return false;

            var isReset = await _keyApiRepo.ResetKeyUsageAsync(id, adminId, ipAddress);

            if (isReset)
            {
                var rawKey = await _keyApiRepo.GetRawKeyForRedisAsync(id);
                if (rawKey != null && rawKey.TrangThai)
                {
                    string homNaySuffix = DateTime.UtcNow.ToString("yyyyMMdd");
                    await _redisService.XoaKeyAsync(CacheKeys.UsageRpd(id, homNaySuffix));
                    await _redisService.XoaKeyAsync(CacheKeys.UsageDailyToken(id, homNaySuffix));
                }
            }

            return isReset;
        }

        public async Task<ApiKeyRevealDto?> RevealKeyAsync(int id, int adminId, string? ipAddress)
        {
            if (id <= 0) return null;
            return await _keyApiRepo.RevealKeyAsync(id, adminId, ipAddress);
        }
    }
}
