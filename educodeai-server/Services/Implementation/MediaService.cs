using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using educodeai_server.Config;
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

        public MediaService(Cloudinary cloudinary, IOptions<CauHinhCloudinary> cloudinaryConfig, EduCodeAIDbContext context)
        {
            _cloudinary = cloudinary;
            _cloudinaryConfig = cloudinaryConfig.Value;
            _context = context;
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

            try
            {
                var payloadDoc = System.Text.Json.JsonDocument.Parse(body);
                var root = payloadDoc.RootElement;
                if (root.TryGetProperty("notification_id", out var idProp))
                {
                    var notificationId = idProp.GetString();
                    if (!string.IsNullOrEmpty(notificationId))
                    {
                        if (await KiemTraWebhookDaXuLyAsync(notificationId))
                            return (true, "Already processed");

                        var notifType = root.TryGetProperty("notification_type", out var typeProp) ? typeProp.GetString() : "unknown";
                        
                        // Xử lý tạo phụ đề AI
                        if (root.TryGetProperty("info", out var infoProp))
                        {
                            if (infoProp.TryGetProperty("raw_convert", out var rcProp))
                            {
                                if (rcProp.TryGetProperty("google_speech", out var gsProp))
                                {
                                    var status = gsProp.TryGetProperty("status", out var sProp) ? sProp.GetString() : "";
                                    if (status == "complete" || status == "pending") // pending could mean it's starting
                                    {
                                        if (status == "complete")
                                        {
                                            var publicId = root.TryGetProperty("public_id", out var pProp) ? pProp.GetString() : "";
                                            var url = gsProp.TryGetProperty("url", out var uProp) ? uProp.GetString() : "";
                                            
                                            var baiHoc = await _context.BaiHocs.FirstOrDefaultAsync(b => b.VideoPublicId == publicId);
                                            if (baiHoc != null && !string.IsNullOrEmpty(url))
                                            {
                                                baiHoc.SubtitleUrl = url;
                                                baiHoc.HasSubtitle = true;
                                                baiHoc.VideoStatus = "Ready";

                                                // Release hold
                                                var hold = await _context.AIBalanceHolds
                                                    .Where(h => h.MaBaiHoc == baiHoc.MaBaiHoc && h.Status == "holding")
                                                    .FirstOrDefaultAsync();
                                                
                                                if (hold != null)
                                                {
                                                    hold.Status = "committed";
                                                    hold.SettledAt = DateTime.UtcNow;

                                                    var quota = await _context.GiangVienQuotas.FirstOrDefaultAsync(q => q.MaGiangVien == hold.MaGiangVien);
                                                    if (quota != null)
                                                    {
                                                        quota.AiBalanceUsd -= hold.AmountUsd;
                                                        if (quota.AiBalanceUsd < 0) quota.AiBalanceUsd = 0;
                                                    }
                                                }
                                                await _context.SaveChangesAsync();
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        await DanhDauWebhookDaXuLyAsync(notificationId, notifType ?? "unknown", body);
                    }
                }
            }
            catch
            {
                return (false, "Invalid payload");
            }

            return (true, "Success");
        }

        public async Task<bool> LuuThongTinVideoAsync(int maGiangVien, LuuThongTinVideoDTO dto)
        {
            var baiHoc = await _context.BaiHocs
                .Include(b => b.ChuongHoc)
                .ThenInclude(c => c.KhoaHoc)
                .FirstOrDefaultAsync(b => b.MaBaiHoc == dto.MaBaiHoc);

            if (baiHoc == null) return false;
            if (baiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien) return false;

            baiHoc.VideoPublicId = dto.PublicId;
            baiHoc.VideoSource = "cloudinary";
            baiHoc.LinkVideo = dto.SecureUrl; 
            baiHoc.VideoDurationS = dto.ThoiLuong;
            baiHoc.VideoSizeMb = dto.DungLuong / (1024 * 1024); 
            baiHoc.VideoStatus = dto.TrangThaiVideo;

            await _context.SaveChangesAsync();
            return true;
        }

        public string LayTokenPhatVideo(string publicId)
        {
            var expiration = DateTimeOffset.UtcNow.ToUnixTimeSeconds() + 7200;
            var acl = $"/video/upload/*";
            var toSign = $"acl={acl}~exp={expiration}";
            
            var keyBytes = Encoding.UTF8.GetBytes(_cloudinaryConfig.ApiSecret);
            using var hmac = new System.Security.Cryptography.HMACSHA256(keyBytes);
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(toSign));
            var hmacHex = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            
            return $"{toSign}~hmac={hmacHex}";
        }

        public async Task<string?> TaiLenPhuDeAsync(IFormFile file, string folder)
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

        public async Task<(bool IsSuccess, string Message)> YeuCauTaoPhuDeAIAsync(int maGiangVien, int maBaiHoc)
        {
            var baiHoc = await _context.BaiHocs
                .Include(b => b.ChuongHoc).ThenInclude(c => c.KhoaHoc)
                .FirstOrDefaultAsync(b => b.MaBaiHoc == maBaiHoc);

            if (baiHoc == null || baiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien)
                return (false, "Bài học không hợp lệ.");

            if (string.IsNullOrEmpty(baiHoc.VideoPublicId))
                return (false, "Bài học chưa có video trên Cloudinary.");

            // Tính toán chi phí (Ví dụ: 0.06$ / phút)
            // Lấy VideoDurationS, nếu null thì thử lấy ThoiLuong, nếu vẫn null thì mặc định 0
            var durationS = baiHoc.VideoDurationS ?? baiHoc.ThoiLuong ?? 0;
            
            // Tính số phút (làm tròn lên), TỐI THIỂU là 1 phút
            var minutes = Math.Max(1, Math.Ceiling((double)durationS / 60));
            var costUsd = (decimal)minutes * 0.06m;

            var quota = await _context.GiangVienQuotas.FirstOrDefaultAsync(q => q.MaGiangVien == maGiangVien);
            if (quota == null)
            {
                quota = new GiangVienQuotaModel { MaGiangVien = maGiangVien };
                _context.GiangVienQuotas.Add(quota);
            }

            if (quota.AiBalanceUsd < costUsd)
                return (false, $"Số dư không đủ. Yêu cầu ${costUsd}, hiện có ${quota.AiBalanceUsd}");

            // Hold tiền
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
            
            // Gọi Cloudinary Addon (Nếu chạy báo lỗi UpdateResourceParams thì có thể do version SDK)
            try
            {
                var updParams = new UpdateParams(baiHoc.VideoPublicId)
                {
                    ResourceType = ResourceType.Video,
                    RawConvert = "google_speech:vi"
                };
                await _cloudinary.UpdateResourceAsync(updParams);
            }
            catch (Exception ex)
            {
                return (false, "Lỗi khi gọi Cloudinary: " + ex.Message);
            }

            await _context.SaveChangesAsync();
            return (true, "Yêu cầu tạo phụ đề đã được gửi thành công");
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
    }
}
