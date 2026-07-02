using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.QuanTriVien
{
    [ApiController]
    [Route("api/quan-tri-vien/ma-qua-tang")]
    [Authorize(Roles = "Admin")]
    public class MaQuaTangAdminController : ControllerBase
    {
        private readonly IThanhToanKhoaHocService _thanhToanKhoaHocService;

        public MaQuaTangAdminController(IThanhToanKhoaHocService thanhToanKhoaHocService)
        {
            _thanhToanKhoaHocService = thanhToanKhoaHocService;
        }

        [HttpGet("danh-sach")]
        public async Task<IActionResult> LayDanhSach([FromQuery] string? trangThai = null, [FromQuery] string? tuKhoa = null)
        {
            var duLieu = await _thanhToanKhoaHocService.LayLichSuMaQuaTangChoAdminAsync(trangThai, tuKhoa);
            return Ok(duLieu);
        }
    }
}
