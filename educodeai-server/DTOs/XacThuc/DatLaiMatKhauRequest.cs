using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace educodeai_server.DTOs.XacThuc
{
    public class DatLaiMatKhauRequest
    {
        public string Email { get; set; }
        
        [JsonPropertyName("NewPassword")]
        [JsonProperty("NewPassword")]
        public string? NewPassword { get; set; } // Khớp với Frontend trang Quên MK

        [JsonPropertyName("MatKhauMoi")]
        [JsonProperty("MatKhauMoi")]
        public string? MatKhauMoiField { get; set; } // Khớp với trang Đổi MK

        // Thuộc tính Helper để lấy giá trị mật khẩu mới dù gửi qua trường nào
        [System.Text.Json.Serialization.JsonIgnore]
        [Newtonsoft.Json.JsonIgnore]
        public string MatKhauMoi => NewPassword ?? MatKhauMoiField ?? "";

        [JsonPropertyName("ResetToken")]
        [JsonProperty("ResetToken")]
        public string ResetToken { get; set; } = string.Empty;

        public string? MaThietBi { get; set; }
        public string? TenThietBi { get; set; }
    }
}
