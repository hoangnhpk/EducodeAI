using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class KhoaHocModel
    {
        [Key]
        public int MaKhoaHoc { get; set; }

        public int MaGiangVien { get; set; }

        [ForeignKey("MaGiangVien")]
        public virtual NguoiDungModel GiangVien { get; set; } = null!;

        [Required]
        [StringLength(200)]
        public string TenKhoaHoc { get; set; } = null!;

        public string? MoTa { get; set; }

        [StringLength(500)]
        public string? HinhAnh { get; set; }

        [StringLength(50)]
        public string? TrangThai { get; set; } = "Hoạt động";

        public double DiemDanhGiaTB { get; set; } = 0;

        // ====== CỘT MỚI ======

        [StringLength(100)]
        public string LinhVuc { get; set; } = null!;  // Ví dụ: BackEnd, Database, System Design...

        [StringLength(50)]
        public string TrinhDo { get; set; } = null!;  // Người mới, Trung cấp, Nâng cao

        public int ThoiLuongGio { get; set; }  // Tổng số giờ học

        [StringLength(500)]
        public string KyNangChinh { get; set; } = null!;  // Ví dụ: ["C#","SQL","REACT"]

        [Range(10000, 15000)]
        [Column(TypeName = "numeric(18,2)")]
        public decimal GiaKhoaHoc { get; set; } = 10000;

        [StringLength(10)]
        public string DonViTienTe { get; set; } = "VND";

        public bool ChoPhepMua { get; set; } = true;

        public DateTime NgayTao { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual ICollection<ChuongHocModel> ChuongHocs { get; set; } = null!;
        public virtual ICollection<DangKyKhoaHocModel> DangKyKhoaHocs { get; set; } = null!;
        public virtual ICollection<DanhGiaModel> DanhGias { get; set; } = null!;
        public virtual ICollection<ChiTietDonHangModel> ChiTietDonHangs { get; set; } = null!;
    }
}
