using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.XacThuc
{
    public class XacNhanOtpRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập tài khoản hoặc email.")]
        public string TaiKhoan { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mã OTP.")]
        public string OtpCode { get; set; }

        [Required(ErrorMessage = "Không nhận diện được thiết bị.")]
        public string MaThietBi { get; set; }

        public string? TenThietBi { get; set; }
    }
}