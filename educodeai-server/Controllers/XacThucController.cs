using educodeai_server.DTOs.XacThuc;
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

        public XacThucController(IXacThucService xacThucService)
        {
            _xacThucService = xacThucService;
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

        #endregion

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
    }
}
