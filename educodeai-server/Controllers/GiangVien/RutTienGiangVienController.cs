using educodeai_server.DTOs.RutTienGiangVien;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace educodeai_server.Controllers.GiangVien
{
    [ApiController]
    [Route("api/giang-vien/rut-tien")]
    [Authorize(Roles = "GiangVien,Admin")]
    public class RutTienGiangVienController : ControllerBase
    {
        private readonly IRutTienGiangVienService _rutTienGiangVienService;

        public RutTienGiangVienController(IRutTienGiangVienService rutTienGiangVienService)
        {
            _rutTienGiangVienService = rutTienGiangVienService;
        }

        private bool IsAdmin => User.IsInRole("Admin");

        [HttpGet("danh-muc-ngan-hang")]
        public async Task<IActionResult> LayDanhMucNganHang()
        {
            var duLieu = await _rutTienGiangVienService.LayDanhMucNganHangAsync();
            return Ok(duLieu);
        }

        [HttpGet("vi")]
        public async Task<IActionResult> LayThongTinVi()
        {
            if (IsAdmin) return Ok(new ThongTinViGiangVienDTO());

            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để dùng chức năng này." });
            }

            var duLieu = await _rutTienGiangVienService.LayThongTinViAsync(maGiangVien);
            return Ok(duLieu);
        }

        [HttpPost("tai-khoan-nhan-tien")]
        public async Task<IActionResult> ThemTaiKhoanNhanTien([FromBody] CapNhatTaiKhoanRutTienDTO yeuCau)
        {
            if (IsAdmin) return BadRequest(new { thongBao = "Admin không thể thực hiện thao tác này." });
            if (!ModelState.IsValid)
            {
                return BadRequest(new { thongBao = "Dữ liệu không hợp lệ." });
            }

            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để dùng chức năng này." });
            }

            try
            {
                var duLieu = await _rutTienGiangVienService.ThemTaiKhoanNhanTienAsync(maGiangVien, yeuCau);
                return Ok(duLieu);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }

        [HttpDelete("tai-khoan-nhan-tien")]
        public async Task<IActionResult> XoaTaiKhoanNhanTien()
        {
            if (IsAdmin) return BadRequest(new { thongBao = "Admin không thể thực hiện thao tác này." });
            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để dùng chức năng này." });
            }

            try
            {
                var duLieu = await _rutTienGiangVienService.XoaTaiKhoanNhanTienAsync(maGiangVien);
                return Ok(duLieu);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }

        [HttpPost("yeu-cau")]
        public async Task<IActionResult> TaoYeuCauRutTien([FromBody] YeuCauRutTienDTO yeuCau)
        {
            if (IsAdmin) return BadRequest(new { thongBao = "Admin không thể thực hiện thao tác này." });
            if (!ModelState.IsValid)
            {
                return BadRequest(new { thongBao = "Dữ liệu không hợp lệ." });
            }

            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để dùng chức năng này." });
            }

            try
            {
                var duLieu = await _rutTienGiangVienService.TaoYeuCauRutTienAsync(maGiangVien, yeuCau);
                return Ok(duLieu);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }

        [HttpGet("lich-su")]
        public async Task<IActionResult> LayLichSuRutTien()
        {
            if (IsAdmin) return Ok(new List<object>());
            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để dùng chức năng này." });
            }

            var duLieu = await _rutTienGiangVienService.LayLichSuRutTienCuaGiangVienAsync(maGiangVien);
            return Ok(duLieu);
        }
    }
}
