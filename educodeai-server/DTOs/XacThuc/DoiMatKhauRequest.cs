using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace educodeai_server.DTOs.XacThuc
{
    public class DoiMatKhauRequest
    {
        [JsonPropertyName("MatKhauCu")]
        [JsonProperty("MatKhauCu")]
        public string? MatKhauCu { get; set; }

        [JsonPropertyName("MatKhauMoi")]
        [JsonProperty("MatKhauMoi")]
        public string? MatKhauMoi { get; set; }

        [JsonPropertyName("OtpCode")]
        [JsonProperty("OtpCode")]
        public string? OtpCode { get; set; }
    }
}
