using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using educodeai_server.Services.Interface;
using educodeai_server.Models;
using educodeai_server.Data;
using educodeai_server.Constants;

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

                        // Gom log từ Redis LogQueue xuống bảng NhatKySuDung.
                        await DongBoNhatKyAsync(redisService, dbContext);
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
                // Peek-then-trim: đọc KHÔNG xóa, ghi DB thành công rồi mới trim khỏi Redis.
                // Nếu SaveChanges lỗi, log vẫn còn nguyên trong queue để vòng sau xử lý lại.
                var danhSachLogJson = (await redisService.DocDauListKhongXoaAsync(CacheKeys.LogQueue, 100)).ToList();

                if (danhSachLogJson.Count == 0) return;

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
                        // Bỏ qua log không hợp lệ
                    }
                }

                if (danhSachNhatKy.Any())
                {
                    await dbContext.Set<NhatKySuDungModel>().AddRangeAsync(danhSachNhatKy);
                    await dbContext.SaveChangesAsync();
                }

                // Chỉ trim đúng số phần tử đã đọc để không cắt nhầm log mới push vào sau đó.
                await redisService.CatDauListAsync(CacheKeys.LogQueue, danhSachLogJson.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi đồng bộ nhật ký sử dụng (LogQueue sẽ được giữ lại để thử lại)");
            }
        }
    }
}
