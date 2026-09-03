using educodeai_server.DTOs.ThanhToan;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Controllers.HocVien
{
    [ApiController]
    [Route("api/hocvien/thanh-toan-khoa-hoc")]
    [Route("api/hocvien/thanh_toan_khoa_hoc")]
    [Authorize]
    public class ThanhToanKhoaHocController : ControllerBase
    {
        private readonly IThanhToanKhoaHocService _thanhToanKhoaHocService;
        private readonly IWebHostEnvironment _moiTruong;
        private readonly ILogger<ThanhToanKhoaHocController> _logger;

        public ThanhToanKhoaHocController(
            IThanhToanKhoaHocService thanhToanKhoaHocService,
            IWebHostEnvironment moiTruong,
            ILogger<ThanhToanKhoaHocController> logger)
        {
            _thanhToanKhoaHocService = thanhToanKhoaHocService;
            _moiTruong = moiTruong;
            _logger = logger;
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
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "TaoMaQr: lỗi lưu CSDL (thường do trùng PK / sequence hoặc FK).");
                if (_moiTruong.IsDevelopment())
                {
                    return StatusCode(500, new
                    {
                        thongBao = "Lỗi lưu đơn hàng thanh toán.",
                        chiTiet = ex.InnerException?.Message ?? ex.Message
                    });
                }

                return StatusCode(500, new { thongBao = "Không tạo được mã thanh toán. Vui lòng thử lại sau." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "TaoMaQr: lỗi không xác định.");
                if (_moiTruong.IsDevelopment())
                {
                    return StatusCode(500, new
                    {
                        thongBao = ex.Message,
                        chiTiet = ex.InnerException?.Message
                    });
                }

                return StatusCode(500, new { thongBao = "Không tạo được mã thanh toán. Vui lòng thử lại sau." });
            }
        }

        [HttpPost("tao-ma-qua-tang")]
        public async Task<IActionResult> TaoMaQuaTang([FromBody] YeuCauTaoMaQuaTangDTO yeuCau)
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
                var duLieu = await _thanhToanKhoaHocService.TaoMaQuaTangAsync(yeuCau, maNguoiDung);
                return Ok(duLieu);
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

        [HttpGet("kiem-tra-trang-thai-ma-qua-tang/{maDonHang:int}")]
        public async Task<IActionResult> KiemTraTrangThaiMaQuaTang(int maDonHang)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để thực hiện chức năng này." });
            }

            try
            {
                var trangThai = await _thanhToanKhoaHocService.KiemTraTrangThaiMaQuaTangAsync(maDonHang, maNguoiDung);
                return Ok(trangThai);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }

        [HttpPost("nhap-ma-qua-tang")]
        public async Task<IActionResult> NhapMaQuaTang([FromBody] NhapMaQuaTangDTO yeuCau)
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
                var ketQua = await _thanhToanKhoaHocService.NhapMaQuaTangAsync(yeuCau, maNguoiDung);
                return Ok(ketQua);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }

        [HttpGet("lich-su-ma-qua-tang")]
        public async Task<IActionResult> LayLichSuMaQuaTang()
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để thực hiện chức năng này." });
            }

            var duLieu = await _thanhToanKhoaHocService.LayLichSuMaQuaTangAsync(maNguoiDung);
            return Ok(duLieu);
        }

        [HttpPost("{maDonHang:int}/yeu-cau-ho-tro")]
        [HttpPost("{maDonHang:int}/yeu_cau_ho_tro")]
        public async Task<IActionResult> TaoYeuCauHoTroThanhToan(int maDonHang, [FromBody] YeuCauHoTroThanhToanDTO yeuCau)
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
                var duLieu = await _thanhToanKhoaHocService.TaoYeuCauHoTroThanhToanAsync(maDonHang, maNguoiDung, yeuCau);
                return Ok(duLieu);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }

        /// <summary>Chỉ xử lý <b>tiền vào</b> (mua khóa học). Webhook <b>tiền ra</b> dùng <c>POST /api/sepay/webhook/rut-tien-giang-vien</c>.</summary>
        [AllowAnonymous]
        [XacThucWebhookSePay]
        [HttpPost("sepay/webhook")]
        public async Task<IActionResult> NhanThongBaoSePay([FromBody] ThongBaoWebhookSePayDTO duLieuWebhook)
        {
            try
            {
                bool ketQuaThanhToanKhoaHoc = await _thanhToanKhoaHocService.XuLyThongBaoSePayAsync(duLieuWebhook);
                return Ok(new { thanhCong = ketQuaThanhToanKhoaHoc });
            }
            catch (Exception ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }
    }
}
