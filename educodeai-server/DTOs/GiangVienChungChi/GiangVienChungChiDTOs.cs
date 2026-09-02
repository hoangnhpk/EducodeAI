using educodeai_server.DTOs.XacThuc;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.GiangVienChungChi
{
    public sealed class GuiYeuCauChungChiRequest
    {
        [Required, MinLength(1)]
        public List<ChungChiUploadRequest> Certificates { get; set; } = new();
    }

    public sealed class CapNhatHienThiChungChiRequest
    {
        public bool HienThiCongKhai { get; set; }
    }

    public sealed class BoSungDotChungChiRequest
    {
        [Required, MinLength(1)]
        public List<BoSungChungChiItemRequest> Certificates { get; set; } = new();
    }

    public sealed class BoSungChungChiItemRequest
    {
        [Range(1, long.MaxValue)]
        public long MaTaiLieu { get; set; }

        [Range(0, long.MaxValue)]
        public long PhienBan { get; set; }

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
    }

    public sealed class DotGuiChungChiGiangVienDTO
    {
        public Guid MaDotGui { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string? LyDoXuLy { get; set; }
        public DateTime NgayTaiLen { get; set; }
        public DateTime NgayCapNhat { get; set; }
        public DateTime? NgayDuyet { get; set; }
        public List<ChungChiGiangVienDTO> ChungChis { get; set; } = new();
    }

    public sealed class ChungChiGiangVienDTO
    {
        public long MaTaiLieu { get; set; }
        public Guid ClientRequestId { get; set; }
        public long PhienBan { get; set; }
        public string TenChungChi { get; set; } = string.Empty;
        public string? DonViCap { get; set; }
        public DateOnly? NgayCap { get; set; }
        public DateOnly? NgayHetHan { get; set; }
        public string? MaChungChi { get; set; }
        public string? MaChungChiChe { get; set; }
        public string? UrlXacMinh { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string? LyDoXuLy { get; set; }
        public bool HienThiCongKhai { get; set; }
        public DateTime NgayTaiLen { get; set; }
        public DateTime NgayCapNhat { get; set; }
        public DateTime? NgayDuyet { get; set; }
    }
}
