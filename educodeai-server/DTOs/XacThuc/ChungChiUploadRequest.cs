using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace educodeai_server.DTOs.XacThuc
{
    public sealed class ChungChiUploadRequest
    {
        public Guid ClientId { get; set; }

        [Required]
        public IFormFile File { get; set; } = default!;

        [Required, StringLength(200)]
        public string TenChungChi { get; set; } = string.Empty;

        [StringLength(200)]
        public string? DonViCap { get; set; }

        public DateOnly? NgayCap { get; set; }

        public DateOnly? NgayHetHan { get; set; }

        [StringLength(100)]
        public string? MaChungChi { get; set; }

        [StringLength(500)]
        public string? UrlXacMinh { get; set; }

        [StringLength(500)]
        public string? RelativePath { get; set; }
    }
}
