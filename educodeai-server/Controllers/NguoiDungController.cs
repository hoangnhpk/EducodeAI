using Microsoft.AspNetCore.Mvc;
using educodeai_server.Services.Interface;
using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace educodeai_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NguoiDungController : ControllerBase
    {
        private readonly INguoiDungService _userService;

        public NguoiDungController(INguoiDungService userService)
        {
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await _userService.CheckLoginAsync(loginDto.UsernameOrEmail, loginDto.Password);
            if (user == null) return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu!" });

            var token = _userService.GenerateJwtToken(user);

            // Ghi đè Cookie vào Response
            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true, // Quan trọng: Ngăn chặn XSS tấn công lấy token
                Secure = true,   // Bắt buộc nếu SameSite = None
                SameSite = SameSiteMode.None, // Cho phép gửi cookie giữa các port khác nhau (3000 và 7284)
                Expires = DateTime.Now.AddDays(1)
            });

            return Ok(new { message = "Đăng nhập thành công", user = new { user.Email, user.TaiKhoan, user.HoTen } });
        }
        [HttpGet("check-email")]
        public async Task<IActionResult> CheckEmail([FromQuery] string email) // Thêm [FromQuery]
        {
            // Sử dụng service đã có thay vì _context để tránh lỗi compile
            var userExists = await _userService.IsEmailExistAsync(email);

            return Ok(new { exists = userExists });
        }
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] RegisterDto model)
        {
            // 1. Kiểm tra email/tài khoản đã tồn tại chưa
            // (Bạn nên viết thêm hàm CheckExist trong Repository)

            // 2. Tạo mã OTP ngẫu nhiên 6 số
            string otp = new Random().Next(100000, 999999).ToString();

            // 3. Gửi Email
            string subject = "Mã xác thực đăng ký EduCodeAI";
            string body = $@"
        <div style='font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;'>
            <h2 style='color: #fb873f;'>Xác thực đăng ký tài khoản</h2>
            <p>Chào bạn <b>{model.HoTen}</b>,</p>
            <p>Mã OTP của bạn là: <h1 style='color: blue;'>{otp}</h1></p>
            <p>Mã này có hiệu lực trong 5 phút.</p>
        </div>";

            bool isSent = await EmailHelper.SendEmailAsync(model.Email, subject, body);

            if (isSent)
            {
                // Trả về OTP (Mã hóa hoặc hash nếu muốn bảo mật hơn) để Frontend giữ và so sánh
                return Ok(new { message = "Mã OTP đã được gửi", tempOtp = otp });
            }

            return BadRequest("Không thể gửi email xác thực.");
        }

        [HttpGet("test-hash")]
        public IActionResult TestHash()
        {
            var hash = BCrypt.Net.BCrypt.HashPassword("123456", 11);
            return Ok(hash);
        }


        [HttpPost("confirm-register")]
        public async Task<IActionResult> ConfirmRegister([FromBody] RegisterDto model)
        {
            var result = await _userService.RegisterAsync(model); // Gọi hàm đã viết ở bước 1

            if (result)
            {
                return Ok(new { message = "Đăng ký tài khoản thành công!" });
            }
            return BadRequest(new { message = "Không thể lưu thông tin vào cơ sở dữ liệu." });
        }
        [HttpPost("forgot-password-send-otp")]
        public async Task<IActionResult> ForgotPasswordSendOtp([FromBody] ForgotPasswordDto model)
        {
            // Thay vì dùng _context, hãy gọi Service
            var userExists = await _userService.IsEmailExistAsync(model.Email);
            if (!userExists) return BadRequest("Email này không tồn tại trên hệ thống!");

            string otp = new Random().Next(100000, 999999).ToString();
            string subject = "Mã đặt lại mật khẩu EduCodeAI";
            string body = $"Mã xác thực để đặt lại mật khẩu của bạn là: <b>{otp}</b>.";

            bool isSent = await EmailHelper.SendEmailAsync(model.Email, subject, body);
            if (isSent) return Ok(new { tempOtp = otp });

            return BadRequest("Không thể gửi email.");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ForgotPasswordDto model)
        {
            // Gọi Service để xử lý cập nhật mật khẩu
            var result = await _userService.UpdatePasswordAsync(model.Email, model.NewPassword);

            if (result) return Ok(new { message = "Đặt lại mật khẩu thành công!" });
            return BadRequest("Lỗi hệ thống hoặc email không tồn tại.");
        }

        [Authorize]
        [HttpPost("doi-mat-khau")]
        public async Task<IActionResult> DoiMatKhau([FromBody] DoiMatKhauDTO dto)
        {
            try
            {
                int userId = int.Parse(User.FindFirst("id")!.Value);

                // DEBUG LOG
                Console.WriteLine("👤 [DOI_MAT_KHAU] UserId từ JWT = " + userId);
                Console.WriteLine("🔐 [DOI_MAT_KHAU] MatKhauCu = " + dto.MatKhauCu);
                Console.WriteLine("🔐 [DOI_MAT_KHAU] MatKhauMoi = " + dto.MatKhauMoi);


                await _userService.DoiMatKhauAsync(userId, dto);

                return Ok(new { message = "Đổi mật khẩu thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


    }
}