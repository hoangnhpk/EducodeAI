using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class NguoiDungDanhHieuModel
    {
        [Key]
        public int MaMoKhoa { get; set; }

        public int MaNguoiDung { get; set; }

        [ForeignKey(nameof(MaNguoiDung))]
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        public int MaDanhHieu { get; set; }

        [ForeignKey(nameof(MaDanhHieu))]
        public virtual DanhHieuModel DanhHieu { get; set; } = null!;

        public DateTime NgayMoKhoa { get; set; } = DateTime.UtcNow;
    }
}
