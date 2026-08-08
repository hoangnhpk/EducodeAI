using System.Security.Claims;
using educodeai_server.DTOs.AI;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.HocVien
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PhongVanAIController : ControllerBase
    {
        private readonly IPhongVanAIDocLapService _phongVanAIService;

        public PhongVanAIController(IPhongVanAIDocLapService phongVanAIService)
        {
            _phongVanAIService = phongVanAIService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) throw new UnauthorizedAccessException("Không tìm thấy thông tin người dùng.");
            return int.Parse(userIdClaim.Value);
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartInterview([FromBody] StartPhongVanRequestDto request)
        {
            try
            {
                var response = await _phongVanAIService.StartInterviewAsync(GetUserId(), request);
                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("answer")]
        public async Task<IActionResult> AnswerQuestion([FromBody] AnswerPhongVanRequestDto request)
        {
            try
            {
                var response = await _phongVanAIService.AnswerQuestionAsync(GetUserId(), request);
                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("end/{maPhongVan}")]
        public async Task<IActionResult> EndInterview(int maPhongVan)
        {
            try
            {
                var response = await _phongVanAIService.EndInterviewAsync(GetUserId(), maPhongVan);
                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            try
            {
                var response = await _phongVanAIService.GetInterviewHistoryAsync(GetUserId());
                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
