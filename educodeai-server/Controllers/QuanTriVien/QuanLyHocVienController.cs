using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.QuanTriVien
{
    [Route("api/admin/hoc-vien")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class QuanLyHocVienController : ControllerBase
    {
        private readonly IQuanLyHocVienService _service;

        public QuanLyHocVienController(IQuanLyHocVienService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> LayDanhSach([FromQuery] HocVienFilterDTO filter)
        {
            var result = await _service.LayDanhSachHocVienAsync(filter);
            return Ok(new { success = true, data = result });
        }

        [HttpPost]
        public async Task<IActionResult> ThemHocVien([FromBody] ThemNguoiDungDTO dto)
        {
            var result = await _service.ThemHocVienAsync(dto);
            return result
                    ? Ok(new { message = "Thêm học viên thành công!" })
                    : BadRequest(new { message = "Email này đã tồn tại trong hệ thống!" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> SuaHocVien(int id, [FromBody] CapNhatNguoiDungDTO dto)
        {
            var result = await _service.SuaHocVienAsync(id, dto);
            return result ? Ok(new { message = "Cập nhật thành công!" }) : BadRequest(new { message = "Lỗi!" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> XoaHocVien(int id)
        {
            var result = await _service.XoaHocVienAsync(id);
            return result ? Ok(new { message = "Xóa thành công!" }) : BadRequest(new { message = "Lỗi!" });
        }
    }
}