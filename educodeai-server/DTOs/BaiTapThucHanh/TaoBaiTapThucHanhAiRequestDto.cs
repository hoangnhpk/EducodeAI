using System.Text.Json.Serialization;

namespace educodeai_server.DTOs.BaiTapThucHanh
{
    public class TaoBaiTapThucHanhAiRequestDto
    {
        [JsonPropertyName("lessonId")]
        public int MaBaiHoc { get; set; }

        [JsonPropertyName("difficulty")]
        public string? MucDo { get; set; }

        [JsonPropertyName("language")]
        public string? NgonNgu { get; set; }

        [JsonPropertyName("topicTags")]
        public List<string>? TheTag { get; set; }

        [JsonPropertyName("estimatedTime")]
        public int? ThoiGianDuKien { get; set; }

        [JsonPropertyName("customInstructions")]
        public string? HuongDanBoSung { get; set; }
    }
}
