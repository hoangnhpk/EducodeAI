using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class YeuCauRutTienGiangVienModel
    {
        [Key]
        public int MaYeuCauRutTien { get; set; }

        public int MaGiangVien { get; set; }

        [ForeignKey(nameof(MaGiangVien))]
        public virtual NguoiDungModel GiangVien { get; set; } = null!;

        [Column(TypeName = "numeric(18,2)")]
        public decimal SoTienYeuCau { get; set; }

        [StringLength(30)]
        public string TrangThaiYeuCau { get; set; } = "CHO_DUYET";

        [StringLength(30)]
        public string LoaiTien { get; set; } = "VND";

        [StringLength(50)]
        public string MaNganHangNhan { get; set; } = string.Empty;

        [StringLength(50)]
        public string SoTaiKhoanNhan { get; set; } = string.Empty;

        [StringLength(255)]
        public string TenTaiKhoanNhan { get; set; } = string.Empty;

        [StringLength(120)]
        public string? NoiDungChuyenKhoan { get; set; }

        [StringLength(500)]
        public string? DuongDanAnhQr { get; set; }

        [Column(TypeName = "numeric(18,2)")]
        public decimal? SoTienDaChuyen { get; set; }

        public long? MaGiaoDichSePay { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? DuyetLuc { get; set; }

        public int? MaQuanTriVienDuyet { get; set; }

        [ForeignKey(nameof(MaQuanTriVienDuyet))]
        public virtual NguoiDungModel? QuanTriVienDuyet { get; set; }

        public DateTime? ChuyenKhoanThanhCongLuc { get; set; }

        /// <summary>Thời điểm đã gửi email thông báo rút tiền thành công (UTC). Dùng để tránh gửi trùng khi webhook/luồng khác lặp lại.</summary>
        public DateTime? GuiEmailRutTienThanhCongLuc { get; set; }

        [StringLength(500)]
        public string? GhiChuAdmin { get; set; }
    }
}
