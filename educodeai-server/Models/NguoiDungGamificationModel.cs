using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class NguoiDungGamificationModel
    {
        [Key]
        public int MaNguoiDung { get; set; }

        [ForeignKey(nameof(MaNguoiDung))]
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        public int TongExp { get; set; }

        public int? MaDanhHieuDangDeo { get; set; }

        [ForeignKey(nameof(MaDanhHieuDangDeo))]
        public virtual DanhHieuModel? DanhHieuDangDeo { get; set; }
    }
}
