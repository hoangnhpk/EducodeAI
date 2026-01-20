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
                var data = await _khoaHocService.GetKhoaHocByIdAsync(maKhoaHoc);

                if (data == null || data.Count == 0)
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
    }
}