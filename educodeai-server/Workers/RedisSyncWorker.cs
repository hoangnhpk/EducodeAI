using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using educodeai_server.Services.Interface;
using educodeai_server.Models;
using educodeai_server.Data;

namespace educodeai_server.Workers
{
    public class RedisSyncWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<RedisSyncWorker> _logger;

        public RedisSyncWorker(IServiceScopeFactory scopeFactory, ILogger<RedisSyncWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);

                try
                {
                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var redisService = scope.ServiceProvider.GetRequiredService<IRedisService>();
                        var dbContext = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();

                        // 1. GOM LOG TÙM REDIS ÄÄY XUÔNG BÄNG NhatKySuDung
                        await DongBoNhatKyAsync(redisService, dbContext);

                        // 2. CHÔT SÔ TOKEN TÙM REDIS HASH VÊ BÄNG KeyAPI
                        await DongBoHanMucKeyAsync(redisService, dbContext);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Redis không available");
                }
            }
        }

        private async Task DongBoNhatKyAsync(IRedisService redisService, EduCodeAIDbContext dbContext)
        {
            try
            {
                var danhSachLogJson = await redisService.LayTuDauListAsync("EduCodeAI:LogQueue", 100);

                if (!danhSachLogJson.Any()) return;

                var danhSachNhatKy = new List<NhatKySuDungModel>();

                foreach (var logJson in danhSachLogJson)
                {
                    try
                    {
                        var nhatKy = JsonSerializer.Deserialize<NhatKySuDungModel>(logJson);
                        if (nhatKy != null)
                        {
                            nhatKy.KeyAPI = null!;
                            danhSachNhatKy.Add(nhatKy);
                        }
                    }
                    catch
                    {
                        // Bá qua log không háp lá
                    }
                }

                if (danhSachNhatKy.Any())
                {
                    await dbContext.Set<NhatKySuDungModel>().AddRangeAsync(danhSachNhatKy);
                    await dbContext.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lá khi dong bá nhát ký");
            }
        }

        private async Task DongBoHanMucKeyAsync(IRedisService redisService, EduCodeAIDbContext dbContext)
        {
            try
            {
                // Láy các Key dang áÆc phép cháy
                var activeKeys = dbContext.KeyAPIs.Where(k => k.TrangThai).ToList();
                bool coSuThayDoi = false;

                foreach (var key in activeKeys)
                {
                    string redisKey = $"EduCodeAI:KeyPool:{key.ID}";

                    var tokenDaDungStr = await redisService.LayHashAsync(redisKey, "TokenDaDung");
                    var requestDaDungStr = await redisService.LayHashAsync(redisKey, "RequestDaDung");

                    if (int.TryParse(tokenDaDungStr, out int tokenDaDungMoi) &&
                        int.TryParse(requestDaDungStr, out int requestDaDungMoi))
                    {
                        // Thóng kê lai tù NhatKySuDungModel
                        var thongKe = dbContext.NhatKySuDungs
                            .Where(nk => nk.ID_Key == key.ID)
                            .GroupBy(nk => nk.ID_Key)
                            .Select(g => new { 
                                TotalTokens = g.Sum(nk => nk.SoTokenTieuHao),
                                TotalRequests = g.Count()
                            })
                            .FirstOrDefault();

                        if (thongKe != null)
                        {
                            _logger.LogInformation("Key {KeyId} - Redis: Token={RedisToken}, Request={RedisRequest} | DB: Token={DBToken}, Request={DBRequests}", 
                                key.ID, tokenDaDungMoi, requestDaDungMoi, thongKe.TotalTokens, thongKe.TotalRequests);
                        }
                        else
                        {
                            _logger.LogInformation("Key {KeyId} - Redis: Token={RedisToken}, Request={RedisRequest} | DB: Không có data", 
                                key.ID, tokenDaDungMoi, requestDaDungMoi);
                        }
                        
                        coSuThayDoi = true;
                    }
                }

                if (coSuThayDoi)
                {
                    _logger.LogInformation("Äã kiá tra hán mác cho {Count} keys", activeKeys.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lá khi dong bá hán mác key");
            }
        }
    }
}
