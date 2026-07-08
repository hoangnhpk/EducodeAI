using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    [Table("HoSoDangKyGiangViens")]
    public class HoSoDangKyGiangVienModel
    {
        [Key]
        public long MaHoSoDangKyGiangVien { get; set; }

        public int? MaNguoiDung { get; set; }

        [Required, StringLength(150)]
        public string HoTen { get; set; } = string.Empty;

        [Required, StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [StringLength(20)]
        public string? SoDienThoai { get; set; }

        [Required, StringLength(50)]
        public string TaiKhoan { get; set; } = string.Empty;

        [Required, StringLength(255)]
        public string MatKhau { get; set; } = string.Empty;

        [Required, StringLength(150)]
        public string LinhVucGiangDay { get; set; } = string.Empty;

        [Required]
        public string TieuSu { get; set; } = string.Empty;

        public string? LinkedInUrl { get; set; }

        public string? WebsiteUrl { get; set; }

        [Required, StringLength(20)]
        public string LoaiGiayTo { get; set; } = "CCCD";

        [Required, StringLength(50)]
        public string SoGiayTo { get; set; } = string.Empty;

        public string? AnhDaiDienUrl { get; set; }

        [Required]
        public string AnhGiayToMatTruocUrl { get; set; } = string.Empty;

        [Required]
        public string AnhGiayToMatSauUrl { get; set; } = string.Empty;

        [Required, StringLength(20)]
        public string PhuongThucThanhToan { get; set; } = "BANK";

        public string? TenNganHang { get; set; }

        public string? SoTaiKhoanNhanTien { get; set; }

        public string? TenChuTaiKhoan { get; set; }

        public string? MaSoThue { get; set; }

        [StringLength(20)]
        public string? LoaiDoiTuongThue { get; set; }

        [Required, StringLength(20)]
        public string TrangThaiHoSo { get; set; } = "ChoDuyet";

        public string? LyDoTuChoi { get; set; }

        public string? BoSungToken { get; set; }

        public DateTime? BoSungTokenHetHan { get; set; }

        public bool DaNopBoSung { get; set; } = false;

        public DateTime? NgayNopBoSung { get; set; }

        public int? MaQuanTriVienDuyet { get; set; }

        public DateTime NgayTao { get; set; } = DateTime.UtcNow;

        public DateTime NgayCapNhat { get; set; } = DateTime.UtcNow;

        public DateTime? NgayDuyet { get; set; }
    }
}