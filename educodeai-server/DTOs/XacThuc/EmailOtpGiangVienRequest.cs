using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.XacThuc
{
    public class EmailOtpGiangVienRequest
    {
        [Required(ErrorMessage = "Vui l?ng nh?p email.")]
        [EmailAddress(ErrorMessage = "Email kh?ng h?p l?.")]
        public string Email { get; set; } = string.Empty;

        public string? OtpCode { get; set; }

        public string? CaptchaToken { get; set; }
    }
}
