using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace educodeai_server.DTOs.XacThuc
{
    public class XacNhanOtpRequest
    {
        [JsonPropertyName("taiKhoan")]
        [JsonProperty("taiKhoan")]
        [Required(ErrorMessage = "Vui lòng nhập tài khoản hoặc email.")]
        public string TaiKhoan { get; set; }

        [JsonPropertyName("otpCode")]
        [JsonProperty("otpCode")]
        [Required(ErrorMessage = "Vui lòng nhập mã OTP.")]
        public string OtpCode { get; set; }

        [JsonPropertyName("maThietBi")]
        [JsonProperty("maThietBi")]
        [Required(ErrorMessage = "Không nhận diện được thiết bị.")]
        public string MaThietBi { get; set; }

        [JsonPropertyName("tenThietBi")]
        [JsonProperty("tenThietBi")]
        public string? TenThietBi { get; set; }
    }
}