using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class DangKyKhoaHocModel {
        [Key]
        public int MaDangKy { get; set; }

        public int MaNguoiDung { get; set; }
        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        public int MaKhoaHoc { get; set; }
        [ForeignKey("MaKhoaHoc")]
        public virtual KhoaHocModel KhoaHoc { get; set; } = null!;

        public DateTime NgayDangKy { get; set; } = DateTime.Now;

        [StringLength(50)]
        public string? TrangThai { get; set; } // DangHoc, HoanThanh

        public int TienDo { get; set; } = 0;
    }
}
