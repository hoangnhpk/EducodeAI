using System.Collections.Generic;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace educodeai_server.DTOs.XacThuc
{
    public class DangXuatTuXaRequest
    {
        // Gỡ bỏ Captcha hoàn toàn
        public string? CaptchaToken { get; set; }

        [JsonPropertyName("OtpCode")]
        [JsonProperty("OtpCode")]
        public string? OtpCode { get; set; }

        public bool DangXuatTatCa { get; set; } 

        public List<int>? DanhSachMaPhien { get; set; } 
    }
}
