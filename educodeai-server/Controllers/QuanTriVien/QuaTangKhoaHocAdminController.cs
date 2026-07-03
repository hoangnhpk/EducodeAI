using educodeai_server.DTOs.QuaTang;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.QuanTriVien
{
    [ApiController]
    [Route("api/quan-tri-vien/qua-tang-khoa-hoc")]
    [Authorize(Roles = "Admin")]
    public class QuaTangKhoaHocAdminController : ControllerBase
    {
        private readonly IQuaTangKhoaHocService _quaTangKhoaHocService;

        public QuaTangKhoaHocAdminController(IQuaTangKhoaHocService quaTangKhoaHocService)
        {
            _quaTangKhoaHocService = quaTangKhoaHocService;
        }

        [HttpPost("tang")]
        public async Task<IActionResult> TangKhoaHoc([FromBody] TangKhoaHocDTO yeuCau)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { thongBao = "Dữ liệu yêu cầu không hợp lệ." });
            }

            int maQuanTriVien = LayNguoiDungID.LayID(User);
            if (maQuanTriVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để thực hiện chức năng này." });
            }

            try
            {
                var ketQua = await _quaTangKhoaHocService.AdminTangHocVienAsync(maQuanTriVien, yeuCau);
                return Ok(ketQua);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }

        [HttpGet("lich-su")]
        public async Task<IActionResult> LayLichSu([FromQuery] string? tuKhoa = null)
        {
            var duLieu = await _quaTangKhoaHocService.LayLichSuQuaTangChoAdminAsync(tuKhoa);
            return Ok(duLieu);
        }

        [HttpGet("hoc-vien/{maNguoiNhan:int}/khoa-hoc-co-the-tang")]
        public async Task<IActionResult> LayKhoaHocCoTheTang(int maNguoiNhan)
        {
            var duLieu = await _quaTangKhoaHocService.LayKhoaHocCoTheTangChoHocVienAsync(maNguoiNhan);
            return Ok(duLieu);
        }
    }
}
