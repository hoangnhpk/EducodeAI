using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.HocVien
{
    [ApiController]
    [Route("api/hoc-vien")]
    public class HoSoHocVienController : ControllerBase
    {
        private readonly IHocVienService _hocVienService;

        public HoSoHocVienController(IHocVienService hocVienService)
        {
            _hocVienService = hocVienService;
        }

        [HttpGet("ho-so")]
        public IActionResult GetHoSoHocVien()
        {
            int maNguoiDung = 1; // tạm hard-code
            var result = _hocVienService.GetHoSoHocVien(maNguoiDung);
            return Ok(result);
        }

        // ✅ API UPDATE
        [HttpPut("ho-so")]
        public async Task<IActionResult> UpdateHoSoHocVien(
            [FromForm] UpdateHoSoHocVienDTO dto
        )
        {
            int maNguoiDung = 1; // tạm hard-code

            var result = await _hocVienService.UpdateHoSoHocVien(
                maNguoiDung,
                dto
            );

            return Ok(result);
        }

        [Authorize]
        [HttpPost("doi-mat-khau")]
        public async Task<IActionResult> DoiMatKhau(DoiMatKhauDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var user = await _context.NguoiDungs.FindAsync(int.Parse(userId!));
            if (user == null)
                return NotFound("Người dùng không tồn tại");

            // 1. Kiểm tra mật khẩu cũ
            if (!BCrypt.Net.BCrypt.Verify(dto.MatKhauCu, user.MatKhau))
                return BadRequest("Mật khẩu hiện tại không đúng");

            // 2. Kiểm tra xác nhận
            if (dto.MatKhauMoi != dto.XacNhanMatKhauMoi)
                return BadRequest("Xác nhận mật khẩu không khớp");

            // 3. Hash mật khẩu mới
            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.MatKhauMoi);

            await _context.SaveChangesAsync();

            return Ok("Đổi mật khẩu thành công");
        }

    }
}
