using educodeai_server.DTOs.BaiTapThucHanh;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.GiangVien
{
    [Route("api/lecturer/practice-exercises")]
    [ApiController]
    [Authorize(Roles = "GiangVien,Admin")]
    public class BaiTapThucHanhController : ControllerBase
    {
        private readonly IBaiTapThucHanhService _service;

        public BaiTapThucHanhController(IBaiTapThucHanhService service)
        {
            _service = service;
        }

        [HttpGet("cay-du-lieu")]
        public async Task<IActionResult> GetCayDuLieu()
        {
            try
            {
                int maGiangVien = LayNguoiDungID.LayID(User);
                var result = await _service.GetCayDuLieuAsync(maGiangVien);
                return Ok(new { success = true, message = "Lấy dữ liệu cây thành công", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message, errors = new List<object>() });
            }
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] TaoBaiTapThucHanhAiRequestDto request)
        {
            try
            {
                Console.WriteLine($"[DEBUG] Generate endpoint called. Request: {System.Text.Json.JsonSerializer.Serialize(request)}");
                int maGiangVien = LayNguoiDungID.LayID(User);
                Console.WriteLine($"[DEBUG] MaGiangVien: {maGiangVien}");
                var result = await _service.GeneratePracticeExerciseAsync(request, maGiangVien);
                return Ok(new { success = true, message = "Sinh bài tập thành công", data = result });
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine($"[ERROR] Unauthorized: {ex.Message}");
                return StatusCode(403, new { success = false, message = ex.Message, errors = new List<object>() });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Exception: {ex.Message}");
                return BadRequest(new { success = false, message = ex.Message, errors = new List<object>() });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BaiTapThucHanhPreviewDto dto, [FromQuery] int lessonId)
        {
            try
            {
                int maGiangVien = LayNguoiDungID.LayID(User);
                var result = await _service.CreatePracticeExerciseAsync(dto, lessonId, maGiangVien);
                return Ok(new { success = true, message = "Lưu bài tập thành công", data = result });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { success = false, message = ex.Message, errors = new List<object>() });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message, errors = new List<object>() });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                int maGiangVien = LayNguoiDungID.LayID(User);
                var result = await _service.GetDetailAsync(id, maGiangVien);
                if (result == null) return NotFound(new { success = false, message = "Không tìm thấy bài tập", errors = new List<object>() });
                return Ok(new { success = true, message = "Lấy chi tiết thành công", data = result });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { success = false, message = ex.Message, errors = new List<object>() });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message, errors = new List<object>() });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] BaiTapThucHanhPreviewDto dto)
        {
            try
            {
                int maGiangVien = LayNguoiDungID.LayID(User);
                await _service.UpdateAsync(id, dto, maGiangVien);
                return Ok(new { success = true, message = "Cập nhật thành công", data = new { } });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { success = false, message = ex.Message, errors = new List<object>() });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message, errors = new List<object>() });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                int maGiangVien = LayNguoiDungID.LayID(User);
                await _service.DeleteAsync(id, maGiangVien);
                return Ok(new { success = true, message = "Xóa bài tập thành công", data = new { } });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { success = false, message = ex.Message, errors = new List<object>() });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message, errors = new List<object>() });
            }
        }
    }
}
