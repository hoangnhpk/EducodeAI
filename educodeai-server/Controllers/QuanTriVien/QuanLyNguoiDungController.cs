using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using educodeai_server.DTOs.NguoiDung;
namespace educodeai_server.Controllers
{
    [Route("api/nguoi-dung")]
    [ApiController]
    public class QuanLyNguoiDungController : ControllerBase
    {
        private readonly IQuanLyNguoiDungService _service;

        public QuanLyNguoiDungController(IQuanLyNguoiDungService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> LayDanhSach()
        {
            var result = await _service.LayDanhSachNguoiDungAsync();
            return Ok(result);
        }
        [HttpPost("them-nguoi-dung")]
        public async Task<IActionResult> ThemNguoiDung([FromBody] ThemNguoiDungDTO nguoiDung)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _service.ThemNguoiDungAsync(nguoiDung);
            if (result)
            {
                return Ok(new { message = "Thêm người dùng thành công" });
            }
            return BadRequest("Lỗi khi thêm người dùng");
        }

        [HttpPut("sua-nguoi-dung/{id}")]
        public async Task<IActionResult> SuaNguoiDung(string id, [FromBody] CapNhatNguoiDungDTO nguoiDung)
        {
            var result = await _service.CapNhatNguoiDungAsync(id, nguoiDung);
            if (result)
            {
                return Ok(new { message = "Cập nhật thành công" });
            }
            return BadRequest("Cập nhật thất bại");
        }
        [HttpPut("khoa-nguoi-dung/{id}")]
        public async Task<IActionResult> KhoaNguoiDung(string id)
        {
            var result = await _service.KhoaNguoiDungAsync(id);
            if (result)
            {
                return Ok(new { message = "Cập nhật trạng thái thành công" });
            }
            return BadRequest("Không thể cập nhật trạng thái");
        }

        [HttpDelete("xoa-nguoi-dung/{id}")]
        public async Task<IActionResult> XoaNguoiDung(string id)
        {
            var result = await _service.XoaNguoiDungAsync(id);
            if (result)
            {
                return Ok(new { message = "Xóa người dùng thành công" });
            }
            return BadRequest("Không thể xoá người dùng");
        }
    }
}