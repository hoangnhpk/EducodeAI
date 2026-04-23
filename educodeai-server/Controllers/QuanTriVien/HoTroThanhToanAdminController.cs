using educodeai_server.DTOs.ThanhToan;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.QuanTriVien
{
    [ApiController]
    [Route("api/quan-tri-vien/ho-tro-thanh-toan")]
    [Authorize(Roles = "Admin")]
    public class HoTroThanhToanAdminController : ControllerBase
    {
        private readonly IThanhToanKhoaHocService _thanhToanKhoaHocService;

        public HoTroThanhToanAdminController(IThanhToanKhoaHocService thanhToanKhoaHocService)
        {
            _thanhToanKhoaHocService = thanhToanKhoaHocService;
        }

        [HttpGet("danh-sach")]
        public async Task<IActionResult> LayDanhSach([FromQuery] string? trangThai = null, [FromQuery] string? tuKhoa = null)
        {
            var duLieu = await _thanhToanKhoaHocService.LayDanhSachYeuCauHoTroChoAdminAsync(trangThai, tuKhoa);
            return Ok(duLieu);
        }

        [HttpGet("{maGiaoDichHoTro:int}/chi-tiet")]
        public async Task<IActionResult> LayChiTiet(int maGiaoDichHoTro)
        {
            try
            {
                var duLieu = await _thanhToanKhoaHocService.LayChiTietYeuCauHoTroChoAdminAsync(maGiaoDichHoTro);
                return Ok(duLieu);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }

        [HttpPost("{maGiaoDichHoTro:int}/chap-thuan")]
        public async Task<IActionResult> ChapThuan(int maGiaoDichHoTro, [FromBody] XuLyYeuCauHoTroThanhToanDTO? yeuCau)
        {
            int maQuanTriVien = LayNguoiDungID.LayID(User);
            if (maQuanTriVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập tài khoản quản trị." });
            }

            try
            {
                var duLieu = await _thanhToanKhoaHocService.ChapThuanYeuCauHoTroAsync(
                    maGiaoDichHoTro,
                    maQuanTriVien,
                    yeuCau ?? new XuLyYeuCauHoTroThanhToanDTO());
                return Ok(duLieu);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }

        [HttpPost("{maGiaoDichHoTro:int}/tu-choi")]
        public async Task<IActionResult> TuChoi(int maGiaoDichHoTro, [FromBody] XuLyYeuCauHoTroThanhToanDTO? yeuCau)
        {
            int maQuanTriVien = LayNguoiDungID.LayID(User);
            if (maQuanTriVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập tài khoản quản trị." });
            }

            try
            {
                var duLieu = await _thanhToanKhoaHocService.TuChoiYeuCauHoTroAsync(
                    maGiaoDichHoTro,
                    maQuanTriVien,
                    yeuCau ?? new XuLyYeuCauHoTroThanhToanDTO());
                return Ok(duLieu);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }
    }
}
