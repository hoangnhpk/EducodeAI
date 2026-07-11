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
        // Trả về true nếu ĐÃ vượt giới hạn (nên chặn).
        private bool VuotGioiHan(string key, int limit, TimeSpan window)
        {
            // Lưu (count, thời điểm hết hạn tuyệt đối). Expiration của cache entry cũng
            // neo cố định vào windowEnd nên không bị đẩy dài ra khi tăng count.
            if (_cache.TryGetValue<(int Count, DateTimeOffset WindowEnd)>(key, out var entry))
            {
                if (entry.Count >= limit) return true;
                _cache.Set(key, (entry.Count + 1, entry.WindowEnd),
                    new MemoryCacheEntryOptions { AbsoluteExpiration = entry.WindowEnd });
                return false;
            }

            var windowEnd = DateTimeOffset.UtcNow.Add(window);
            _cache.Set(key, (1, windowEnd),
                new MemoryCacheEntryOptions { AbsoluteExpiration = windowEnd });
            return false;
        }

        [HttpGet("lay-chu-ky-upload")]
        [Authorize(Roles = "GiangVien,Admin")] 
        public async Task<IActionResult> LayChuKyUpload()
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            // Áp dụng Rate Limiting chống Spam: 60 requests / 5 minutes
            if (VuotGioiHan($"RateLimit_UploadSig_{maGiangVien}", 60, TimeSpan.FromMinutes(5)))
                return StatusCode(429, new { success = false, message = "Bạn đã vượt quá giới hạn lấy chữ ký. Vui lòng thử lại sau 5 phút." });

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
        public async Task<IActionResult> TaiLenPhuDe(IFormFile file)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            if (VuotGioiHan($"RateLimit_TaiLenPhuDe_{maGiangVien}", 30, TimeSpan.FromMinutes(5)))
                return StatusCode(429, new { success = false, message = "Bạn đã tải lên quá nhiều phụ đề. Vui lòng thử lại sau 5 phút." });

            var folder = $"subtitles/{maGiangVien}";
            var secureUrl = await _mediaService.TaiLenPhuDeAsync(file, folder);

            if (string.IsNullOrEmpty(secureUrl))
                return BadRequest(new { success = false, message = "Tải lên phụ đề thất bại." });

            return Ok(new { success = true, data = new { url = secureUrl } });
        }

        [HttpPost("tao-phu-de-ai/{maBaiHoc}")]
        [Authorize(Roles = "GiangVien,Admin")]
        public async Task<IActionResult> TaoPhuDeAI(int maBaiHoc)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            if (VuotGioiHan($"RateLimit_TaoPhuDeAI_{maGiangVien}", 10, TimeSpan.FromMinutes(10)))
                return StatusCode(429, new { success = false, message = "Bạn đã gửi quá nhiều yêu cầu AI. Vui lòng thử lại sau 10 phút." });

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
