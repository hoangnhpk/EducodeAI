using educodeai_server.DTOs;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers
{
    [Route("api/giang-vien/lop-hoc")]
    [ApiController]
    public class QuanLyHocVienKhoaHocController : ControllerBase
    {
        private readonly IQuanLyHocVienKhoaHocService _service;

        //  tiêm Service
        public QuanLyHocVienKhoaHocController(IQuanLyHocVienKhoaHocService service)
        {
            _service = service;
        }

        [HttpGet("danh-sach-khoa/{maGiangVien}")]
        public async Task<IActionResult> LayDanhSachKhoaHoc(int maGiangVien)
        {
            var result = await _service.LayDanhSachKhoaHocAsync(maGiangVien);
            return Ok(new { success = true, data = result });
        }

        [HttpGet("danh-sach-hoc-vien/{maGiangVien}")]
        public async Task<IActionResult> LayDanhSachHocVien(int maGiangVien, [FromQuery] int? maKhoaHoc, [FromQuery] string? search)
        {
            var result = await _service.LayDanhSachHocVienAsync(maGiangVien, maKhoaHoc, search);
            return Ok(new { success = true, data = result });
        }

        [HttpGet("{maKhoaHoc}/hoc-vien/{maNguoiDung}/tien-do-chi-tiet")]
        public async Task<IActionResult> LayTienDoChiTiet(int maKhoaHoc, int maNguoiDung)
        {
            var result = await _service.LayTienDoChiTietAsync(maKhoaHoc, maNguoiDung);
            return Ok(new { success = true, data = result });
        }

        [HttpGet("hoc-vien/{maNguoiDung}/khoa-hoc/{maGiangVien}")]
        public async Task<IActionResult> LayCacKhoaHocCuaHocVien(int maNguoiDung, int maGiangVien)
        {
            var result = await _service.LayCacKhoaHocCuaHocVienAsync(maNguoiDung, maGiangVien);
            return Ok(new { success = true, data = result });
        }

        [HttpPost("gui-mail-hang-loat")]
        public async Task<IActionResult> GuiMailHangLoat([FromBody] GuiMailHangLoatDTO dto)
        {
            var maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0)
                return Unauthorized(new { success = false, message = "Bạn cần đăng nhập." });

            var result = await _service.GuiMailHangLoatAsync(maGiangVien, dto);
            if (!result.Success)
                return BadRequest(new { success = false, message = result.Message });

            return Accepted(new { success = true, message = result.Message, soLuongDaXepHang = result.SoLuongDaXepHang });
        }
    }
}