using System;
using System.Security.Claims;
using System.Threading.Tasks;
using educodeai_server.DTOs.AI;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.HocVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChamDiemDoAnController : ControllerBase
    {
        private readonly IChamDiemDoAnService _chamDiemDoAnService;

        public ChamDiemDoAnController(IChamDiemDoAnService chamDiemDoAnService)
        {
            _chamDiemDoAnService = chamDiemDoAnService;
        }

        [Authorize]
        [HttpPost("nop-bai-zip")]
        public async Task<IActionResult> NopBaiZip([FromForm] NopDoAnZipRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                
                if (request.ZipFile == null || request.ZipFile.Length == 0)
                {
                    return BadRequest(new { message = "Không tìm thấy file zip." });
                }

                if (!request.ZipFile.FileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { message = "Vui lòng upload file định dạng .zip." });
                }

                if (request.ZipFile.Length > 20 * 1024 * 1024)
                {
                    return BadRequest(new { message = "File vượt quá dung lượng cho phép (20MB). Vui lòng upload file nhẹ hơn." });
                }

                int userId = _LayUserId();
                if (userId == 0) return Unauthorized(new { message = "Không xác định được người dùng." });

                var result = await _chamDiemDoAnService.ChamDiemDoAnZipAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi chấm điểm", details = ex.Message });
            }
        }

        private int _LayUserId()
        {
            var idClaim = User.FindFirst("id")?.Value
                       ?? User.FindFirst("MaNguoiDung")?.Value
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out int id) ? id : 0;
        }
    }
}
