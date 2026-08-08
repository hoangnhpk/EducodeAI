using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using educodeai_server.Config;
using educodeai_server.Constants;
using educodeai_server.Data;
using educodeai_server.DTOs.Media;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;

namespace educodeai_server.Services.Implementation
{
    public class MediaService : IMediaService
    {
        private readonly Cloudinary _cloudinary;
        private readonly CauHinhCloudinary _cloudinaryConfig;
        private readonly EduCodeAIDbContext _context;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly double _speechPricePerMinuteUsd;
        private readonly ICurrencyExchangeService _currencyExchange;
        private readonly IRedisService _redisService;
        private readonly ILogger<MediaService> _logger;

        public MediaService(Cloudinary cloudinary, IOptions<CauHinhCloudinary> cloudinaryConfig, EduCodeAIDbContext context, IServiceScopeFactory serviceScopeFactory, IOptions<CauHinhGoogleCloud> gcpConfig, ICurrencyExchangeService currencyExchange, IRedisService redisService, ILogger<MediaService> logger)
        {
            _cloudinary = cloudinary;
            _cloudinaryConfig = cloudinaryConfig.Value;
            _context = context;
            _serviceScopeFactory = serviceScopeFactory;
            _speechPricePerMinuteUsd = gcpConfig.Value.SpeechToText.PricePerMinuteUsd;
            _currencyExchange = currencyExchange;
            _redisService = redisService;
            _logger = logger;
        }

        public Task<ChuKyUploadVideoDTO> LayChuKyUploadVideoAsync(string maGiangVien, string folder)
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
            var uploadPreset = _cloudinaryConfig.UploadPreset;

            // Xây dựng chuỗi để ký (yêu cầu của Cloudinary: xếp theo thứ tự a-z, nối bằng &)
            // Các tham số gửi lên gồm: folder, timestamp, upload_preset
            var toSign = $"folder={folder}&timestamp={timestamp}&upload_preset={uploadPreset}";
            
            // Nối thêm ApiSecret vào cuối chuỗi
            var stringToHash = toSign + _cloudinaryConfig.ApiSecret;
            var signature = ComputeSha1Hex(stringToHash);

            return Task.FromResult(new ChuKyUploadVideoDTO
            {
                Timestamp = timestamp,
                Signature = signature,
                ApiKey = _cloudinaryConfig.ApiKey,
                CloudName = _cloudinaryConfig.CloudName,
                Folder = folder,
                UploadPreset = uploadPreset
            });
        }

        public Task<bool> KiemTraChuKyWebhookAsync(string body, string timestamp, string signature)
        {
            var expected = ComputeSha1Hex(body + timestamp + _cloudinaryConfig.ApiSecret);
            var isValid = CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(expected),
                Encoding.UTF8.GetBytes(signature)
            );
            return Task.FromResult(isValid);
        }

        private string ComputeSha1Hex(string input)
        {
            using var sha1 = SHA1.Create();
            var hashBytes = sha1.ComputeHash(Encoding.UTF8.GetBytes(input));
            var sb = new StringBuilder();
            foreach (var b in hashBytes)
                sb.Append(b.ToString("x2"));
            return sb.ToString();
        }

        public async Task<bool> KiemTraWebhookDaXuLyAsync(string notificationId)
        {
            return await _context.WebhookLogs.AnyAsync(w => w.NotificationId == notificationId);
        }

        public async Task DanhDauWebhookDaXuLyAsync(string notificationId, string notificationType, string payload)
        {
            var log = new WebhookLogModel
            {
                NotificationId = notificationId,
                NotificationType = notificationType,
                Payload = payload
            };
            _context.WebhookLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<(bool IsSuccess, string Message)> XuLyWebhookCloudinaryAsync(string body, string timestamp, string signature)
        {
            if (string.IsNullOrEmpty(timestamp) || string.IsNullOrEmpty(signature))
                return (false, "Missing headers");

            if (long.TryParse(timestamp, out var ts))
            {
                var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                if (Math.Abs(now - ts) > 300)
                    return (false, "Webhook timestamp expired");
            }

            var isValid = await KiemTraChuKyWebhookAsync(body, timestamp, signature);
            if (!isValid)
                return (false, "Invalid webhook signature");

            System.Text.Json.JsonDocument payloadDoc;
            try
            {
                payloadDoc = System.Text.Json.JsonDocument.Parse(body);
            }
            catch
            {
                return (false, "Invalid payload");
            }

            using (payloadDoc)
            {
                var root = payloadDoc.RootElement;
                if (!root.TryGetProperty("notification_id", out var idProp))
                    return (true, "Success"); // không có id thì bỏ qua an toàn

                var notificationId = idProp.GetString();
                if (string.IsNullOrEmpty(notificationId))
                    return (true, "Success");

                if (await KiemTraWebhookDaXuLyAsync(notificationId))
                    return (true, "Already processed");

                var notifType = root.TryGetProperty("notification_type", out var typeProp) ? typeProp.GetString() : "unknown";

                // Đánh dấu đã xử lý TRƯỚC để chốt idempotency. Nếu 2 webhook cùng id tới
                // song song, request thứ 2 sẽ dính lỗi unique key → coi như đã xử lý.
                try
                {
                    await DanhDauWebhookDaXuLyAsync(notificationId, notifType ?? "unknown", body);
                }
                catch (DbUpdateException)
                {
                    return (true, "Already processed");
                }

                // Phân nhánh xử lý theo loại thông báo.
                await XuLyTheoLoaiThongBaoAsync(notifType, root);
            }

            return (true, "Success");
        }

        // Cập nhật DB theo loại webhook. Cloudinary gửi public_id trong payload.
        private async Task XuLyTheoLoaiThongBaoAsync(string? notifType, System.Text.Json.JsonElement root)
        {
            var publicId = root.TryGetProperty("public_id", out var pidProp) ? pidProp.GetString() : null;
            if (string.IsNullOrEmpty(publicId)) return;

            var baiHoc = await _context.BaiHocs.FirstOrDefaultAsync(b => b.VideoPublicId == publicId);
            if (baiHoc == null) return;

            switch (notifType)
            {
                case "upload":
                case "eager":
                    // Transcode/upload xong → video sẵn sàng phát (nếu chưa ở bước phụ đề).
                    if (baiHoc.VideoStatus != "Processing_Subtitle")
                        baiHoc.VideoStatus = "Ready";
                    await _context.SaveChangesAsync();
                    break;
                // Các loại khác (raw_convert, delete...) chưa cần xử lý ở MVP.
            }
        }

        public async Task<bool> LuuThongTinVideoAsync(int maGiangVien, LuuThongTinVideoDTO dto)
        {
            var baiHoc = await _context.BaiHocs
                .Include(b => b.ChuongHoc)
                .ThenInclude(c => c.KhoaHoc)
                .FirstOrDefaultAsync(b => b.MaBaiHoc == dto.MaBaiHoc);

            if (baiHoc == null) return false;
            if (baiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien) return false;

            // Chống SSRF: SecureUrl do client gửi lên và sau này AiSubtitleWorker sẽ tự GET để
            // tải video về. Nếu không kiểm tra, attacker có thể trỏ URL tới nội bộ
            // (169.254.169.254, localhost...) khiến server tự gọi. Chỉ chấp nhận URL thuộc
            // đúng tài khoản Cloudinary đã cấu hình.
            if (!LaUrlCloudinaryHopLe(dto.SecureUrl))
                return false;

            baiHoc.VideoPublicId = dto.PublicId;
            baiHoc.VideoSource = "cloudinary";
            baiHoc.LinkVideo = dto.SecureUrl;
            baiHoc.VideoDurationS = dto.ThoiLuong;
            baiHoc.VideoSizeMb = (int)(dto.DungLuong / (1024L * 1024L)); // MB, luôn <= ~2048 nên int đủ chứa
            baiHoc.VideoStatus = dto.TrangThaiVideo;

            await _context.SaveChangesAsync();
            return true;
        }

        // Allowlist: chỉ chấp nhận URL https trỏ đúng host res.cloudinary.com và đúng
        // CloudName đã cấu hình (path bắt đầu bằng "/{cloudName}/"). Chặn SSRF: mọi URL
        // trỏ nội bộ, sai host, hoặc sai account đều bị loại.
        private bool LaUrlCloudinaryHopLe(string? url)
        {
            if (string.IsNullOrWhiteSpace(url)) return false;
            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)) return false;
            if (uri.Scheme != Uri.UriSchemeHttps) return false;
            if (!uri.Host.Equals("res.cloudinary.com", StringComparison.OrdinalIgnoreCase)) return false;

            var cloudName = _cloudinaryConfig.CloudName;
            if (string.IsNullOrEmpty(cloudName)) return false;
            return uri.AbsolutePath.StartsWith($"/{cloudName}/", StringComparison.Ordinal);
        }

        public string LayTokenPhatVideo(string publicId)
        {
            // Scope token đúng public_id được yêu cầu, KHÔNG dùng wildcard "*"
            // (wildcard cấp quyền xem toàn bộ video của hệ thống — lỗ hổng bảo mật).
            var expiration = DateTimeOffset.UtcNow.ToUnixTimeSeconds() + 7200;
            var acl = $"/video/upload/{publicId}";
            var toSign = $"acl={acl}~exp={expiration}";

            var keyBytes = Encoding.UTF8.GetBytes(_cloudinaryConfig.ApiSecret);
            using var hmac = new System.Security.Cryptography.HMACSHA256(keyBytes);
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(toSign));
            var hmacHex = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

            return $"{toSign}~hmac={hmacHex}";
        }

        public async Task<bool> GiangVienSoHuuVideoAsync(int maGiangVien, string publicId)
        {
            if (string.IsNullOrEmpty(publicId)) return false;
            return await _context.BaiHocs
                .Include(b => b.ChuongHoc).ThenInclude(c => c.KhoaHoc)
                .AnyAsync(b => b.VideoPublicId == publicId
                            && b.ChuongHoc.KhoaHoc.MaGiangVien == maGiangVien);
        }

        private async Task<string?> TaiLenPhuDeAsync(IFormFile file, string folder)
        {
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (extension != ".vtt" && extension != ".srt")
            {
                return null;
            }

            using var stream = file.OpenReadStream();
            var uploadParams = new RawUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null) return null;

            return uploadResult.SecureUrl?.ToString();
        }

        // Upload phụ đề thủ công + LƯU vào bảng BaiHoc (đóng gap: trước đây chỉ upload Cloudinary,
        // không persist URL nên phụ đề thủ công bị mất sau khi reload).
        // Phụ đề thực tế chỉ vài KB đến tối đa vài trăm KB; chặn ở 2MB là dư sức cho
        // video rất dài mà vẫn ngăn upload file rác lớn ngốn RAM/băng thông server
        // (file phụ đề đi QUA server, khác video đi thẳng client → Cloudinary).
        private const long MaxSubtitleBytes = 2 * 1024 * 1024;

        public async Task<(bool IsSuccess, string? Url, string Message)> LuuPhuDeThuCongAsync(int maGiangVien, int maBaiHoc, IFormFile file, string folder)
        {
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (extension != ".vtt" && extension != ".srt")
                return (false, null, "Chỉ chấp nhận file .srt hoặc .vtt.");

            if (file.Length == 0)
                return (false, null, "File phụ đề rỗng.");
            if (file.Length > MaxSubtitleBytes)
                return (false, null, $"File phụ đề vượt quá dung lượng tối đa {MaxSubtitleBytes / 1024}KB.");

            // Kiểm tra quyền sở hữu: giảng viên chỉ được gắn phụ đề cho bài học của khóa mình.
            var baiHoc = await _context.BaiHocs
                .Include(b => b.ChuongHoc).ThenInclude(c => c.KhoaHoc)
                .FirstOrDefaultAsync(b => b.MaBaiHoc == maBaiHoc);

            if (baiHoc == null || baiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien)
                return (false, null, "Bài học không hợp lệ hoặc bạn không có quyền.");

            // Chặn đua ghi đè với job AI: nếu đang tạo phụ đề AI (đã trừ tiền + có hold),
            // không cho upload thủ công đè lên — worker AI sẽ ghi đè kết quả sau đó.
            if (baiHoc.VideoStatus == "Processing_Subtitle")
                return (false, null, "Bài học đang tạo phụ đề AI, vui lòng chờ hoàn tất.");

            var secureUrl = await TaiLenPhuDeAsync(file, folder);
            if (string.IsNullOrEmpty(secureUrl))
                return (false, null, "Tải lên phụ đề thất bại.");

            baiHoc.SubtitleUrl = secureUrl;
            baiHoc.HasSubtitle = true;
            baiHoc.SubtitleSource = "manual";
            await _context.SaveChangesAsync();

            // Invalidate cache khóa học (mirror AiSubtitleWorker) để chi tiết khóa học phản ánh phụ đề mới.
            try
            {
                await _redisService.XoaKeyAsync(CacheKeys.InstructorCourseList(maGiangVien));
                await _redisService.TangVersionKhoaHocAsync(baiHoc.ChuongHoc.KhoaHoc.MaKhoaHoc);
            }
            catch (Exception cacheEx)
            {
                _logger.LogWarning(cacheEx, "Không invalidate được cache sau khi lưu phụ đề thủ công cho bài học {MaBaiHoc}", maBaiHoc);
            }

            return (true, secureUrl, "Tải lên và lưu phụ đề thành công.");
        }

        public async Task<(bool IsSuccess, string Message)> YeuCauTaoPhuDeAIAsync(int maGiangVien, int maBaiHoc)
        {
            var baiHoc = await _context.BaiHocs
                .Include(b => b.ChuongHoc).ThenInclude(c => c.KhoaHoc)
                .FirstOrDefaultAsync(b => b.MaBaiHoc == maBaiHoc);

            if (baiHoc == null || baiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien)
                return (false, "Bài học không hợp lệ.");

            if (string.IsNullOrEmpty(baiHoc.VideoPublicId))
                return (false, "Bài học chưa có video trên Cloudinary.");

            // Chặn tạo trùng khi đang xử lý dở (tránh nhiều hold cho cùng 1 bài học).
            if (baiHoc.VideoStatus == "Processing_Subtitle")
                return (false, "Bài học đang trong quá trình tạo phụ đề. Vui lòng chờ.");

            var durationS = baiHoc.VideoDurationS ?? baiHoc.ThoiLuong ?? 0;
            var minutes = Math.Max(1, Math.Ceiling((double)durationS / 60));
            var costUsd = (decimal)minutes * (decimal)_speechPricePerMinuteUsd;

            // Quy đổi chi phí USD sang VND theo tỷ giá thị trường
            var costVnd = await _currencyExchange.ConvertUsdToVndAsync(costUsd);

            var quota = await _context.GiangVienQuotas.FirstOrDefaultAsync(q => q.MaGiangVien == maGiangVien);
            if (quota == null)
            {
                quota = new GiangVienQuotaModel { MaGiangVien = maGiangVien };
                _context.GiangVienQuotas.Add(quota);
            }

            if (quota.AiBalanceUsd < costUsd)
                return new(false, $"Số dư không đủ. Yêu cầu ${costUsd:F2} (~{costVnd:N0} VND), hiện có ${quota.AiBalanceUsd:F2}");

            // Trừ tiền NGAY khi tạo hold (không đợi commit) để tránh xài lố khi
            // nhiều request đồng thời cùng vượt qua check số dư. Worker sẽ hoàn tiền nếu job fail.
            quota.AiBalanceUsd -= costUsd;
            quota.UpdatedAt = DateTime.UtcNow;

            var hold = new AIBalanceHoldModel
            {
                MaGiangVien = maGiangVien,
                MaBaiHoc = maBaiHoc,
                AmountUsd = costUsd,
                Status = "holding"
            };
            _context.AIBalanceHolds.Add(hold);

            // Cập nhật trạng thái
            baiHoc.SubtitleSource = "ai";
            baiHoc.VideoStatus = "Processing_Subtitle";

            await _context.SaveChangesAsync();

            // Invalidate Redis cache để trạng thái "Processing_Subtitle" hiển thị ngay khi FE refetch.
            // Không có bước này, FE đọc lại chi tiết khóa học đã cache (TTL 24h) nên vẫn thấy trạng thái cũ.
            try
            {
                var maKhoaHoc = baiHoc.ChuongHoc.KhoaHoc.MaKhoaHoc;
                var maGV = baiHoc.ChuongHoc.KhoaHoc.MaGiangVien;
                await _redisService.XoaKeyAsync(CacheKeys.InstructorCourseList(maGV));
                await _redisService.TangVersionKhoaHocAsync(maKhoaHoc);
            }
            catch (Exception cacheEx)
            {
                _logger.LogWarning(cacheEx, "Failed to invalidate cache for lesson {MaBaiHoc} after queuing subtitle job", maBaiHoc);
            }

            // Enqueue background job (dùng Task.Run + IHostedService queue, không cần Hangfire)
            _ = Task.Run(async () =>
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var worker = scope.ServiceProvider.GetRequiredService<IAiSubtitleWorker>();
                await worker.ProcessAsync(maBaiHoc, hold.Id);
            });

            return new(true, "Yêu cầu tạo phụ đề đã được gửi thành công. Vui lòng chờ xử lý.");
        }

        public async Task<bool> DeleteVideoCloudinaryAsync(string publicId)
        {
            try
            {
                if (string.IsNullOrEmpty(publicId)) return false;
                var delParams = new DeletionParams(publicId) { ResourceType = ResourceType.Video };
                var res = await _cloudinary.DestroyAsync(delParams);
                return res.Result == "ok";
            }
            catch (Exception)
            {
                // Ignore delete fail or log it
                return false;
            }
        }

        // Xóa file phụ đề (raw resource) trên Cloudinary. Phụ đề lưu dạng URL đầy đủ trong DB
        // (SubtitleUrl), không lưu public_id riêng, nên phải trích public_id từ URL.
        // URL raw có dạng: https://res.cloudinary.com/{cloud}/raw/upload/v123456/subtitles/7/abc.vtt
        // → public_id của raw resource GỒM CẢ đuôi file: "subtitles/7/abc.vtt".
        public async Task<bool> DeleteSubtitleCloudinaryAsync(string subtitleUrl)
        {
            try
            {
                var publicId = TrichPublicIdTuUrlRaw(subtitleUrl);
                if (string.IsNullOrEmpty(publicId)) return false;

                var delParams = new DeletionParams(publicId) { ResourceType = ResourceType.Raw };
                var res = await _cloudinary.DestroyAsync(delParams);
                return res.Result == "ok";
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Lỗi khi xóa phụ đề Cloudinary từ URL {SubtitleUrl}", subtitleUrl);
                return false;
            }
        }

        // Trích public_id (kèm đuôi) từ URL raw Cloudinary. Trả về null nếu URL không hợp lệ.
        private static string? TrichPublicIdTuUrlRaw(string? url)
        {
            if (string.IsNullOrWhiteSpace(url)) return null;
            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)) return null;

            // Lấy phần sau "/upload/" trong path.
            const string marker = "/upload/";
            var path = uri.AbsolutePath;
            var idx = path.IndexOf(marker, StringComparison.Ordinal);
            if (idx < 0) return null;

            var rest = path.Substring(idx + marker.Length);

            // Bỏ segment version dạng "v1234567890/" nếu có ở đầu.
            var segments = rest.Split('/');
            if (segments.Length > 1 && segments[0].Length > 1
                && segments[0][0] == 'v' && segments[0].Skip(1).All(char.IsDigit))
            {
                rest = string.Join('/', segments.Skip(1));
            }

            return string.IsNullOrEmpty(rest) ? null : Uri.UnescapeDataString(rest);
        }
    }
}
