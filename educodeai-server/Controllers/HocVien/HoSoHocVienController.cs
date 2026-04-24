using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.HocVien
{
    [ApiController]
    [Route("api/hoc-vien")]
    [Authorize(Roles = "HocVien,GiangVien")]
    public class HoSoHocVienController : ControllerBase
    {
        private readonly IHocVienService _hocVienService;

        public HoSoHocVienController(IHocVienService hocVienService)
        {
            _hocVienService = hocVienService;
        }

        // ================== GET PROFILE ==================
        [HttpGet("ho-so")]
        public IActionResult GetHoSoHocVien()
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung == 0)
            {
                return Unauthorized(new { message = "Bạn cần đăng nhập để xem hồ sơ." });
            }

            var result = _hocVienService.GetHoSoHocVien(maNguoiDung);
            return Ok(result);
        }

        // ================== UPDATE PROFILE ==================
        [HttpPut("ho-so")]
        public async Task<IActionResult> UpdateHoSoHocVien(
            [FromForm] UpdateHoSoHocVienDTO dto
        )
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Dữ liệu hồ sơ không hợp lệ." });
            }

            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung == 0)
            {
                return Unauthorized(new { message = "Bạn cần đăng nhập để cập nhật hồ sơ." });
            }

            var result = await _hocVienService.UpdateHoSoHocVien(
                maNguoiDung,
                dto
            );

            return Ok(result);
        }
    }
}
