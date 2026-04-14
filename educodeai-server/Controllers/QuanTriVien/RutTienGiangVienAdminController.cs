using educodeai_server.DTOs.RutTienGiangVien;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.QuanTriVien
{
    [ApiController]
    [Route("api/quan-tri-vien/rut-tien-giang-vien")]
    [Authorize(Roles = "Admin")]
    public class RutTienGiangVienAdminController : ControllerBase
    {
        private readonly IRutTienGiangVienService _rutTienGiangVienService;

        public RutTienGiangVienAdminController(IRutTienGiangVienService rutTienGiangVienService)
        {
            _rutTienGiangVienService = rutTienGiangVienService;
        }

        [HttpGet("danh-sach")]
        public async Task<IActionResult> LayDanhSach([FromQuery] string? trangThai = null)
        {
            var duLieu = await _rutTienGiangVienService.LayDanhSachChoDoiSoatAsync(trangThai);
            return Ok(duLieu);
        }

        [HttpPost("{maYeuCauRutTien:int}/duyet")]
        public async Task<IActionResult> DuyetYeuCau(int maYeuCauRutTien, [FromBody] DuyetYeuCauRutTienDTO? yeuCau)
        {
            int maQuanTriVien = LayNguoiDungID.LayID(User);
            if (maQuanTriVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập tài khoản quản trị." });
            }

            try
            {
                var duLieu = await _rutTienGiangVienService.DuyetYeuCauVaTaoQrAsync(maYeuCauRutTien, maQuanTriVien, yeuCau);
                return Ok(duLieu);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }

        [HttpPost("{maYeuCauRutTien:int}/tu-choi")]
        public async Task<IActionResult> TuChoiYeuCau(int maYeuCauRutTien, [FromBody] TuChoiYeuCauRutTienDTO yeuCau)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { thongBao = "Dữ liệu không hợp lệ." });
            }

            int maQuanTriVien = LayNguoiDungID.LayID(User);
            if (maQuanTriVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập tài khoản quản trị." });
            }

            try
            {
                var duLieu = await _rutTienGiangVienService.TuChoiYeuCauAsync(maYeuCauRutTien, maQuanTriVien, yeuCau);
                return Ok(duLieu);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }
    }
}
