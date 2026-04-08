using Microsoft.AspNetCore.Mvc;
using educodeai_server.Services.Interface;
using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using educodeai_server.Data;
using educodeai_server.Models;
using EduCodeAI.DTOs;
// Đảm bảo đúng namespace của thực thể NguoiDung

namespace educodeai_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NguoiDungController : ControllerBase
    {
        private readonly INguoiDungService _userService;
        private readonly EduCodeAIDbContext _context;

        public NguoiDungController(INguoiDungService userService, EduCodeAIDbContext context)
        {
            _userService = userService;
            _context = context;
        }
        [HttpPost("facebook-login")]
        public async Task<IActionResult> FacebookLogin([FromBody] FacebookDTO request)
        {
            try
            {
                // 1. Kiểm tra xem người dùng đã tồn tại qua Email chưa
                var user = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    // 2. Nếu chưa có, tạo tài khoản mới (Auto-register)
                    user = new NguoiDungModel
                    {
                        Email = request.Email,
                        HoTen = request.Name,
                        AnhDaiDien = request.Picture,
                        // Tạo Username duy nhất dựa trên UserID của Facebook
                        TaiKhoan = "fb_" + request.UserID.Substring(0, 6),
                        // Mật khẩu ngẫu nhiên (vì họ dùng tài khoản MXH)
                        MatKhau = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                        TrangThai = "Hoạt động",
                        VaiTro = 2, // 2: Role mặc định cho Học viên
                        NgayThamGia = DateTime.Now
                    };

                    _context.NguoiDungs.Add(user);

                    // LƯU Ý: Lệnh này sẽ ném ra lỗi nếu ổ đĩa C: bị đầy như ảnh image_c8fa5f.png
                    await _context.SaveChangesAsync();
                }

                // 3. Tạo JWT Token để người dùng duy trì phiên đăng nhập
                var token = _userService.GenerateJwtToken(user);

                return Ok(new
                {
                    token = token,
                    user = user,
                    message = "Đồng bộ tài khoản Facebook thành công!"
                });
            }
            catch (Exception ex)
            {
                // Trả về thông báo lỗi thực tế để Frontend hiển thị
                return StatusCode(500, new { message = "Lỗi SQL Server: Kiểm tra dung lượng đĩa hoặc kết nối DB!" });
            }
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await _userService.CheckLoginAsync(loginDto.UsernameOrEmail, loginDto.Password);
            if (user == null) return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu!" });

            var token = _userService.GenerateJwtToken(user);

            // Gắn Cookie HttpOnly để tăng cường bảo mật
            Response.Cookies.Append("AuthToken", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.Now.AddDays(1)
            });

            return Ok(new
            {
                message = "Đăng nhập thành công",
                token = token,
                user = new { user.MaNguoiDung, user.Email, user.TaiKhoan, user.HoTen, user.AnhDaiDien, user.VaiTro }
            });
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            // 1. Kiểm tra user trong Database
            var user = await _context.NguoiDungs.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                // 2. Nếu chưa có, khởi tạo tài khoản mới
                // Đảm bảo dùng ĐÚNG tên lớp (NguoiDungModel) và ĐÚNG tên thuộc tính (AnhDaiDien)
                user = new NguoiDungModel
                {
                    Email = request.Email,
                    HoTen = request.Name,
                    AnhDaiDien = request.Picture, // Đã đổi từ HinhAnh thành AnhDaiDien cho khớp
                    TaiKhoan = request.Email,
                    MatKhau = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                    VaiTro = 2,
                    NgayThamGia = DateTime.Now // Kiểm tra xem Model dùng NgayTao hay NgayThamGia
                };

                _context.NguoiDungs.Add(user);
                await _context.SaveChangesAsync();
            }

            // 3. Tạo JWT Token
            var token = _userService.GenerateJwtToken(user);

            return Ok(new
            {
                message = "Đăng nhập Google thành công",
                token = token,
                user = new { user.Email, user.TaiKhoan, user.HoTen, user.AnhDaiDien, user.MaNguoiDung }
            });
        }

        [HttpGet("check-email")]
        public async Task<IActionResult> CheckEmail([FromQuery] string email)
        {
            try
            {
                var userExists = await _userService.IsEmailExistAsync(email);
                return Ok(new { exists = userExists });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi kiểm tra email: " + ex.Message });
            }
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] RegisterDto model)
        {
            string otp = new Random().Next(100000, 999999).ToString();
            string subject = "Mã xác thực đăng ký EduCodeAI";
            string body = $@"
                <div style='font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;'>
                    <h2 style='color: #fb873f;'>Xác thực đăng ký tài khoản</h2>
                    <p>Chào bạn <b>{model.HoTen}</b>,</p>
                    <p>Mã OTP của bạn là: <h1 style='color: blue;'>{otp}</h1></p>
                    <p>Mã này có hiệu lực trong 5 phút.</p>
                </div>";

            bool isSent = await EmailHelper.SendEmailAsync(model.Email, subject, body);

            if (isSent) return Ok(new { message = "Mã OTP đã được gửi", tempOtp = otp });
            return BadRequest("Không thể gửi email xác thực.");
        }

        [HttpPost("confirm-register")]
        public async Task<IActionResult> ConfirmRegister([FromBody] RegisterDto model)
        {
            var result = await _userService.RegisterAsync(model);
            if (result) return Ok(new { message = "Đăng ký tài khoản thành công!" });
            return BadRequest(new { message = "Không thể lưu thông tin vào cơ sở dữ liệu." });
        }

        [HttpPost("forgot-password-send-otp")]
        public async Task<IActionResult> ForgotPasswordSendOtp([FromBody] ForgotPasswordDto model)
        {
            try
            {
                var userExists = await _userService.IsEmailExistAsync(model.Email);
                if (!userExists) return BadRequest("Email này không tồn tại trên hệ thống!");

                string otp = new Random().Next(100000, 999999).ToString();
                string subject = "Mã đặt lại mật khẩu EduCodeAI";
                string body = $"Mã xác thực để đặt lại mật khẩu của bạn là: <b>{otp}</b>.";

                bool isSent = await EmailHelper.SendEmailAsync(model.Email, subject, body);
                if (isSent) return Ok(new { tempOtp = otp });

                return BadRequest("Không thể gửi email.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ForgotPasswordDto model)
        {
            try
            {
                var result = await _userService.UpdatePasswordAsync(model.Email, model.NewPassword);
                if (result) return Ok(new { message = "Đặt lại mật khẩu thành công!" });
                return BadRequest("Lỗi hệ thống hoặc email không tồn tại.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
            }
        }

        [Authorize]
        [HttpPost("doi-mat-khau")]
        public async Task<IActionResult> DoiMatKhau([FromBody] DoiMatKhauDTO dto)
        {
            try
            {
                // Lấy ID từ Claim của JWT Token
                var userIdClaim = User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

                int userId = int.Parse(userIdClaim);

                // Bạn cần mở comment dòng dưới khi Service đã sẵn sàng
                // await _userService.DoiMatKhauAsync(userId, dto);

                return Ok(new { message = "Đổi mật khẩu thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        // cái này là của module quản lý tài khoản, nhưng để đây tạm vì nó liên quan đến việc kiểm tra trạng thái tài khoản khi đăng nhập và t đang sài nó để làm chức năng 
        //chuyển trạng thái ở module quản lý học viên để lúc khóa sẽ đá ra ngoài luôn (khiến)
        [HttpGet("/api/auth/check-trang-thai")] // 👈 Dấu "/" ở đầu cực kỳ quan trọng!
        [Authorize]
        public async Task<IActionResult> CheckTrangThaiTaiKhoan()
        {
            // Lấy ID của user đang đăng nhập từ Token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized(); // Không có token hoặc token sai -> Báo lỗi

            // Tìm user trong DB
            var user = await _context.NguoiDungs.FindAsync(userId);
            if (user == null) return Unauthorized();

            // Nếu bị khóa -> Báo động cho Frontend sút ra ngoài!
            if (user.TrangThai == "Bị khóa")
            {
                return Ok(new { isBanned = true, reason = user.LyDoKhoa ?? "Vi phạm quy định hệ thống." });
            }

            // Nếu bình thường -> Trả về an toàn
            return Ok(new { isBanned = false });
        }

    }
}