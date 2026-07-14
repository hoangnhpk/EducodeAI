using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using educodeai_server.Config;
using educodeai_server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace educodeai_server.Services.Implementation
{
    /// <summary>
    /// Dọn video "rác" trên Cloudinary: file đã upload thành công nhưng KHÔNG có BaiHoc
    /// nào trỏ tới (VideoPublicId). Xảy ra khi Frontend upload xong nhưng rớt mạng trước
    /// khi gọi save-video, để lại file mồ côi trên Cloud và vẫn tính dung lượng/chi phí.
    ///
    /// Vì BaiHoc không lưu CreatedAt nên không thể dò từ DB — phải liệt kê tài nguyên trên
    /// Cloudinary (folder "courses/") rồi đối chiếu ngược với DB. Chỉ xét file đủ CŨ
    /// (quá ngưỡng an toàn) để không xóa nhầm video vừa upload còn đang chờ lưu DB.
    /// </summary>
    public class OrphanVideoCleanupService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<OrphanVideoCleanupService> _logger;
        private readonly CauHinhCloudinary _config;

        // Chỉ xóa file cũ hơn 24h → tránh xóa nhầm video đang trong lúc upload/chờ save DB.
        private static readonly TimeSpan OrphanAgeThreshold = TimeSpan.FromHours(24);
        // Quét mỗi 12h (dọn rác không gấp).
        private static readonly TimeSpan ScanInterval = TimeSpan.FromHours(12);
        // Chỉ quét video trong folder khóa học (không đụng "subtitles/").
        private const string VideoFolderPrefix = "courses/";

        public OrphanVideoCleanupService(IServiceScopeFactory scopeFactory, ILogger<OrphanVideoCleanupService> logger, IOptions<CauHinhCloudinary> config)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _config = config.Value;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_config.OrphanCleanupEnabled)
            {
                _logger.LogInformation("OrphanVideoCleanupService bị tắt (OrphanCleanupEnabled=false)");
                return;
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await DonVideoRacAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "OrphanVideoCleanupService gặp lỗi khi quét video rác");
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

        private async Task DonVideoRacAsync(CancellationToken ct)
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();
            var cloudinary = scope.ServiceProvider.GetRequiredService<Cloudinary>();

            var cutoff = DateTime.UtcNow - OrphanAgeThreshold;

            // Liệt kê toàn bộ video trong folder "courses/" (phân trang qua NextCursor).
            var publicIdsTrenCloud = new List<(string PublicId, DateTime CreatedAt)>();
            string? nextCursor = null;
            do
            {
                ct.ThrowIfCancellationRequested();
                var listParams = new ListResourcesByPrefixParams
                {
                    Type = "upload",
                    ResourceType = ResourceType.Video,
                    Prefix = VideoFolderPrefix,
                    MaxResults = 500,
                    NextCursor = nextCursor
                };
                var result = await cloudinary.ListResourcesAsync(listParams);
                if (result?.Resources != null)
                {
                    foreach (var r in result.Resources)
                    {
                        if (string.IsNullOrEmpty(r.PublicId)) continue;
                        // Cloudinary trả CreatedAt dạng chuỗi ISO. Nếu parse fail → coi như file MỚI
                        // (dùng DateTime.UtcNow) để KHÔNG bị xóa nhầm (an toàn theo hướng giữ lại).
                        var createdAt = DateTime.TryParse(r.CreatedAt, null,
                            System.Globalization.DateTimeStyles.AdjustToUniversal | System.Globalization.DateTimeStyles.AssumeUniversal,
                            out var parsed) ? parsed : DateTime.UtcNow;
                        publicIdsTrenCloud.Add((r.PublicId, createdAt));
                    }
                }
                nextCursor = result?.NextCursor;
            } while (!string.IsNullOrEmpty(nextCursor));

            // Chỉ xét file đủ cũ (tránh xóa nhầm video vừa upload còn đang chờ save DB).
            var ungVienRac = publicIdsTrenCloud.Where(x => x.CreatedAt < cutoff).ToList();
            if (ungVienRac.Count == 0) return;

            // Đối chiếu với DB: public_id nào KHÔNG có BaiHoc trỏ tới → là rác.
            var idsUngVien = ungVienRac.Select(x => x.PublicId).ToList();
            var idsCoTrongDb = await context.BaiHocs
                .Where(b => b.VideoPublicId != null && idsUngVien.Contains(b.VideoPublicId))
                .Select(b => b.VideoPublicId!)
                .ToListAsync(ct);
            var idsCoTrongDbSet = idsCoTrongDb.ToHashSet();

            var idsRac = ungVienRac.Where(x => !idsCoTrongDbSet.Contains(x.PublicId)).ToList();
            if (idsRac.Count == 0) return;

            if (_config.OrphanCleanupDryRun)
            {
                _logger.LogWarning(
                    "[DRY-RUN] Phát hiện {Count} video rác (chưa xóa). Public IDs: {Ids}",
                    idsRac.Count, string.Join(", ", idsRac.Select(x => x.PublicId)));
                return;
            }

            int daXoa = 0;
            foreach (var (publicId, _) in idsRac)
            {
                ct.ThrowIfCancellationRequested();
                try
                {
                    var delParams = new DeletionParams(publicId) { ResourceType = ResourceType.Video };
                    var res = await cloudinary.DestroyAsync(delParams);
                    if (res.Result == "ok") daXoa++;
                    else _logger.LogWarning("Không xóa được video rác {PublicId}: {Result}", publicId, res.Result);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi khi xóa video rác {PublicId}", publicId);
                }
            }

            _logger.LogWarning("Đã dọn {DaXoa}/{Tong} video rác trên Cloudinary", daXoa, idsRac.Count);
        }
    }
}
