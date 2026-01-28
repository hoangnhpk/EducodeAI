using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Services.Implementation;
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
                var data = await _khoaHocService.GetKhoaHocByIdAsync(maKhoaHoc, 2);

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

        [HttpPost("luu-ghi-chu")]
        public async Task<IActionResult> LuuGhiChu([FromBody] GhiChuBaiHocDTO dto)
        {
            try
            {
                var result = await _khoaHocService.LuuGhiChuBaiHoc(dto);
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

        [HttpGet("lay-ds-ghi-chu/{maBaiHoc}/{maNguoiDung}")]
        public async Task<IActionResult> GetGhiChuBaiHoc(int maBaiHoc, int maNguoiDung)
        {
            try
            {
                var ghiChus = await _khoaHocService.GetGhiChuBaiHocAsync(maBaiHoc, maNguoiDung);
                return Ok(ghiChus);
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

        [HttpPost("BaiTap/luu-ket-qua-quiz")]
        public async Task<IActionResult> LuuKetQua([FromBody] KetQuaQuizSubmitDTO dto)
        {
            var ketQua = await _khoaHocService.LuuKetQuaBaiTap(dto);

            if (ketQua)
            {
                return Ok(new { success = true, message = "Nộp bài thành công" });
            }
            else
            {
                return BadRequest(new { success = false, message = "Lỗi khi lưu bài làm" });
            }
        }
    }
}