using System.Text.Json.Serialization;

namespace educodeai_server.DTOs.BaiTap
{
    // Dữ liệu GỬI đi
    public class JDoodleRequestDTO
    {
        public string clientId { get; set; } = string.Empty;
        public string clientSecret { get; set; } = string.Empty;
        public string script { get; set; } = string.Empty;
        public string language { get; set; } = string.Empty;
        public string versionIndex { get; set; } = "0";
        public string stdin { get; set; } = string.Empty;
    }

    // Dữ liệu NHẬN về
    public class JDoodleResponseDTO
    {
        public string output { get; set; } = string.Empty;
        public string error { get; set; } = string.Empty;
        public int statusCode { get; set; }
        public string memory { get; set; } = string.Empty;
        public string cpuTime { get; set; } = string.Empty;
    }
}
