using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    [Table("YeuCauChungChiGiangViens")]
    public sealed class YeuCauChungChiGiangVienModel
    {
        [Key]
        public long MaYeuCauChungChi { get; set; }

        public int MaGiangVien { get; set; }

        [ForeignKey(nameof(MaGiangVien))]
        public NguoiDungModel GiangVien { get; set; } = null!;

        public Guid ClientRequestId { get; set; }

        public Guid MaDotGui { get; set; }

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

        [Required, StringLength(255)]
        public string TenFileGoc { get; set; } = string.Empty;

        [Required, StringLength(255)]
        public string StorageKey { get; set; } = string.Empty;

        [Required, StringLength(150)]
        public string ContentType { get; set; } = string.Empty;

        public long KichThuoc { get; set; }

        [Required, StringLength(64)]
        public string Sha256 { get; set; } = string.Empty;

        [Required, StringLength(20)]
        public string TrangThai { get; set; } = "ChoDuyet";

        [StringLength(1000)]
        public string? LyDoXuLy { get; set; }

        public bool HienThiCongKhai { get; set; }
        public long PhienBan { get; set; }
        public int? MaQuanTriVienDuyet { get; set; }
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public DateTime NgayCapNhat { get; set; } = DateTime.UtcNow;
        public DateTime? NgayDuyet { get; set; }
    }
}
