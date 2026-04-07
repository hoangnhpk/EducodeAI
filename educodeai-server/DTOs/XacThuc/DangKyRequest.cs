using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.XacThuc
{
    public class DangKyRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập họ tên.")]
        public string HoTen { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập email.")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu.")]
        public string MatKhau { get; set; }

        [Required(ErrorMessage = "Thiếu mã xác minh Captcha.")]
        public string CaptchaToken { get; set; }
    }
}