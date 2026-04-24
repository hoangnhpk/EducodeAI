using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class ChiTietDonHangModel
    {
        [Key]
        public int MaChiTiet { get; set; }

        public int MaDonHang { get; set; }

        [ForeignKey("MaDonHang")]
        public virtual DonHangKhoaHocModel DonHang { get; set; } = null!;

        public int MaKhoaHoc { get; set; }

        [ForeignKey("MaKhoaHoc")]
        public virtual KhoaHocModel KhoaHoc { get; set; } = null!;

        [Column(TypeName = "numeric(18,2)")]
        public decimal DonGia { get; set; }

        [Column(TypeName = "numeric(18,2)")]
        public decimal GiamGia { get; set; } = 0;

        [Column(TypeName = "numeric(18,2)")]
        public decimal ThanhTien { get; set; }
    }
}
