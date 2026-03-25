using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using educodeai_server.Services.Interface;
using educodeai_server.Models;
using educodeai_server.Data;

namespace educodeai_server.Workers
{
    public class RedisSyncWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public RedisSyncWorker(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);

                using (var scope = _scopeFactory.CreateScope())
                {
                    var redisService = scope.ServiceProvider.GetRequiredService<IRedisService>();
                    var dbContext = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();

                    // 1. GOM LOG TỪ REDIS ĐẨY XUỐNG BẢNG NhatKySuDung
                    await DongBoNhatKyAsync(redisService, dbContext);

                    // 2. CHỐT SỐ TOKEN TỪ REDIS HASH VỀ BẢNG KeyAPI
                    await DongBoHanMucKeyAsync(redisService, dbContext);
                }
            }
        }

        private async Task DongBoNhatKyAsync(IRedisService redisService, EduCodeAIDbContext dbContext)
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
                    
                }
            }

            if (danhSachNhatKy.Any())
            {
                await dbContext.Set<NhatKySuDungModel>().AddRangeAsync(danhSachNhatKy);
                await dbContext.SaveChangesAsync();
            }
        }

        private async Task DongBoHanMucKeyAsync(IRedisService redisService, EduCodeAIDbContext dbContext)
        {
            // Lấy các Key đang được phép chạy
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
                    coSuThayDoi = true;
                }
            }

            if (coSuThayDoi)
            {
                await dbContext.SaveChangesAsync();
            }
        }
    }
}