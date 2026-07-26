using educodeai_server.DTOs.Media;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;
using educodeai_server.Helpers;
using Microsoft.Extensions.Caching.Memory;

namespace educodeai_server.Controllers.GiangVien
{
    [Route("api/giang-vien/media")]
    [ApiController]
    public class MediaController : ControllerBase
    {
        private readonly IMediaService _mediaService;
        private readonly Microsoft.Extensions.Caching.Memory.IMemoryCache _cache;

        // Ngưỡng rate limit cho từng endpoint nhạy cảm (số request / cửa sổ thời gian).
        // Gom về một chỗ để dễ tinh chỉnh khi vận hành.
        private static readonly (int Limit, TimeSpan Window) GioiHanChuKyUpload = (60, TimeSpan.FromMinutes(5));
        private static readonly (int Limit, TimeSpan Window) GioiHanTaiLenPhuDe = (30, TimeSpan.FromMinutes(5));
        private static readonly (int Limit, TimeSpan Window) GioiHanTaoPhuDeAI = (10, TimeSpan.FromMinutes(10));

        public MediaController(IMediaService mediaService, Microsoft.Extensions.Caching.Memory.IMemoryCache cache)
        {
            _mediaService = mediaService;
            _cache = cache;
        }

        private int GetMaGiangVien()
        {
            return LayNguoiDungID.LayID(User);
        }

        // Fixed-window rate limit: cửa sổ neo theo lần request đầu, KHÔNG trượt mỗi request.
        // Trả về true nếu ĐÃ vượt giới hạn (nên chặn); khi đó retryAfterSeconds = số giây còn lại của cửa sổ.
        //
        // GIỚI HẠN ĐÃ BIẾT (chấp nhận được ở quy mô 1 instance):
        //  - TryGetValue + Set KHÔNG atomic: 2 request đồng thời có thể cùng đọc count cũ và cùng lọt.
        //  - IMemoryCache là per-process: nếu scale-out nhiều instance, mỗi instance có counter riêng
        //    → giới hạn thực tế bị nhân theo số instance.
        //  Nếu về sau cần chính xác khi scale-out: chuyển sang Redis atomic (INCR + EXPIRE) qua
        //  IRedisService.ThucThiLuaScriptAsync (MediaService đã có sẵn IRedisService).
        private bool VuotGioiHan(string key, int limit, TimeSpan window, out int retryAfterSeconds)
        {
            retryAfterSeconds = 0;
            // Lưu (count, thời điểm hết hạn tuyệt đối). Expiration của cache entry cũng
            // neo cố định vào windowEnd nên không bị đẩy dài ra khi tăng count.
            if (_cache.TryGetValue<(int Count, DateTimeOffset WindowEnd)>(key, out var entry))
            {
                if (entry.Count >= limit)
                {
                    var conLai = (entry.WindowEnd - DateTimeOffset.UtcNow).TotalSeconds;
                    retryAfterSeconds = Math.Max(1, (int)Math.Ceiling(conLai));
                    return true;
                }
                _cache.Set(key, (entry.Count + 1, entry.WindowEnd),
                    new MemoryCacheEntryOptions { AbsoluteExpiration = entry.WindowEnd });
                return false;
            }

            var windowEnd = DateTimeOffset.UtcNow.Add(window);
            _cache.Set(key, (1, windowEnd),
                new MemoryCacheEntryOptions { AbsoluteExpiration = windowEnd });
            return false;
        }

        // Gắn header Retry-After (giây) để client biết thời điểm được thử lại.
        private IActionResult TooManyRequests(string message, int retryAfterSeconds)
        {
            Response.Headers["Retry-After"] = retryAfterSeconds.ToString();
            return StatusCode(429, new { success = false, message });
        }

        [HttpGet("lay-chu-ky-upload")]
        [Authorize(Roles = "GiangVien,Admin")] 
        public async Task<IActionResult> LayChuKyUpload()
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            // Áp dụng Rate Limiting chống Spam.
            if (VuotGioiHan($"RateLimit_UploadSig_{maGiangVien}", GioiHanChuKyUpload.Limit, GioiHanChuKyUpload.Window, out var retryAfter))
                return TooManyRequests("Bạn đã vượt quá giới hạn lấy chữ ký. Vui lòng thử lại sau ít phút.", retryAfter);

            var folder = $"courses/{maGiangVien}";
            var signatureData = await _mediaService.LayChuKyUploadVideoAsync(maGiangVien.ToString(), folder);

            return Ok(new { success = true, data = signatureData });
        }

        [HttpPost("luu-video")]
        [Authorize(Roles = "GiangVien,Admin")]
        public async Task<IActionResult> LuuVideo([FromBody] LuuThongTinVideoDTO request)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            var result = await _mediaService.LuuThongTinVideoAsync(maGiangVien, request);
            if (!result)
                return BadRequest(new { success = false, message = "Không thể cập nhật video. Bạn không có quyền hoặc Bài học không tồn tại." });

            return Ok(new { success = true, message = "Lưu thông tin video thành công!" });
        }

        [HttpGet("lay-token-phat-video")]
        [Authorize(Roles = "GiangVien,Admin")]
        public async Task<IActionResult> LayTokenPhatVideo([FromQuery] string publicId)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            if (string.IsNullOrEmpty(publicId))
                return BadRequest(new { success = false, message = "Public ID là bắt buộc" });

            // Chỉ cấp token cho video mà giảng viên sở hữu (tránh xem video của người khác).
            if (!await _mediaService.GiangVienSoHuuVideoAsync(maGiangVien, publicId))
                return StatusCode(403, new { success = false, message = "Bạn không có quyền truy cập video này." });

            var token = _mediaService.LayTokenPhatVideo(publicId);
            return Ok(new { success = true, data = new { token } });
        }

        [HttpPost("tai-len-phu-de")]
        [Authorize(Roles = "GiangVien,Admin")]
        public async Task<IActionResult> TaiLenPhuDe([FromForm] int maBaiHoc, IFormFile file)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "Thiếu file phụ đề." });

            if (VuotGioiHan($"RateLimit_TaiLenPhuDe_{maGiangVien}", GioiHanTaiLenPhuDe.Limit, GioiHanTaiLenPhuDe.Window, out var retryAfter))
                return TooManyRequests("Bạn đã tải lên quá nhiều phụ đề. Vui lòng thử lại sau ít phút.", retryAfter);

            var folder = $"subtitles/{maGiangVien}";
            var (success, url, message) = await _mediaService.LuuPhuDeThuCongAsync(maGiangVien, maBaiHoc, file, folder);

            if (!success)
                return BadRequest(new { success = false, message });

            return Ok(new { success = true, data = new { url }, message });
        }

        [HttpPost("tao-phu-de-ai/{maBaiHoc}")]
        [Authorize(Roles = "GiangVien,Admin")]
        public async Task<IActionResult> TaoPhuDeAI(int maBaiHoc)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            if (VuotGioiHan($"RateLimit_TaoPhuDeAI_{maGiangVien}", GioiHanTaoPhuDeAI.Limit, GioiHanTaoPhuDeAI.Window, out var retryAfter))
                return TooManyRequests("Bạn đã gửi quá nhiều yêu cầu AI. Vui lòng thử lại sau ít phút.", retryAfter);

            var (success, message) = await _mediaService.YeuCauTaoPhuDeAIAsync(maGiangVien, maBaiHoc);
            
            if (!success)
                return BadRequest(new { success = false, message });

            return Ok(new { success = true, message });
        }
    }

    [Route("api/webhooks")]
    [ApiController]
    public class CloudinaryWebhookController : ControllerBase
    {
        private readonly IMediaService _mediaService;

        public CloudinaryWebhookController(IMediaService mediaService)
        {
            _mediaService = mediaService;
        }

        [HttpPost("cloudinary")]
        [AllowAnonymous]
        public async Task<IActionResult> XuLyWebhookCloudinary()
        {
            Request.EnableBuffering();
            using var reader = new StreamReader(Request.Body, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            Request.Body.Position = 0;

            var timestamp = Request.Headers["X-Cld-Timestamp"].ToString();
            var receivedSignature = Request.Headers["X-Cld-Signature"].ToString();

            var (success, message) = await _mediaService.XuLyWebhookCloudinaryAsync(body, timestamp, receivedSignature);
            
            if (!success)
            {
                if (message == "Invalid payload") return BadRequest();
                return Unauthorized(new { message });
            }

            return Ok();
        }
    }


}
