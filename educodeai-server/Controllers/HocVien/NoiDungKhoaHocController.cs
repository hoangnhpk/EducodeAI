using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.HocVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class NoiDungKhoaHocController : ControllerBase
    {
        private readonly IKhoaHocService _khoaHocService;

        public NoiDungKhoaHocController(IKhoaHocService khoaHocService)
        {
            _khoaHocService = khoaHocService;
        }

        [HttpGet("{maKhoaHoc}")]
        public async Task<IActionResult> GetNoiDungKhoaHoc(int maKhoaHoc)
        {
            try
            {
                var data = await _khoaHocService.GetKhoaHocByIdAsync(maKhoaHoc, 9);

                if (data == null)
                {
                    return NotFound(new { message = "Không tìm thấy nội dung khóa học này." });
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpPost("luu-tien-do")]
        public async Task<IActionResult> LuuTienDo([FromBody] TienDoBaiHocDTO dto)
        {
            try
            {
                var result = await _khoaHocService.LuuTienDoBaiHoc(dto);
                return Ok(new { thanhCong = result });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi hệ thống. Vui lòng thử lại sau."
                });
            }
        }

    }
}