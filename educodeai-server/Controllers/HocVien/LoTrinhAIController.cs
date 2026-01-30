using educodeai_server.DTOs.AI;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
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

            return Ok(await _service.TaoLoTrinhAsync(3, dto));
        }

        [HttpPut("cap-nhat")]
        public async Task<IActionResult> CapNhatLoTrinh(
        [FromBody] UpdateLoTrinhDto dto)
        {
            var result = await _service.CapNhatLoTrinhAsync(3, dto);
            return Ok(result);
        }

        [HttpPost("xac-nhan/{maLoTrinh}")]
        public async Task<IActionResult> XacNhanLoTrinh(int maLoTrinh)
        {
            var result = await _service.XacNhanLoTrinhAsync(maLoTrinh, 3);
            return Ok(new { success = result, message = "Lộ trình đã được áp dụng thành công!" });
        }

        [HttpGet("lay-tat-ca-lo-trinh")]
        public async Task<IActionResult> GetAllLoTrinhAI()
        {
            var result = await _service.GetLoTrinhCuaToiAsync(3);
            return Ok(result);
        }
    }
}