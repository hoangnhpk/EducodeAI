using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class DoanhThuGiangVienModel
    {
        [Key]
        public int MaDoanhThu { get; set; }

        public int MaGiangVien { get; set; }

        [ForeignKey("MaGiangVien")]
        public virtual NguoiDungModel GiangVien { get; set; } = null!;

        public int MaDonHang { get; set; }

        [ForeignKey("MaDonHang")]
        public virtual DonHangKhoaHocModel DonHang { get; set; } = null!;

        [Column(TypeName = "numeric(18,2)")]
        public decimal TongTienDonHang { get; set; }

        [Column(TypeName = "numeric(18,2)")]
        public decimal PhiNenTang { get; set; }

        [Column(TypeName = "numeric(18,2)")]
        public decimal ThucNhanGiangVien { get; set; }

        [StringLength(30)]
        public string TrangThaiDoiSoat { get; set; } = "PENDING";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
