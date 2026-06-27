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

        [HttpGet("lay-chu-ky-upload")]
        [Authorize(Roles = "GiangVien,Admin")] 
        public async Task<IActionResult> LayChuKyUpload()
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            // Áp dụng Rate Limiting chống Spam: 60 requests / 5 minutes
            var cacheKey = $"RateLimit_UploadSig_{maGiangVien}";
            if (_cache.TryGetValue(cacheKey, out int count))
            {
                if (count >= 60) return StatusCode(429, new { success = false, message = "Bạn đã vượt quá giới hạn lấy chữ ký. Vui lòng thử lại sau 5 phút." });
                _cache.Set(cacheKey, count + 1, TimeSpan.FromMinutes(5));
            }
            else
            {
                _cache.Set(cacheKey, 1, TimeSpan.FromMinutes(5));
            }

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
        public IActionResult LayTokenPhatVideo([FromQuery] string publicId)
        {
            if (string.IsNullOrEmpty(publicId))
                return BadRequest(new { success = false, message = "Public ID là bắt buộc" });

            var token = _mediaService.LayTokenPhatVideo(publicId);
            return Ok(new { success = true, data = new { token } });
        }

        [HttpPost("tai-len-phu-de")]
        [Authorize(Roles = "GiangVien,Admin")]
        public async Task<IActionResult> TaiLenPhuDe(IFormFile file)
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            var cacheKey = $"RateLimit_TaiLenPhuDe_{maGiangVien}";
            if (_cache.TryGetValue(cacheKey, out int count))
            {
                if (count >= 30) return StatusCode(429, new { success = false, message = "Bạn đã tải lên quá nhiều phụ đề. Vui lòng thử lại sau 5 phút." });
                _cache.Set(cacheKey, count + 1, TimeSpan.FromMinutes(5));
            }
            else
            {
                _cache.Set(cacheKey, 1, TimeSpan.FromMinutes(5));
            }

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

            var cacheKey = $"RateLimit_TaoPhuDeAI_{maGiangVien}";
            if (_cache.TryGetValue(cacheKey, out int aiCount))
            {
                if (aiCount >= 10) return StatusCode(429, new { success = false, message = "Bạn đã gửi quá nhiều yêu cầu AI. Vui lòng thử lại sau 10 phút." });
                _cache.Set(cacheKey, aiCount + 1, TimeSpan.FromMinutes(10));
            }
            else
            {
                _cache.Set(cacheKey, 1, TimeSpan.FromMinutes(10));
            }

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
