using educodeai_server.Data;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    /// <summary>
    /// Dọn các AIBalanceHold bị treo ở trạng thái "holding" quá lâu.
    /// Xảy ra khi worker fire-and-forget chết giữa chừng (app restart, crash) →
    /// hold không bao giờ được commit/release, tiền đã trừ không được hoàn,
    /// và BaiHoc kẹt ở "Processing_Subtitle" vĩnh viễn.
    /// Service này release hold treo, hoàn tiền, và đưa bài học về trạng thái Failed.
    /// </summary>
    public class StaleHoldCleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<StaleHoldCleanupService> _logger;

        // Hold "holding" quá 30 phút được coi là treo (job STT thực tế chỉ vài phút).
        private static readonly TimeSpan StaleThreshold = TimeSpan.FromMinutes(30);
        // Quét mỗi 10 phút.
        private static readonly TimeSpan ScanInterval = TimeSpan.FromMinutes(10);

        public StaleHoldCleanupService(IServiceScopeFactory scopeFactory, ILogger<StaleHoldCleanupService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await DonHoldTreoAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "StaleHoldCleanupService gặp lỗi khi quét hold treo");
                }

                try
                {
                    await Task.Delay(ScanInterval, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }
            }
        }

        private async Task DonHoldTreoAsync(CancellationToken ct)
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();

            var cutoff = DateTime.UtcNow - StaleThreshold;
            var staleHolds = await context.AIBalanceHolds
                .Where(h => h.Status == "holding" && h.CreatedAt < cutoff)
                .ToListAsync(ct);

            if (staleHolds.Count == 0) return;

            foreach (var hold in staleHolds)
            {
                hold.Status = "released";
                hold.SettledAt = DateTime.UtcNow;

                // Hoàn lại số dư đã trừ lúc tạo hold.
                var quota = await context.GiangVienQuotas
                    .FirstOrDefaultAsync(q => q.MaGiangVien == hold.MaGiangVien, ct);
                if (quota != null)
                {
                    quota.AiBalanceUsd += hold.AmountUsd;
                    quota.UpdatedAt = DateTime.UtcNow;
                }

                // Đưa bài học ra khỏi trạng thái "Processing_Subtitle" nếu còn kẹt.
                var baiHoc = await context.BaiHocs.FindAsync(new object?[] { hold.MaBaiHoc }, ct);
                if (baiHoc != null && baiHoc.VideoStatus == "Processing_Subtitle")
                    baiHoc.VideoStatus = "Failed_Subtitle";
            }

            await context.SaveChangesAsync(ct);
            _logger.LogWarning("Đã dọn {Count} hold AI treo (release + hoàn tiền)", staleHolds.Count);
        }
    }
}
