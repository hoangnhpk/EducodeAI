using educodeai_server.Config;
using educodeai_server.Data;
using educodeai_server.Models;
using Google.Cloud.Speech.V1;
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
        private readonly CauHinhSpeechToText _sttConfig;

        public AiSubtitleWorker(IServiceScopeFactory scopeFactory, ILogger<AiSubtitleWorker> logger, SpeechClient speechClient, IOptions<CauHinhGoogleCloud> gcpConfig)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _speechClient = speechClient;
            _sttConfig = gcpConfig.Value.SpeechToText;
        }

        public async Task ProcessAsync(int maBaiHoc, int holdId)
        {
            string? videoPath = null, audioPath = null, vttPath = null;

            try
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();
                var cloudinary = scope.ServiceProvider.GetRequiredService<Cloudinary>();
                var cloudinaryConfig = scope.ServiceProvider.GetRequiredService<IOptions<Config.CauHinhCloudinary>>().Value;
                var hubContext = scope.ServiceProvider.GetRequiredService<Microsoft.AspNetCore.SignalR.IHubContext<Hubs.SystemConfigHub>>();

                var baiHoc = await context.BaiHocs.Include(b => b.ChuongHoc).ThenInclude(c => c.KhoaHoc).FirstOrDefaultAsync(b => b.MaBaiHoc == maBaiHoc);
                var hold = await context.AIBalanceHolds.FindAsync(holdId);
                if (baiHoc == null || hold == null) return;

                // 1. Generate signed URL + download video
                var mediaService = scope.ServiceProvider.GetRequiredService<IMediaService>();
                var token = mediaService.LayTokenPhatVideo(baiHoc.VideoPublicId!);
                var signedUrl = $"https://res.cloudinary.com/{cloudinaryConfig.CloudName}/video/upload/{baiHoc.VideoPublicId}?{token}";
                videoPath = Path.GetTempFileName();
                using (var client = new HttpClient { Timeout = TimeSpan.FromMinutes(5) })
                using (var stream = await client.GetStreamAsync(signedUrl))
                using (var fs = File.OpenWrite(videoPath))
                    await stream.CopyToAsync(fs);

                // 2. Extract audio bằng FFmpeg
                audioPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.flac");
                await FFMpegArguments
                    .FromFileInput(videoPath)
                    .OutputToFile(audioPath, true, options => options
                        .WithCustomArgument("-ac 1 -ar 16000 -c:a flac"))
                    .ProcessAsynchronously();

                // 3. Đọc bytes → Speech-to-Text RecognizeAsync (async, inline)
                var audioBytes = await File.ReadAllBytesAsync(audioPath);
                var recognitionConfig = new RecognitionConfig
                {
                    Encoding = RecognitionConfig.Types.AudioEncoding.Flac,
                    SampleRateHertz = 16000,
                    LanguageCode = _sttConfig.Language,
                    EnableAutomaticPunctuation = true,
                    EnableWordTimeOffsets = true,
                    Model = _sttConfig.Model
                };
                var audio = RecognitionAudio.FromBytes(audioBytes);
                var response = await _speechClient.RecognizeAsync(recognitionConfig, audio);

                // 4. Parse → VTT
                var vttContent = GenerateVtt(response.Results);
                vttPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.vtt");
                await File.WriteAllTextAsync(vttPath, vttContent);

                // 5. Upload .vtt lên Cloudinary
                using var vttStream = File.OpenRead(vttPath);
                var uploadResult = await cloudinary.UploadAsync(new RawUploadParams
                {
                    File = new FileDescription($"subtitle_{maBaiHoc}.vtt", vttStream),
                    Folder = "subtitles",
                    PublicId = $"sub_{maBaiHoc}"
                });

                if (uploadResult.Error != null)
                    throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");

                // 6. Update DB
                baiHoc.SubtitleUrl = uploadResult.SecureUrl.ToString();
                baiHoc.HasSubtitle = true;
                baiHoc.VideoStatus = "Ready";
                baiHoc.SubtitleSource = "ai";

                // 7. Commit hold balance
                hold.Status = "committed";
                hold.SettledAt = DateTime.UtcNow;
                var quota = await context.GiangVienQuotas.FirstOrDefaultAsync(q => q.MaGiangVien == hold.MaGiangVien);
                if (quota != null)
                {
                    quota.AiBalanceUsd -= hold.AmountUsd;
                    if (quota.AiBalanceUsd < 0) quota.AiBalanceUsd = 0;
                }

                await context.SaveChangesAsync();

                // 8. SignalR notify
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

                    if (hold != null)
                    {
                        hold.Status = "released";
                        hold.SettledAt = DateTime.UtcNow;
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
            }
        }

        private string GenerateVtt(IEnumerable<SpeechRecognitionResult> results)
        {
            var sb = new StringBuilder();
            sb.AppendLine("WEBVTT");
            sb.AppendLine();

            foreach (var result in results)
            {
                foreach (var alt in result.Alternatives)
                {
                    foreach (var word in alt.Words)
                    {
                        var start = FormatVttTime(word.StartTime);
                        var end = FormatVttTime(word.EndTime);
                        sb.AppendLine($"{start} --> {end}");
                        sb.AppendLine(word.Word);
                        sb.AppendLine();
                    }
                }
            }

            return sb.ToString();
        }

        private string FormatVttTime(Google.Protobuf.WellKnownTypes.Duration duration)
        {
            var totalSeconds = duration.Seconds + duration.Nanos / 1_000_000_000.0;
            var ts = TimeSpan.FromSeconds(totalSeconds);
            return ts.ToString(@"hh\:mm\:ss\.fff");
        }
    }
}