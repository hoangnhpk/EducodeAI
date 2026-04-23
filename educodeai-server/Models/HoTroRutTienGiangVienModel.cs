using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class HoTroRutTienGiangVienModel
    {
        [Key]
        public int MaHoTroRutTienGiangVien { get; set; }

        public int MaYeuCauRutTien { get; set; }

        [ForeignKey(nameof(MaYeuCauRutTien))]
        public virtual YeuCauRutTienGiangVienModel YeuCauRutTien { get; set; } = null!;

        public int MaGiangVien { get; set; }

        [ForeignKey(nameof(MaGiangVien))]
        public virtual NguoiDungModel GiangVien { get; set; } = null!;

        [StringLength(30)]
        public string TrangThaiHoTro { get; set; } = "SUPPORT_PENDING";

        [StringLength(200)]
        public string ThongTinLienLac { get; set; } = string.Empty;

        [StringLength(500)]
        public string? NoiDungGiangVien { get; set; }

        [StringLength(500)]
        public string? GhiChuAdmin { get; set; }

        public int? MaQuanTriVienXuLy { get; set; }

        [ForeignKey(nameof(MaQuanTriVienXuLy))]
        public virtual NguoiDungModel? QuanTriVienXuLy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? XuLyLuc { get; set; }
    }
}
