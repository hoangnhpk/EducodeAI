using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class GiaoDichThanhToanModel
    {
        [Key]
        public int MaGiaoDich { get; set; }

        public int MaDonHang { get; set; }

        [ForeignKey("MaDonHang")]
        public virtual DonHangKhoaHocModel DonHang { get; set; } = null!;

        [StringLength(30)]
        public string CongThanhToan { get; set; } = "PAYOS";

        [StringLength(100)]
        public string MaThamChieuNgoai { get; set; } = null!;

        [Column(TypeName = "numeric(18,2)")]
        public decimal SoTien { get; set; }

        [StringLength(30)]
        public string TrangThai { get; set; } = "INITIATED";

        [Column(TypeName = "jsonb")]
        public string? RawWebhook { get; set; }

        public DateTime? PaidAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
