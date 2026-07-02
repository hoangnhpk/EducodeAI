using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class QuaTangKhoaHocModel
    {
        [Key]
        public int MaQuaTang { get; set; }

        public int MaKhoaHoc { get; set; }

        [ForeignKey("MaKhoaHoc")]
        public virtual KhoaHocModel KhoaHoc { get; set; } = null!;

        public int MaNguoiNhan { get; set; }

        [ForeignKey("MaNguoiNhan")]
        public virtual NguoiDungModel NguoiNhan { get; set; } = null!;

        public int MaNguoiTang { get; set; }

        [ForeignKey("MaNguoiTang")]
        public virtual NguoiDungModel NguoiTang { get; set; } = null!;

        [StringLength(30)]
        public string LoaiNguoiTang { get; set; } = "GIANGVIEN"; // GIANGVIEN | ADMIN

        [StringLength(30)]
        public string TrangThai { get; set; } = "COMPLETED";

        [StringLength(500)]
        public string? LoiNhan { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
    }
}
