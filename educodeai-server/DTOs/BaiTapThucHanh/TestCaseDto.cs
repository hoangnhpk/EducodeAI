using System.Text.Json.Serialization;

namespace educodeai_server.DTOs.BaiTapThucHanh
{
    public class TestCaseDto
    {
        [JsonPropertyName("id")]
        public string? MaTestCaseRef { get; set; }

        [JsonPropertyName("input")]
        public string InputDuLieu { get; set; } = string.Empty;

        [JsonPropertyName("output")]
        public string OutputMongDoi { get; set; } = string.Empty;

        [JsonPropertyName("isHidden")]
        public bool LaTestAn { get; set; }

        [JsonPropertyName("score")]
        public int Diem { get; set; }

        [JsonPropertyName("timeLimit")]
        public int? ThoiGianToiDa { get; set; }

        [JsonPropertyName("memoryLimit")]
        public int? BoNhoToiDa { get; set; }
    }
}
