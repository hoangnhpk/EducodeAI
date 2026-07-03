using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class TienDoNhiemVuTuanModel
    {
        [Key]
        public int MaTienDo { get; set; }

        public int MaNguoiDung { get; set; }

        [ForeignKey(nameof(MaNguoiDung))]
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        public int MaMau { get; set; }

        [ForeignKey(nameof(MaMau))]
        public virtual MauNhiemVuTuanModel Mau { get; set; } = null!;

        /// <summary>Mốc 12:00 Chủ nhật (VN) đầu chu kỳ, lưu UTC</summary>
        public DateTime DauChuKy { get; set; }

        public int GiaTriHienTai { get; set; }

        /// <summary>IN_PROGRESS | COMPLETED | CLAIMED</summary>
        [StringLength(20)]
        public string TrangThai { get; set; } = "IN_PROGRESS";

        public DateTime? NgayNhanThuong { get; set; }
    }
}
