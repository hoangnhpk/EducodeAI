using educodeai_server.DTOs.AI;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace educodeai_server.Controllers.HocVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class SinhDoAnAIController : ControllerBase
    {
        private readonly ISinhDoAnAIService _sinhDoAnAIService;

        public SinhDoAnAIController(ISinhDoAnAIService sinhDoAnAIService)
        {
            _sinhDoAnAIService = sinhDoAnAIService;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateDoAn([FromBody] SinhDoAnRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var response = await _sinhDoAnAIService.GenerateDoAnAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi sinh đồ án", details = ex.Message });
            }
        }
    }
}
