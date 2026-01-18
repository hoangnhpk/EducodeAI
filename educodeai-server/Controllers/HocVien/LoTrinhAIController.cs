using educodeai_server.DTOs.AI;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EduCodeAI.Controllers.HocVien
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoTrinhAIController : ControllerBase
    {
        private readonly ILoTrinhAIService _service;

        public LoTrinhAIController(ILoTrinhAIService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> TaoLoTrinh(CreateLoTrinhAIDto dto)
        {
            int maNguoiDung = int.Parse(
                User.FindFirst("UserId")!.Value);

            return Ok(await _service.TaoLoTrinhAsync(8, dto));
        }
    }
}