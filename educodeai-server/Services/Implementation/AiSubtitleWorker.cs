using educodeai_server.Config;
using educodeai_server.Data;
using educodeai_server.Models;
using Google.Cloud.Speech.V1;
using Google.Cloud.Storage.V1;
using Microsoft.EntityFrameworkCore;
using FFMpegCore;
using FFMpegCore.Enums;
using System.Text;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;

namespace educodeai_server.Services.Interface
{
    public interface IAiSubtitleWorker
    {
        Task ProcessAsync(int maBaiHoc, int holdId);
    }
}

namespace educodeai_server.Services.Implementation
{
    using educodeai_server.Services.Interface;

    public class AiSubtitleWorker : IAiSubtitleWorker
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AiSubtitleWorker> _logger;
        private readonly SpeechClient _speechClient;
        private readonly StorageClient _storageClient;
        private readonly CauHinhSpeechToText _sttConfig;
        private readonly string? _audioStagingBucket;

        public AiSubtitleWorker(IServiceScopeFactory scopeFactory, ILogger<AiSubtitleWorker> logger, SpeechClient speechClient, StorageClient storageClient, IOptions<CauHinhGoogleCloud> gcpConfig)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _speechClient = speechClient;
            _storageClient = storageClient;
            _sttConfig = gcpConfig.Value.SpeechToText;
            _audioStagingBucket = gcpConfig.Value.AudioStagingBucket;
        }

        public async Task ProcessAsync(int maBaiHoc, int holdId)
        {
            string? videoPath = null, audioPath = null, vttPath = null, gcsObjectName = null;

            try
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();
                var cloudinary = scope.ServiceProvider.GetRequiredService<Cloudinary>();
                var hubContext = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.SignalR.IHubContext<Hubs.SystemConfigHub>>();

                var baiHoc = await context.BaiHocs.Include(b => b.ChuongHoc).ThenInclude(c => c.KhoaHoc).FirstOrDefaultAsync(b => b.MaBaiHoc == maBaiHoc);
                var hold = await context.AIBalanceHolds.FindAsync(holdId);
                if (baiHoc == null || hold == null) return;

                // 1. Tải video từ Cloudinary. Dùng secure_url đã lưu lúc upload (LinkVideo)
                //    thay vì tự ghép chuỗi token — token tự ghép không đúng chuẩn Cloudinary.
                var videoUrl = baiHoc.LinkVideo;
                if (string.IsNullOrEmpty(videoUrl))
                    throw new InvalidOperationException("Bài học chưa có URL video để tải về.");

                videoPath = Path.GetTempFileName();
                using (var client = new HttpClient { Timeout = TimeSpan.FromMinutes(5) })
                using (var stream = await client.GetStreamAsync(videoUrl))
                using (var fs = File.OpenWrite(videoPath))
                    await stream.CopyToAsync(fs);

                // 2. Extract audio bằng FFmpeg (FLAC 16kHz mono)
                audioPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.flac");
                await FFMpegArguments
                    .FromFileInput(videoPath)
                    .OutputToFile(audioPath, true, options => options
                        .WithCustomArgument("-vn -ac 1 -ar 16000 -c:a flac"))
                    .ProcessAsynchronously();

                // 3. Upload audio FLAC lên GCS. Speech-to-Text giới hạn inline audio ~1 phút
                //    thời lượng (không phải dung lượng) → bắt buộc dùng GCS URI cho video dài.
                if (string.IsNullOrEmpty(_audioStagingBucket))
                    throw new InvalidOperationException("Chưa cấu hình GoogleCloud:AudioStagingBucket.");

                gcsObjectName = $"audio-staging/{maBaiHoc}-{Guid.NewGuid()}.flac";
                using (var audioStream = File.OpenRead(audioPath))
                    await _storageClient.UploadObjectAsync(_audioStagingBucket, gcsObjectName, "audio/flac", audioStream);

                var gcsUri = $"gs://{_audioStagingBucket}/{gcsObjectName}";

                // 4. Speech-to-Text LongRunningRecognize với GCS URI (nâng giới hạn lên tới 480 phút).
                var recognitionConfig = new RecognitionConfig
                {
                    Encoding = RecognitionConfig.Types.AudioEncoding.Flac,
                    SampleRateHertz = 16000,
                    LanguageCode = _sttConfig.Language,
                    EnableAutomaticPunctuation = true,
                    EnableWordTimeOffsets = true,
                    Model = _sttConfig.Model
                };
                var audio = RecognitionAudio.FromStorageUri(gcsUri);
                var operation = await _speechClient.LongRunningRecognizeAsync(recognitionConfig, audio);
                var completed = await operation.PollUntilCompletedAsync();
                var response = completed.Result;

                // 5. Parse → VTT (gom từ thành câu)
                var vttContent = GenerateVtt(response.Results);
                vttPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.vtt");
                await File.WriteAllTextAsync(vttPath, vttContent);

                // 6. Upload .vtt lên Cloudinary
                using var vttStream = File.OpenRead(vttPath);
                var uploadResult = await cloudinary.UploadAsync(new RawUploadParams
                {
                    File = new FileDescription($"subtitle_{maBaiHoc}.vtt", vttStream),
                    Folder = "subtitles",
                    PublicId = $"sub_{maBaiHoc}"
                });

                if (uploadResult.Error != null)
                    throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");

                // 7. Update DB. SubtitleSource đã set = "ai" lúc tạo hold, không set lại ở đây.
                baiHoc.SubtitleUrl = uploadResult.SecureUrl.ToString();
                baiHoc.HasSubtitle = true;
                baiHoc.VideoStatus = "Ready";

                // 8. Commit hold balance. Tiền đã bị trừ lúc tạo hold; ở đây chỉ đánh dấu committed.
                hold.Status = "committed";
                hold.SettledAt = DateTime.UtcNow;

                await context.SaveChangesAsync();

                // 9. Invalidate Redis cache cho khóa học
                try
                {
                    var redisService = scope.ServiceProvider.GetRequiredService<IRedisService>();
                    var maKhoaHoc = baiHoc.ChuongHoc.KhoaHoc.MaKhoaHoc;
                    var maGiangVien = baiHoc.ChuongHoc.KhoaHoc.MaGiangVien;

                    // Invalidate theo đúng pattern hệ thống (xem KhoaHocCuaToiService):
                    //  - Danh sách khóa học giảng viên: key "Instructor:{id}:CourseList"
                    //  - Chi tiết khóa học: key có version "...detail:v{version}" → tăng version để invalidate
                    await redisService.XoaKeyAsync($"Instructor:{maGiangVien}:CourseList");
                    await redisService.TangVersionKhoaHocAsync(maKhoaHoc);

                    _logger.LogInformation("Cache invalidated for course {MaKhoaHoc} after subtitle creation", maKhoaHoc);
                }
                catch (Exception cacheEx)
                {
                    _logger.LogWarning(cacheEx, "Failed to invalidate cache for lesson {MaBaiHoc}, but subtitle was saved successfully", maBaiHoc);
                }

                // 10. SignalR notify
                try
                {
                    await hubContext.Clients.User(baiHoc.ChuongHoc.KhoaHoc.MaGiangVien.ToString())
                        .SendAsync("SubtitleReady", new { maBaiHoc });
                }
                catch { /* ignore signalr error */ }

                _logger.LogInformation("AI subtitle done for lesson {MaBaiHoc}", maBaiHoc);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI subtitle failed for lesson {MaBaiHoc}", maBaiHoc);

                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();
                    var hubContext = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.SignalR.IHubContext<Hubs.SystemConfigHub>>();

                    var baiHoc = await context.BaiHocs.FindAsync(maBaiHoc);
                    var hold = await context.AIBalanceHolds.FindAsync(holdId);

                    // Chỉ hoàn tiền nếu hold còn "holding" (tránh hoàn 2 lần nếu job chạy lại).
                    if (hold != null && hold.Status == "holding")
                    {
                        hold.Status = "released";
                        hold.SettledAt = DateTime.UtcNow;

                        // Hoàn lại số dư đã trừ lúc tạo hold.
                        var quota = await context.GiangVienQuotas.FirstOrDefaultAsync(q => q.MaGiangVien == hold.MaGiangVien);
                        if (quota != null)
                        {
                            quota.AiBalanceUsd += hold.AmountUsd;
                            quota.UpdatedAt = DateTime.UtcNow;
                        }
                    }
                    if (baiHoc != null)
                        baiHoc.VideoStatus = "Failed_Subtitle";

                    await context.SaveChangesAsync();

                    try
                    {
                        await hubContext.Clients.User(baiHoc.ChuongHoc.KhoaHoc.MaGiangVien.ToString())
                            .SendAsync("SubtitleFailed", new { maBaiHoc, error = ex.Message });
                    }
                    catch { }
                }
                catch { }
            }
            finally
            {
                if (File.Exists(videoPath)) File.Delete(videoPath);
                if (File.Exists(audioPath)) File.Delete(audioPath);
                if (File.Exists(vttPath)) File.Delete(vttPath);

                // Xóa object audio trên GCS (nếu đã upload). Bọc try/catch riêng để
                // lỗi xóa GCS không che lỗi chính. Lifecycle rule 24h là lưới đỡ thứ hai.
                if (gcsObjectName != null && !string.IsNullOrEmpty(_audioStagingBucket))
                {
                    try
                    {
                        await _storageClient.DeleteObjectAsync(_audioStagingBucket, gcsObjectName);
                    }
                    catch (Exception gcsEx)
                    {
                        _logger.LogWarning(gcsEx, "Không xóa được object GCS {ObjectName} sau job phụ đề", gcsObjectName);
                    }
                }
            }
        }

        // Ngưỡng gom từ thành 1 dòng phụ đề (cue) cho dễ đọc.
        private const int MaxWordsPerCue = 12;              // tối đa số từ 1 cue
        private const double MaxCueDurationSec = 5.0;       // tối đa độ dài 1 cue
        private const double SilenceGapSec = 0.8;           // khoảng lặng => ngắt cue

        private string GenerateVtt(IEnumerable<SpeechRecognitionResult> results)
        {
            var sb = new StringBuilder();
            sb.AppendLine("WEBVTT");
            sb.AppendLine();

            // Gộp toàn bộ từ (kèm timestamp) từ alternative đầu tiên của mỗi result.
            var words = new List<WordInfo>();
            foreach (var result in results)
            {
                var alt = result.Alternatives.FirstOrDefault();
                if (alt == null) continue;
                words.AddRange(alt.Words);
            }

            if (words.Count == 0)
                return sb.ToString();

            var cueWords = new List<WordInfo>();

            void FlushCue()
            {
                if (cueWords.Count == 0) return;
                var start = FormatVttTime(cueWords[0].StartTime);
                var end = FormatVttTime(cueWords[^1].EndTime);
                var text = string.Join(" ", cueWords.Select(w => w.Word));
                sb.AppendLine($"{start} --> {end}");
                sb.AppendLine(text);
                sb.AppendLine();
                cueWords.Clear();
            }

            for (int i = 0; i < words.Count; i++)
            {
                var word = words[i];

                // Ngắt cue trước khi thêm từ này nếu có khoảng lặng lớn so với từ trước.
                if (cueWords.Count > 0)
                {
                    var prevEnd = ToSeconds(cueWords[^1].EndTime);
                    var curStart = ToSeconds(word.StartTime);
                    if (curStart - prevEnd >= SilenceGapSec)
                        FlushCue();
                }

                cueWords.Add(word);

                // Ngắt cue sau khi thêm nếu: đủ số từ, cue quá dài, hoặc kết thúc câu.
                var cueStart = ToSeconds(cueWords[0].StartTime);
                var cueEnd = ToSeconds(word.EndTime);
                var endsSentence = word.Word.EndsWith('.') || word.Word.EndsWith('?') || word.Word.EndsWith('!');

                if (cueWords.Count >= MaxWordsPerCue
                    || (cueEnd - cueStart) >= MaxCueDurationSec
                    || endsSentence)
                {
                    FlushCue();
                }
            }

            FlushCue(); // flush phần còn lại

            return sb.ToString();
        }

        private static double ToSeconds(Google.Protobuf.WellKnownTypes.Duration duration)
            => duration.Seconds + duration.Nanos / 1_000_000_000.0;

        private string FormatVttTime(Google.Protobuf.WellKnownTypes.Duration duration)
        {
            var totalSeconds = duration.Seconds + duration.Nanos / 1_000_000_000.0;
            var ts = TimeSpan.FromSeconds(totalSeconds);
            return ts.ToString(@"hh\:mm\:ss\.fff");
        }
    }
}