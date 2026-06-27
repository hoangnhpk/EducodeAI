using CloudinaryDotNet;
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
            var paramToSign = new Dictionary<string, object>
            {
                { "timestamp", timestamp },
                { "folder", folder },
                { "upload_preset", _cloudinaryConfig.UploadPreset }
            };

            var signature = _cloudinary.Api.SignParameters(paramToSign);

            return Task.FromResult(new ChuKyUploadVideoDTO
            {
                Timestamp = timestamp,
                Signature = signature,
                ApiKey = _cloudinaryConfig.ApiKey,
                CloudName = _cloudinaryConfig.CloudName,
                Folder = folder
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
                        
                        // TODO: Xử lý logic cụ thể theo notification_type (upload, eager, raw_convert...)

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
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            return $"mock_token_for_{publicId}_{timestamp}";
        }
    }
}
