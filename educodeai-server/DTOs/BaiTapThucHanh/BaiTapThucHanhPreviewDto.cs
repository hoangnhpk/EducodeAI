using System.Text.Json.Serialization;

namespace educodeai_server.DTOs.BaiTapThucHanh
{
    public class BaiTapThucHanhPreviewDto
    {
        [JsonPropertyName("metadata")]
        public MetadataDto Metadata { get; set; } = new();

        [JsonPropertyName("problemContent")]
        public ProblemContentDto ProblemContent { get; set; } = new();

        [JsonPropertyName("hints")]
        public List<HintDto> GoiYs { get; set; } = new();

        [JsonPropertyName("solution")]
        public SolutionDto Solution { get; set; } = new();

        [JsonPropertyName("evaluation")]
        public EvaluationDto Evaluation { get; set; } = new();

        [JsonPropertyName("system")]
        public SystemMetadataDto System { get; set; } = new();
    }

    public class MetadataDto
    {
        [JsonPropertyName("title")]
        public string TieuDe { get; set; } = string.Empty;

        [JsonPropertyName("difficulty")]
        public string MucDo { get; set; } = string.Empty;

        [JsonPropertyName("language")]
        public string NgonNgu { get; set; } = string.Empty;
    }

    public class ProblemContentDto
    {
        [JsonPropertyName("description")]
        public string MoTaDeBai { get; set; } = string.Empty;
    }

    public class HintDto
    {
        [JsonPropertyName("title")]
        public string TieuDe { get; set; } = string.Empty;

        [JsonPropertyName("content")]
        public string NoiDung { get; set; } = string.Empty;

        [JsonPropertyName("level")]
        public int CapDo { get; set; }
    }

    public class SolutionDto
    {
        [JsonPropertyName("code")]
        public string LoiGiaiMau { get; set; } = string.Empty;

        [JsonPropertyName("explanation")]
        public string GiaiThich { get; set; } = string.Empty;
    }

    public class EvaluationDto
    {
        [JsonPropertyName("testCases")]
        public List<TestCaseDto> TestCases { get; set; } = new();
    }

    public class SystemMetadataDto
    {
        [JsonPropertyName("version")]
        public string Version { get; set; } = "1.0.0";

        [JsonPropertyName("generatedAt")]
        public DateTime GeneratedAt { get; set; }

        [JsonPropertyName("generatedBy")]
        public string GeneratedBy { get; set; } = "AI";

        [JsonPropertyName("validated")]
        public bool Validated { get; set; }
    }
}
