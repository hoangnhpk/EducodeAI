using educodeai_server.Services.Interface;
using Microsoft.Extensions.Caching.Memory;

namespace educodeai_server.Services
{
    public class FallbackRedisService : IRedisService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<FallbackRedisService> _logger;

        public FallbackRedisService(IMemoryCache memoryCache, ILogger<FallbackRedisService> logger)
        {
            _memoryCache = memoryCache;
            _logger = logger;
        }

        public async Task LuuGiaTriAsync(string key, string giaTri, TimeSpan? expiry = null)
        {
            try
            {
                _memoryCache.Set(key, giaTri, expiry ?? TimeSpan.FromHours(1));
                _logger.LogWarning("Redis không available, using MemoryCache for key: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving to MemoryCache for key: {Key}", key);
                throw;
            }
        }

        public async Task<string?> LayGiaTriAsync(string key)
        {
            try
            {
                _memoryCache.TryGetValue(key, out string? value);
                _logger.LogWarning("Redis không available, using MemoryCache for key: {Key}", key);
                return value;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading from MemoryCache for key: {Key}", key);
                return null;
            }
        }

        public async Task XoaKeyAsync(string key)
        {
            try
            {
                _memoryCache.Remove(key);
                _logger.LogWarning("Redis không available, removing from MemoryCache key: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing from MemoryCache for key: {Key}", key);
            }
        }

        public async Task LuuHashAsync(string key, string thuocTinh, string giaTri)
        {
            try
            {
                var hashKey = $"{key}:{thuocTinh}";
                _memoryCache.Set(hashKey, giaTri, TimeSpan.FromHours(1));
                _logger.LogWarning("Redis không available, using MemoryCache for hash key: {Key}:{ThuocTinh}", key, thuocTinh);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving hash to MemoryCache for key: {Key}:{ThuocTinh}", key, thuocTinh);
                throw;
            }
        }

        public async Task<string> LayHashAsync(string key, string thuocTinh)
        {
            try
            {
                var hashKey = $"{key}:{thuocTinh}";
                _memoryCache.TryGetValue(hashKey, out string? value);
                _logger.LogWarning("Redis không available, using MemoryCache for hash key: {Key}:{ThuocTinh}", key, thuocTinh);
                return value ?? "0"; // Default value for counters
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading hash from MemoryCache for key: {Key}:{ThuocTinh}", key, thuocTinh);
                return "0";
            }
        }

        public async Task<long> TangGiaTriHashAsync(string key, string thuocTinh, long mucTang = 1)
        {
            try
            {
                var hashKey = $"{key}:{thuocTinh}";
                _memoryCache.TryGetValue(hashKey, out string? currentValue);
                
                if (long.TryParse(currentValue, out long current))
                {
                    current += mucTang;
                }
                else
                {
                    current = mucTang;
                }

                _memoryCache.Set(hashKey, current.ToString(), TimeSpan.FromHours(1));
                _logger.LogWarning("Redis không available, using MemoryCache for increment hash key: {Key}:{ThuocTinh}", key, thuocTinh);
                return current;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error incrementing hash in MemoryCache for key: {Key}:{ThuocTinh}", key, thuocTinh);
                return 0;
            }
        }

        public async Task DayVaoCuoiListAsync(string key, string giaTri)
        {
            try
            {
                var listKey = $"list:{key}";
                var list = new List<string>();
                
                if (_memoryCache.TryGetValue(listKey, out List<string>? existingList))
                {
                    list = existingList;
                }
                
                list.Add(giaTri);
                
                // Gi limit list size to prevent memory issues
                if (list.Count > 1000)
                {
                    list = list.Skip(list.Count - 1000).ToList();
                }
                
                _memoryCache.Set(listKey, list, TimeSpan.FromHours(1));
                _logger.LogWarning("Redis không available, using MemoryCache for list key: {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error pushing to list in MemoryCache for key: {Key}", key);
            }
        }

        public async Task<IEnumerable<string>> LayTuDauListAsync(string key, int soLuong)
        {
            try
            {
                var listKey = $"list:{key}";
                if (_memoryCache.TryGetValue(listKey, out List<string>? list))
                {
                    var result = list.Take(soLuong).ToList();
                    
                    // Remove taken items from cache
                    if (list.Count > soLuong)
                    {
                        list = list.Skip(soLuong).ToList();
                        _memoryCache.Set(listKey, list, TimeSpan.FromHours(1));
                    }
                    else
                    {
                        _memoryCache.Remove(listKey);
                    }
                    
                    _logger.LogWarning("Redis không available, using MemoryCache for list key: {Key}, items: {Count}", key, result.Count);
                    return result;
                }
                
                return Enumerable.Empty<string>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error popping from list in MemoryCache for key: {Key}", key);
                return Enumerable.Empty<string>();
            }
        }

        public IEnumerable<string> LayDanhSachKeyTheoPattern(string pattern)
        {
            try
            {
                _logger.LogWarning("Redis không available, cannot search keys by pattern: {Pattern}", pattern);
                return Enumerable.Empty<string>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching keys by pattern in MemoryCache: {Pattern}", pattern);
                return Enumerable.Empty<string>();
            }
        }

        // --- Course Cache Versioning (MemoryCache Fallback) ---
        public Task<long> LayVersionKhoaHocAsync(int maKhoaHoc)
        {
            var key = $"course:{maKhoaHoc}:version";
            _memoryCache.TryGetValue(key, out long version);
            return Task.FromResult(version == 0 ? 1L : version);
        }

        public Task TangVersionKhoaHocAsync(int maKhoaHoc)
        {
            var key = $"course:{maKhoaHoc}:version";
            _memoryCache.TryGetValue(key, out long current);
            _memoryCache.Set(key, current + 1, TimeSpan.FromDays(30));
            return Task.CompletedTask;
        }

        // --- Lua Script Atomic Operations (MemoryCache Fallback) ---
        public Task<dynamic> ThucThiLuaScriptAsync(string script, string[] keys, string[] args)
        {
            _logger.LogWarning("Redis không available, Lua Script execution is mocked and will always return success (0).");
            // Trả về 0 tương đương với success code trong logic ReserveQuota/CommitQuota của RateLimitService
            return Task.FromResult<dynamic>(0);
        }
    }
}
