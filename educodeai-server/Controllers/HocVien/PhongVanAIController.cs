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

        [HttpGet("{maPhongVan}")]
        public async Task<IActionResult> GetInterview(int maPhongVan)
        {
            try
            {
                var response = await _phongVanAIService.GetInterviewAsync(GetUserId(), maPhongVan);
                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{maPhongVan}/note")]
        public async Task<IActionResult> UpdateNote(int maPhongVan, [FromBody] UpdatePhongVanNoteDto request)
        {
            try
            {
                await _phongVanAIService.UpdateNoteAsync(GetUserId(), maPhongVan, request.GhiChu ?? string.Empty);
                return Ok(new { success = true });
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

        [HttpGet("migrate")]
        [AllowAnonymous]
        public async Task<IActionResult> MigrateDb([FromServices] educodeai_server.Data.EduCodeAIDbContext db)
        {
            try
            {
                await Microsoft.EntityFrameworkCore.RelationalDatabaseFacadeExtensions.MigrateAsync(db.Database);
                return Ok("Migrated successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.ToString());
            }
        }

        [HttpGet("tts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTTS([FromQuery] string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return BadRequest();
            try
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
                // Cắt độ dài phòng hờ Google chặn
                var safeText = text.Length > 200 ? text.Substring(0, 200) : text;
                var url = $"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q={Uri.EscapeDataString(safeText)}";
                
                var response = await client.GetAsync(url);
                if (!response.IsSuccessStatusCode) return BadRequest();
                
                var stream = await response.Content.ReadAsStreamAsync();
                return File(stream, "audio/mpeg");
            }
            catch
            {
                return BadRequest();
            }
        }
    }
}
