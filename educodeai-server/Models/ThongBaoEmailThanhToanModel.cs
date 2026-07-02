using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class ThongBaoEmailThanhToanModel
    {
        [Key]
        public int MaThongBao { get; set; }

        public int MaDonHang { get; set; }

        [ForeignKey("MaDonHang")]
        public virtual DonHangKhoaHocModel DonHang { get; set; } = null!;

        [StringLength(50)]
        public string LoaiThongBao { get; set; } = "PAYMENT_SUCCESS_STUDENT";

        [StringLength(255)]
        public string EmailNhan { get; set; } = string.Empty;

        [StringLength(20)]
        public string TrangThai { get; set; } = "PENDING";

        public int SoLanThu { get; set; }

        [StringLength(1000)]
        public string? LoiCuoi { get; set; }

        public DateTime? SentAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
