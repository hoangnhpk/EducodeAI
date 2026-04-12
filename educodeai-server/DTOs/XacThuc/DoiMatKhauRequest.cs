using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace educodeai_server.DTOs.XacThuc
{
    public class DoiMatKhauRequest
    {
        [JsonPropertyName("OtpCode")]
        [JsonProperty("OtpCode")]
        public string? OtpCode { get; set; }

        [JsonPropertyName("NewPassword")]
        [JsonProperty("NewPassword")]
        public string? MatKhauMoi { get; set; }

        // Cho phép dùng cả trường MatKhauCu nếu cần, nhưng ưu tiên dùng OTP để đồng bộ
        public string? MatKhauCu { get; set; }
    }
}
