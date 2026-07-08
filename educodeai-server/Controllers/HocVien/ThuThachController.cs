using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.HocVien
{
    [Route("api/hoc-vien/thu-thach")]
    [ApiController]
    [Authorize]
    public class ThuThachController : ControllerBase
    {
        private readonly IThuThachService _service;

        public ThuThachController(IThuThachService service)
        {
            _service = service;
        }

        /// <summary>UC3.1 — Xem thử thách học tập trong tuần</summary>
        [HttpGet("tuan")]
        public async Task<IActionResult> LayThuThachTuan()
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung <= 0)
                return Unauthorized(new { success = false, message = "Chưa đăng nhập hoặc token không hợp lệ." });

            var data = await _service.LayThuThachTuanAsync(maNguoiDung);
            return Ok(new { success = true, data });
        }

        /// <summary>Nhận EXP khi hoàn thành nhiệm vụ</summary>
        [HttpPost("nhan-thuong/{maMau:int}")]
        public async Task<IActionResult> NhanThuong(int maMau)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung <= 0)
                return Unauthorized(new { success = false, message = "Chưa đăng nhập hoặc token không hợp lệ." });

            try
            {
                var data = await _service.NhanThuongAsync(maNguoiDung, maMau);
                return Ok(new { success = true, data, message = $"+Nhận {data.ExpNhanDuoc} EXP!" });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>Đeo danh hiệu đã mở khóa</summary>
        [HttpPut("danh-hieu/{maDanhHieu:int}")]
        public async Task<IActionResult> DeoDanhHieu(int maDanhHieu)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung <= 0)
                return Unauthorized(new { success = false, message = "Chưa đăng nhập hoặc token không hợp lệ." });

            try
            {
                var data = await _service.DeoDanhHieuAsync(maNguoiDung, maDanhHieu);
                return Ok(new { success = true, data, message = "Đã đổi danh hiệu." });
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>Bảng xếp hạng EXP tuần (reset cùng chu kỳ nhiệm vụ)</summary>
        [HttpGet("bang-xep-hang")]
        public async Task<IActionResult> LayBangXepHang([FromQuery] int top = 20)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung <= 0)
                return Unauthorized(new { success = false, message = "Chưa đăng nhập hoặc token không hợp lệ." });

            var data = await _service.LayBangXepHangTuanAsync(maNguoiDung, top);
            return Ok(new { success = true, data });
        }

        /// <summary>Bảng xếp hạng toàn hệ thống theo tổng EXP (top server, không reset)</summary>
        [HttpGet("bang-xep-hang/toan-web")]
        public async Task<IActionResult> LayBangXepHangToanWeb([FromQuery] int top = 50)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung <= 0)
                return Unauthorized(new { success = false, message = "Chưa đăng nhập hoặc token không hợp lệ." });

            var data = await _service.LayBangXepHangToanWebAsync(maNguoiDung, top);
            return Ok(new { success = true, data });
        }
    }
}
