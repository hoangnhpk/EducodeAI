using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class KetQuaLamBaiModel {
        [Key]
        public int MaKetQuaBaiNop { get; set; }

        public int MaNguoiDung { get; set; }
        [ForeignKey("MaNguoiDung")] 
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        public int MaBaiTap { get; set; }
        [ForeignKey("MaBaiTap")] 
        public virtual BaiTapModel BaiTap { get; set; } = null!;

        [Required]
        [Column(TypeName = "nvarchar(max)")]
        public required string NoiDungNopJSON { get; set; }

        public float DiemSo { get; set; }
        public bool TrangThai { get; set; } = false;
        public DateTime NgayNop { get; set; } = DateTime.Now;
    }
}
