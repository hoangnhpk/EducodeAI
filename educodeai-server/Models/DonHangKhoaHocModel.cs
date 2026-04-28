using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class DonHangKhoaHocModel
    {
        [Key]
        public int MaDonHang { get; set; }

        public int MaNguoiDung { get; set; }

        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        [Column(TypeName = "numeric(18,2)")]
        public decimal TongTien { get; set; }

        [StringLength(10)]
        public string LoaiTien { get; set; } = "VND";

        [StringLength(30)]
        public string TrangThaiDonHang { get; set; } = "CREATED";

        [StringLength(30)]
        public string LoaiDonHang { get; set; } = "COURSE_PURCHASE";

        [StringLength(100)]
        public string IdempotencyKey { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExpiredAt { get; set; }

        public virtual ICollection<ChiTietDonHangModel> ChiTietDonHangs { get; set; } = new List<ChiTietDonHangModel>();
        public virtual ICollection<GiaoDichThanhToanModel> GiaoDichThanhToans { get; set; } = new List<GiaoDichThanhToanModel>();
        public virtual ICollection<ThongBaoEmailThanhToanModel> ThongBaoEmailThanhToans { get; set; } = new List<ThongBaoEmailThanhToanModel>();
        public virtual ICollection<MaQuaTangHocVienModel> MaQuaTangHocViens { get; set; } = new List<MaQuaTangHocVienModel>();
    }
}
