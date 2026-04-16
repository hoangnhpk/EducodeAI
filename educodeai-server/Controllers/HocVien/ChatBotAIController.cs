using educodeai_server.DTOs.AI;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.HocVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatBotAIController : ControllerBase
    {
        private readonly IChatBotAIService _aiChatService;

        // Tiêm Service vào Controller qua Constructor
        public ChatBotAIController(IChatBotAIService aiChatService)
        {
            _aiChatService = aiChatService;
        }

        [HttpPost("tu-van-hoc-tap")]
        public async Task<IActionResult> TuVanHocTap([FromBody] YeuCauChatAIDTO yeuCau)
        {
            // 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào (Validation)
            if (yeuCau.LichSuChat == null || yeuCau.LichSuChat.Count == 0)
            {
                return BadRequest(new { message = "Lịch sử chat không được để trống." });
            }

            try
            {
                // 2. Giao việc cho Service xử lý
                string ketQua = await _aiChatService.TuVanHocTapAsync(yeuCau);

                // 3. Trả kết quả về cho React
                return Ok(new { cauTraLoi = ketQua });
            }
            catch (Exception ex)
            {
                // Bắt lỗi từ Service ném ra
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("tom-tat-video")]
        public async Task<IActionResult> TomTatVideo([FromBody] YeuCauTomTatVideoDTO yeuCau)
        {
            try
            {
                string ketQuaTomTat = await _aiChatService.TomTatVideoAsync(yeuCau);

                return Ok(new { ketQua = ketQuaTomTat });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi API TomTatVideo: {ex.Message}");
                return StatusCode(500, new { message = "Hệ thống AI đang bận, vui lòng thử lại sau." });
            }
        }
    }
}
