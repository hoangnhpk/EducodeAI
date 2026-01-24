using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.GiangVien
{
    [ApiController]
    [Route("api/giang-vien/[controller]")]
    public class KhoaHocCuaToiController : ControllerBase
    {
        private readonly IKhoaHocCuaToiService _service;

        public KhoaHocCuaToiController(IKhoaHocCuaToiService service)
        {
            _service = service;
        }
        
        [HttpGet("danh-sach/{maGiangVien}")]
        public async Task<IActionResult> GetList(int maGiangVien)
        {
            try
            {
                var result = await _service.GetDanhSachKhoaHocGiangVienAsync(maGiangVien);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách khoá học: " + ex.Message });
            }
        }

        [HttpGet("chi-tiet/{id}")]
        public async Task<IActionResult> GetDetail(int id)
        {
            try
            {
                var result = await _service.GetChiTietKhoaHoc(id);
                if (result == null)
                {
                    return NotFound(new { message = "Không tìm thấy khóa học" });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy chi tiết khoá học: " + ex.Message });
            }
        }
    }
}