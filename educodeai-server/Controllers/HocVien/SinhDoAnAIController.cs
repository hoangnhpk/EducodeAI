using System;
using System.Security.Claims;
using System.Threading.Tasks;
using educodeai_server.DTOs.AI;
using educodeai_server.Services.Interface;
using educodeai_server.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.HocVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class SinhDoAnAIController : ControllerBase
    {
        private readonly ISinhDoAnAIService _sinhDoAnAIService;
        private readonly ILogger<SinhDoAnAIController> _logger;

        public SinhDoAnAIController(ISinhDoAnAIService sinhDoAnAIService, ILogger<SinhDoAnAIController> logger)
        {
            _sinhDoAnAIService = sinhDoAnAIService;
            _logger = logger;
        }

        // ============================================================
        // MỚI: Check trạng thái AI (Còn token / Có key không)
        // ============================================================
        [HttpGet("check-ai-status")]
        public async Task<IActionResult> CheckAIStatus([FromServices] IGeminiAIService gemini)
        {
            try
            {
                bool isAvailable = await gemini.IsAIAvailableAsync();
                return Ok(new { isAvailable });
            }
            catch (Exception ex)
            {
                // Mặc định trả về false nếu có lỗi (chưa cấu hình redis, v.v...)
                return Ok(new { isAvailable = false, error = ex.Message });
            }
        }

        // ============================================================
        // CŨ: Sinh đồ án (không cần login)
        // ============================================================
        [HttpPost("generate")]
        public async Task<IActionResult> GenerateDoAn([FromBody] SinhDoAnRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                int userId = _LayUserId();
                var response = await _sinhDoAnAIService.GenerateDoAnAsync(userId, request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi sinh đồ án", details = ex.Message });
            }
        }

        // ============================================================
        // MỚI: Nộp đồ án → Trả về sessionId + câu hỏi đầu tiên
        // ============================================================
        [Authorize]
        [HttpPost("nop-do-an")]
        public async Task<IActionResult> NopDoAn([FromBody] NopDoAnRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                int userId = _LayUserId();
                if (userId == 0) return Unauthorized(new { message = "Không xác định được người dùng." });

                var result = await _sinhDoAnAIService.NopDoAnAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi nộp đồ án");
                return StatusCode(500, new { message = "Lỗi khi nộp đồ án", details = ex.Message });
            }
        }

        // ============================================================
        // MỚI: Trả lời câu phỏng vấn (dùng sessionId)
        // ============================================================
        [Authorize]
        [HttpPost("tra-loi-phong-van")]
        public async Task<IActionResult> TraLoiPhongVan([FromBody] TraLoiPhongVanRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                int userId = _LayUserId();
                if (userId == 0) return Unauthorized(new { message = "Không xác định được người dùng." });

                var result = await _sinhDoAnAIService.TraLoiPhongVanAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi xử lý câu trả lời", details = ex.Message });
            }
        }

        // ============================================================
        // MỚI: Lấy kết quả tổng kết (dùng sessionId qua query param)
        // ============================================================
        [Authorize]
        [HttpGet("ket-qua")]
        public async Task<IActionResult> LayKetQua([FromQuery] string sessionId)
        {
            try
            {
                int userId = _LayUserId();
                if (userId == 0) return Unauthorized(new { message = "Không xác định được người dùng." });

                var result = await _sinhDoAnAIService.LayKetQuaPhongVanAsync(0, userId, sessionId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy kết quả", details = ex.Message });
            }
        }

        // ============================================================
        // MỚI: Chấm điểm từng tính năng theo giai đoạn
        // ============================================================
        [Authorize]
        [HttpPost("cham-diem-tinh-nang")]
        public async Task<IActionResult> ChamDiemTinhNang([FromBody] ChamDiemTinhNangRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                int userId = _LayUserId();
                if (userId == 0) return Unauthorized(new { message = "Không xác định được người dùng." });

                var result = await _sinhDoAnAIService.ChamDiemTinhNangAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi chấm điểm tính năng", details = ex.Message });
            }
        }

        // ============================================================
        // MỚI: Lấy danh sách chứng chỉ đồ án thực chiến
        // ============================================================
        [Authorize]
        [HttpGet("danh-sach-chung-chi")]
        public async Task<IActionResult> LayDanhSachChungChi()
        {
            try
            {
                int userId = _LayUserId();
                if (userId == 0) return Unauthorized(new { message = "Không xác định được người dùng." });

                var result = await _sinhDoAnAIService.LayDanhSachChungChiAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách chứng chỉ", details = ex.Message });
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
