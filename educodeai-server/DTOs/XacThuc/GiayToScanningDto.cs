using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;

namespace educodeai_server.DTOs.XacThuc
{
    public class GiayToScanningRequest
    {
        [Required]
        public IFormFile AnhMatTruoc { get; set; } = default!;

        [Required]
        public IFormFile AnhMatSau { get; set; } = default!;

        [Required]
        [RegularExpression(@"^(CCCD|Passport)$", ErrorMessage = "Loại giấy tờ phải là CCCD hoặc Passport")]
        public string LoaiGiayTo { get; set; } = "CCCD";

        [StringLength(255)]
        public string? NguyenQuan { get; set; }
    }

    public class GiayToScanningResponse
    {
        public bool ThanhCong { get; set; }
        public string? ThongBao { get; set; }
        public string? HoTen { get; set; }
        public string? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }
        public string? NgayCap { get; set; }
        public string? NoiCap { get; set; }
        public string? DiaChi { get; set; }
        public string? SoGiayTo { get; set; }
        public string? QuocTich { get; set; }
        public string? DanToc { get; set; }
        public string? TonGiao { get; set; }
        public string? NguyenQuan { get; set; }

        [JsonIgnore]
        public string ContractVersion { get; set; } = "identity-scan.v2";
        [JsonIgnore]
        public string Status { get; set; } = "Rejected";
        [JsonIgnore]
        public string AssuranceLevel { get; set; } = "None";
        [JsonIgnore]
        public string? FailureCode { get; set; }
        [JsonIgnore]
        public string PolicyVersion { get; set; } = "cccd-policy.v1";
    }
}
