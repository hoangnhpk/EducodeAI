using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class MaQuaTangHocVienModel
    {
        [Key]
        public int MaQuaTang { get; set; }

        [StringLength(40)]
        public string Code { get; set; } = null!;

        public int MaDonHang { get; set; }

        [ForeignKey("MaDonHang")]
        public virtual DonHangKhoaHocModel DonHang { get; set; } = null!;

        public int MaKhoaHoc { get; set; }

        [ForeignKey("MaKhoaHoc")]
        public virtual KhoaHocModel KhoaHoc { get; set; } = null!;

        public int MaNguoiTang { get; set; }

        [ForeignKey("MaNguoiTang")]
        public virtual NguoiDungModel NguoiTang { get; set; } = null!;

        public int? MaNguoiNhan { get; set; }

        [ForeignKey("MaNguoiNhan")]
        public virtual NguoiDungModel? NguoiNhan { get; set; }

        [StringLength(30)]
        public string TrangThai { get; set; } = "PENDING_PAYMENT"; // PENDING_PAYMENT | ACTIVE | REDEEMED | EXPIRED

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ActivatedAt { get; set; }
        public DateTime? RedeemedAt { get; set; }
        public DateTime? ExpiredAt { get; set; }
    }
}
