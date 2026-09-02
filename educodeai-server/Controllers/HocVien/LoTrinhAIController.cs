using educodeai_server.DTOs.AI;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EduCodeAI.Controllers.HocVien
{
    [Authorize]
    [ApiController]
    [Route("api/lo-trinh-ai")]
    public class LoTrinhAIController : ControllerBase
    {
        private readonly ILoTrinhAIService _service;
        private readonly ILoTrinhAIQuotaService _quota;

        public LoTrinhAIController(ILoTrinhAIService service, ILoTrinhAIQuotaService quota)
        {
            _service = service;
            _quota = quota;
        }

        private int GetUserIdFromClaims()
        {
            var userIdClaim = LayNguoiDungID.LayID(User);
            if (userIdClaim > 0 )
            {
                return userIdClaim;
            }
            throw new UnauthorizedAccessException("User ID claim is missing or invalid.");
        }

        [HttpPost("them")]
        public async Task<IActionResult> TaoLoTrinh(CreateLoTrinhAIDto dto)
        {
            int userId = GetUserIdFromClaims();
            var quota = await _quota.TryConsumeAsync(userId, "generate");
            if (!quota.Allowed)
                return StatusCode(429, new { message = "Bạn đã hết lượt tạo lộ trình AI hôm nay.", remaining = 0, resetAt = quota.ResetAt });

            Response.Headers["X-AI-Quota-Remaining"] = Math.Max(0, quota.Limit - (int)quota.Used).ToString();
            return Ok(await _service.TaoLoTrinhAsync(userId, dto));
        }

        [HttpPut("cap-nhat")]
        public async Task<IActionResult> CapNhatLoTrinh(
        [FromBody] UpdateLoTrinhDto dto)
        {
            int userId = GetUserIdFromClaims();
            var quota = await _quota.TryConsumeAsync(userId, "edit");
            if (!quota.Allowed)
                return StatusCode(429, new { message = "Bạn đã hết lượt chỉnh sửa lộ trình AI hôm nay.", remaining = 0, resetAt = quota.ResetAt });

            Response.Headers["X-AI-Quota-Remaining"] = Math.Max(0, quota.Limit - (int)quota.Used).ToString();
            var result = await _service.CapNhatLoTrinhAsync(userId, dto);
            return Ok(result);
        }

        [HttpPost("xac-nhan")]
        public async Task<IActionResult> XacNhanLoTrinh([FromBody] SaveLoTrinhDto dto)
        {
            int userId = GetUserIdFromClaims();
            var result = await _service.XacNhanLoTrinhAsync(userId, dto);
            return Ok(new { success = result, message = "Lộ trình đã được lưu thành công!" });
        }

        [HttpGet("lay-tat-ca-lo-trinh")]
        public async Task<IActionResult> GetAllLoTrinhAI()
        {
            int userId = LayNguoiDungID.LayID(User);
            var result = await _service.GetLoTrinhCuaToiAsync(userId);
            return Ok(result);
        }
        

        [HttpGet("chi-tiet/{maLoTrinh}")]
        public async Task<IActionResult> GetChiTietLoTrinh(int maLoTrinh)
        {
            int userId = LayNguoiDungID.LayID(User);
            var result = await _service.GetChiTietLoTrinhAsync(maLoTrinh, userId);

            if (result == null)
            {
                return NotFound(new { message = "Không tìm thấy lộ trình hoặc lộ trình không thuộc về bạn." });
            }

            return Ok(result);
        }

    }
}
