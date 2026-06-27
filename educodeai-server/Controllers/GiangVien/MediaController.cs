using educodeai_server.DTOs.Media;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;
using educodeai_server.Helpers;

namespace educodeai_server.Controllers.GiangVien
{
    [Route("api/giang-vien/media")]
    [ApiController]
    public class MediaController : ControllerBase
    {
        private readonly IMediaService _mediaService;

        public MediaController(IMediaService mediaService)
        {
            _mediaService = mediaService;
        }

        private int GetMaGiangVien()
        {
            return LayNguoiDungID.LayID(User);
        }

        [HttpGet("lay-chu-ky-upload")]
        [Authorize(Roles = "Giảng viên,Giảng Viên")] 
        public async Task<IActionResult> LayChuKyUpload()
        {
            var maGiangVien = GetMaGiangVien();
            if (maGiangVien == 0) return Unauthorized();

            // TODO: Rate limiting và kiểm tra Quota

            var folder = $"courses/{maGiangVien}";
            var signatureData = await _mediaService.LayChuKyUploadVideoAsync(maGiangVien.ToString(), folder);

            return Ok(new { success = true, data = signatureData });
        }

        [HttpPost("luu-video")]
        [Authorize(Roles = "Giảng viên,Giảng Viên")]
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
        [Authorize]
        public IActionResult LayTokenPhatVideo([FromQuery] string publicId)
        {
            if (string.IsNullOrEmpty(publicId))
                return BadRequest(new { success = false, message = "Public ID là bắt buộc" });

            var token = _mediaService.LayTokenPhatVideo(publicId);
            return Ok(new { success = true, data = new { token } });
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
        public async Task<IActionResult> CloudinaryWebhook()
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
