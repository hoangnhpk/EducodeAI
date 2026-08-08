using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.XacThuc
{
    public class DangNhapRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập tài khoản hoặc email.")]
        public string TaiKhoan { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu.")]
        public string MatKhau { get; set; }

        public string? CaptchaToken { get; set; }

        [Required(ErrorMessage = "Không nhận diện được thiết bị.")]
        public string MaThietBi { get; set; }

        public string? TenThietBi { get; set; }
    }
}