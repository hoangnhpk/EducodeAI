using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace educodeai_server.Controllers.HocVien
{
    [Authorize]
    [ApiController]
    [Route("api/hocvien/kham-pha-lo-trinh")] // Giữ nguyên Route cũ
    public class KhamPhaLoTrinhController : ControllerBase
    {
        private readonly IKhamPhaLoTrinhService _service;

        public KhamPhaLoTrinhController(IKhamPhaLoTrinhService service)
        {
            _service = service;
        }

        // 1. Lấy danh sách lộ trình (Phân trang + Tìm kiếm)
        [HttpGet("danh-sach")]
        public async Task<IActionResult> GetDanhSach([FromQuery] string? tuKhoa, [FromQuery] int page = 1, [FromQuery] int pageSize = 8)
        {
            try
            {
                var data = await _service.LayDanhSachAsync(tuKhoa ?? "", page, pageSize);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // 2. Lấy chi tiết lộ trình (Bóc tách JSON cho Modal)
        [HttpGet("chi-tiet/{id}")]
        public async Task<IActionResult> GetChiTiet(int id)
        {
            try
            {
                var data = await _service.LayChiTietLoTrinhAsync(id);
                if (data == null)
                    return NotFound(new { success = false, message = "Không tìm thấy lộ trình này sếp ơi!" });

                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // 3. Lưu lộ trình vào tài khoản học viên
        [HttpPost("luu/{id}")]
        public async Task<IActionResult> LuuLoTrinh(int id)
        {
            try
            {
                // Lấy ID người dùng từ Token đăng nhập
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int maHocVien))
                {
                    return Unauthorized(new { success = false, message = "Sếp chưa đăng nhập hoặc Token hết hạn rồi!" });
                }

                var result = await _service.LuuLoTrinhVaoTaiKhoanAsync(id, maHocVien);

                if (result)
                    return Ok(new { success = true, message = "Đã lưu lộ trình vào tài khoản của sếp thành công!" });

                return BadRequest(new { success = false, message = "Lưu thất bại, có thể lộ trình này sếp đã lưu rồi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}