﻿using educodeai_server.DTOs.XacThuc;
using educodeai_server.DTOs.NguoiDung;
using EduCodeAI.DTOs;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace educodeai_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class XacThucController : ControllerBase
    {
        private readonly IXacThucService _xacThucService;
        private readonly IGiayToScanningService _giayToScanningService;

        public XacThucController(IXacThucService xacThucService, IGiayToScanningService giayToScanningService)
        {
            _xacThucService = xacThucService;
            _giayToScanningService = giayToScanningService;
        }

        #region 1. API ĐĂNG NHẬP

        [HttpPost("dang-nhap")]
        public async Task<IActionResult> DangNhap([FromBody] DangNhapRequest request)
        {
            try
            {
                string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";
                var result = await _xacThucService.DangNhapAsync(request, ipAddress);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request, [FromQuery] string maThietBi, [FromQuery] string tenThietBi)
        {
            try
            {
                var result = await _xacThucService.DangNhapGoogleAsync(request, maThietBi, tenThietBi);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("facebook-login")]
        public async Task<IActionResult> FacebookLogin([FromBody] FacebookDTO request, [FromQuery] string maThietBi, [FromQuery] string tenThietBi)
        {
            try
            {
                var result = await _xacThucService.DangNhapFacebookAsync(request, maThietBi, tenThietBi);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromQuery] string refreshToken, [FromQuery] string maThietBi)
        {
            try
            {
                var result = await _xacThucService.LamMoiTokenAsync(refreshToken, maThietBi);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("xac-nhan-otp")]
        public async Task<IActionResult> XacNhanOtpVaDangNhap([FromBody] XacNhanOtpRequest request)
        {
            try
            {
                var result = await _xacThucService.XacNhanOtpVaDangNhapAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("xac-nhan-thay-the-thiet-bi")]
        public async Task<IActionResult> XacNhanThayTheThietBi([FromBody] XacNhanOtpRequest request)
        {
            try
            {
                var result = await _xacThucService.XacNhanThayTheThietBiAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #endregion

        #region 2. API ĐĂNG KÝ (Bảo vệ bằng Bộ nhớ tạm RAM)

        /// <summary>
        /// Nhận thông tin đăng ký, kiểm tra email và gửi mã OTP (Không lưu DB)
        /// </summary>
        [HttpPost("dang-ky")]
        public async Task<IActionResult> YeuCauDangKy([FromBody] DangKyRequest request)
        {
            try
            {
                string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";
                await _xacThucService.YeuCauDangKyAsync(request, ipAddress);
                return Ok(new { message = "Hệ thống đã gửi mã OTP. Vui lòng kiểm tra Email (mã có hiệu lực trong 5 phút)." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Xác thực mã OTP, nếu đúng mới chính thức lưu tài khoản vào DB
        /// </summary>
        [HttpPost("xac-minh-dang-ky")]
        public async Task<IActionResult> XacMinhDangKy([FromBody] XacNhanOtpRequest request)
        {
            try
            {
                var result = await _xacThucService.XacNhanDangKyVaLuuDbAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("giang-vien/gui-otp-email")]
        public async Task<IActionResult> GuiOtpEmailGiangVien([FromBody] EmailOtpGiangVienRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(new { message = "Email không hợp lệ." });
            try
            {
                var sent = await _xacThucService.GuiOtpEmailGiangVienAsync(request.Email);
                if (!sent) return BadRequest(new { message = "Không gửi được OTP email. Kiểm tra cấu hình SMTP/Gmail." });
                return Ok(new { message = "Đã gửi OTP email. Mã có hiệu lực trong 5 phút." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("giang-vien/xac-minh-otp-email")]
        public async Task<IActionResult> XacMinhOtpEmailGiangVien([FromBody] EmailOtpGiangVienRequest request)
        {
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(request.OtpCode)) return BadRequest(new { message = "OTP không hợp lệ." });
            try
            {
                await _xacThucService.XacMinhOtpEmailGiangVienAsync(request.Email, request.OtpCode);
                return Ok(new { message = "Email đã được xác minh." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("dang-ky-giang-vien")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> DangKyGiangVien([FromForm] DangKyGiangVienRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)));
                Console.WriteLine($"[MODELSTATE ERRORS]: {errors}");
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors });
            }

            try
            {
                var result = await _xacThucService.DangKyGiangVienAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                var errorMsg = $"Lỗi: {ex.Message}";
                Console.WriteLine($"[ERROR] {errorMsg}");
                Console.WriteLine($"[STACK] {ex.StackTrace}");
                return BadRequest(new { message = ex.Message });
            }
        }

        #endregion
        /// <summary>Giảng viên tra cứu trạng thái hồ sơ đăng ký theo email (public).</summary>
        [HttpGet("trang-thai-ho-so")]
        public async Task<IActionResult> TraCuuTrangThaiHoSo([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return BadRequest(new { message = "Vui lòng nhập email." });
            try
            {
                var result = await _xacThucService.TraCuuTrangThaiHoSoAsync(email);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>Giảng viên kiểm tra quyền bổ sung hồ sơ (public, xác thực bằng token từ email).</summary>
        [HttpGet("kiem-tra-quyen-bo-sung/{maHoSo}")]
        public async Task<IActionResult> KiemTraQuyenBoSungHoSo(long maHoSo, [FromQuery] string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest(new { message = "Thiếu mã xác thực bổ sung." });
            try
            {
                var result = await _xacThucService.KiemTraQuyenBoSungHoSoAsync(maHoSo, token);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>Giảng viên nộp lại hồ sơ bổ sung (public, xác thực bằng token từ email).</summary>
        [HttpPut("bo-sung-ho-so/{maHoSo}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> BoSungHoSo(long maHoSo, [FromForm] BoSungHoSoRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)));
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors });
            }
            try
            {
                var result = await _xacThucService.BoSungHoSoAsync(maHoSo, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        #region 3. API QUẢN LÝ THIẾT BỊ (Yêu cầu phải có Token)

        [Authorize]
        [HttpGet("danh-sach-thiet-bi")]
        public async Task<IActionResult> LayDanhSachThietBi([FromQuery] string maThietBiHienTai)
        {
            try
            {
                int userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
                var result = await _xacThucService.LayDanhSachThietBiAsync(userId, maThietBiHienTai);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #region 4. API QUÊN MẬT KHẨU

        [HttpPost("quen-mat-khau")]
        public async Task<IActionResult> QuenMatKhau([FromBody] QuenMatKhauRequest request)
        {
            try
            {
                string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";
                var result = await _xacThucService.YeuCauQuenMatKhauAsync(request, ipAddress);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("dat-lai-mat-khau")]
        public async Task<IActionResult> DatLaiMatKhau([FromBody] DatLaiMatKhauRequest request)
        {
            try
            {
                var result = await _xacThucService.DatLaiMatKhauAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #endregion

        [Authorize]
        [HttpPost("dang-xuat")]
        public async Task<IActionResult> DangXuat([FromBody] string maThietBi)
        {
            try
            {
                int userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
                await _xacThucService.DangXuatAsync(userId, maThietBi);
                return Ok(new { message = "Đăng xuất thiết bị thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("yeu-cau-otp-dang-xuat-tu-xa")]
        public async Task<IActionResult> YeuCauOtpDangXuatTuXa()
        {
            try
            {
                int userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
                await _xacThucService.YeuCauOtpDangXuatTuXaAsync(userId);
                return Ok(new { message = "Mã OTP xác nhận đăng xuất từ xa đã được gửi đến email của bạn." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("xac-nhan-dang-xuat-tu-xa")]
        public async Task<IActionResult> XacNhanDangXuatTuXa([FromBody] DangXuatTuXaRequest request)
        {
            try
            {
                int userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
                await _xacThucService.XacNhanDangXuatTuXaAsync(userId, request);
                return Ok(new { message = "Đã đăng xuất các thiết bị thành công." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #endregion
        #region 5. API ĐỔI MẬT KHẨU

        [Authorize]
        [HttpPost("doi-mat-khau")]
        public async Task<IActionResult> DoiMatKhau([FromBody] DoiMatKhauRequest request)
        {
            try
            {
                int userId = int.Parse(User.FindFirst("id")?.Value ?? "0");
                await _xacThucService.DoiMatKhauAsync(userId, request);
                return Ok(new { message = "Đổi mật khẩu thành công!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #endregion
        #region 6. API QUÉT CCCD/GIẤY TỜ

        [HttpPost("quet-giay-to")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> QuetGiayTo([FromForm] GiayToScanningRequest request, [FromServices] educodeai_server.Data.EduCodeAIDbContext dbContext)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)));
                return BadRequest(new { thanhCong = false, thongBao = "Dữ liệu không hợp lệ", errors });
            }

            try
            {
                var result = await _giayToScanningService.QuetGiayToAsync(request);
                if (!result.ThanhCong)
                    return BadRequest(result);

                // Kiểm tra xem số giấy tờ này đã được sử dụng chưa
                if (!string.IsNullOrWhiteSpace(result.SoGiayTo))
                {
                    var so = result.SoGiayTo.Trim();
                    // Cùng một CCCD không được tạo nhiều hồ sơ
                    var daTonTai = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.AnyAsync(
                        dbContext.HoSoDangKyGiangViens,
                        x => x.SoGiayTo == so && x.TrangThaiHoSo != "TuChoi"
                    );
                    if (daTonTai)
                    {
                        return BadRequest(new { thanhCong = false, thongBao = "Số giấy tờ này đã được sử dụng để đăng ký tài khoản khác." });
                    }
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { thanhCong = false, thongBao = ex.Message });
            }
        }

        #endregion
    }
}



