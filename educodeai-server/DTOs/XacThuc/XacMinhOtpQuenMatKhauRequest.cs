using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.XacThuc
{
    public sealed class XacMinhOtpQuenMatKhauRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^[0-9]{6}$")]
        public string OtpCode { get; set; } = string.Empty;
    }
}
