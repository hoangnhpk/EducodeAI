using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    [Table("HoSoGiangVienTaiLieus")]
    public class HoSoGiangVienTaiLieuModel
    {
        [Key]
        public long MaTaiLieu { get; set; }

        public long MaHoSoDangKyGiangVien { get; set; }

        [ForeignKey(nameof(MaHoSoDangKyGiangVien))]
        public HoSoDangKyGiangVienModel HoSoDangKyGiangVien { get; set; } = null!;

        [Required, StringLength(20)]
        public string LoaiTaiLieu { get; set; } = string.Empty;

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

        public string? LyDoTuChoi { get; set; }

        public DateTime NgayTaiLen { get; set; } = DateTime.UtcNow;

        public DateTime? NgayDuyet { get; set; }

        public bool HienThiCongKhai { get; set; } = true;

        public Guid? ClientFileId { get; set; }

        [StringLength(200)]
        public string? TenChungChi { get; set; }

        [StringLength(200)]
        public string? DonViCap { get; set; }

        public DateOnly? NgayCapChungChi { get; set; }

        public DateOnly? NgayHetHanChungChi { get; set; }

        [StringLength(100)]
        public string? MaChungChi { get; set; }

        [StringLength(500)]
        public string? UrlXacMinh { get; set; }

        [StringLength(500)]
        public string? RelativePath { get; set; }
    }
}
