using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class BinhLuanModel {
        [Key]
        public int MaBinhLuan { get; set; }

        public int MaNguoiDung { get; set; }
        [ForeignKey("MaNguoiDung")] 
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        public int MaBaiHoc { get; set; }
        [ForeignKey("MaBaiHoc")] 
        public virtual BaiHocModel BaiHoc { get; set; } = null!;

        [Required] // Không được bình luận trống
        public required string NoiDung { get; set; }

        public int? MaBinhLuanCha { get; set; }
        [ForeignKey("MaBinhLuanCha")]
        public virtual BinhLuanModel? BinhLuanCha { get; set; }

        public DateTime NgayTao { get; set; } = DateTime.Now;
    }
}
