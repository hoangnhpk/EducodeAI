using educodeai_server.DTOs.AI;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EduCodeAI.Controllers.HocVien
{
    [ApiController]
    [Route("api/lo-trinh-ai")]
    public class LoTrinhAIController : ControllerBase
    {
        private readonly ILoTrinhAIService _service;

        public LoTrinhAIController(ILoTrinhAIService service)
        {
            _service = service;
        }

        [HttpPost("them")]
        public async Task<IActionResult> TaoLoTrinh(CreateLoTrinhAIDto dto)
        {
            int userId = LayNguoiDungID.LayID(User);
            return Ok(await _service.TaoLoTrinhAsync(userId, dto));
        }

        [HttpPut("cap-nhat")]
        public async Task<IActionResult> CapNhatLoTrinh(
        [FromBody] UpdateLoTrinhDto dto)
        {
            int userId = LayNguoiDungID.LayID(User);
            var result = await _service.CapNhatLoTrinhAsync(userId, dto);
            return Ok(result);
        }

        [HttpPost("xac-nhan/{maLoTrinh}")]
        public async Task<IActionResult> XacNhanLoTrinh(int maLoTrinh)
        {
            int userId = LayNguoiDungID.LayID(User);
            var result = await _service.XacNhanLoTrinhAsync(maLoTrinh, userId);
            return Ok(new { success = result, message = "Lộ trình đã được áp dụng thành công!" });
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