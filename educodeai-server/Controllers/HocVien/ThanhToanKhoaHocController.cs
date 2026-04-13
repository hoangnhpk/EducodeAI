using educodeai_server.DTOs.ThanhToan;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.HocVien
{
    [ApiController]
    [Route("api/hocvien/thanh-toan-khoa-hoc")]
    [Route("api/hocvien/thanh_toan_khoa_hoc")]
    [Authorize]
    public class ThanhToanKhoaHocController : ControllerBase
    {
        private readonly IThanhToanKhoaHocService _thanhToanKhoaHocService;

        public ThanhToanKhoaHocController(IThanhToanKhoaHocService thanhToanKhoaHocService)
        {
            _thanhToanKhoaHocService = thanhToanKhoaHocService;
        }

        [HttpGet("{maKhoaHoc:int}")]
        public async Task<IActionResult> LayThongTinMuaKhoaHoc(int maKhoaHoc)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để thực hiện chức năng này." });
            }

            var duLieu = await _thanhToanKhoaHocService.LayThongTinMuaKhoaHocAsync(maKhoaHoc, maNguoiDung);
            if (duLieu == null)
            {
                return NotFound(new { thongBao = "Không tìm thấy khóa học." });
            }

            return Ok(duLieu);
        }

        [HttpPost("mua-ngay")]
        public async Task<IActionResult> MuaNgay([FromBody] YeuCauMuaKhoaHocDTO yeuCau)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { thongBao = "Dữ liệu yêu cầu không hợp lệ." });
            }

            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để thực hiện chức năng này." });
            }

            var ketQua = await _thanhToanKhoaHocService.MuaKhoaHocAsync(yeuCau, maNguoiDung);
            if (!ketQua.ThanhCong)
            {
                return BadRequest(ketQua);
            }

            return Ok(ketQua);
        }

        [HttpPost("tao-ma-qr")]
        [HttpPost("tao_ma_qr")]
        public async Task<IActionResult> TaoMaQr([FromBody] YeuCauTaoMaQRDTO yeuCau)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { thongBao = "Dữ liệu yêu cầu không hợp lệ." });
            }

            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để thực hiện chức năng này." });
            }

            try
            {
                var duLieuQr = await _thanhToanKhoaHocService.TaoMaQrThanhToanAsync(yeuCau, maNguoiDung);
                return Ok(duLieuQr);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }

        [HttpGet("kiem-tra-trang-thai/{maDonHang:int}")]
        [HttpGet("kiem_tra_trang_thai/{maDonHang:int}")]
        public async Task<IActionResult> KiemTraTrangThaiThanhToan(int maDonHang)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để thực hiện chức năng này." });
            }

            try
            {
                var trangThai = await _thanhToanKhoaHocService.KiemTraTrangThaiThanhToanAsync(maDonHang, maNguoiDung);
                return Ok(trangThai);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpPost("sepay/webhook")]
        public async Task<IActionResult> NhanThongBaoSePay([FromBody] ThongBaoWebhookSePayDTO duLieuWebhook)
        {
            try
            {
                bool ketQua = await _thanhToanKhoaHocService.XuLyThongBaoSePayAsync(duLieuWebhook);
                return Ok(new { thanhCong = ketQua });
            }
            catch (Exception ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }
    }
}
