using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace educodeai_server.Models
{
    public class GoiYAI_TaoBaiTapModel
    {
        [Key]
        public int MaGoiY { get; set; }

        [Required]
        public int MaBaiTapThucHanh { get; set; }

        [ForeignKey("MaBaiTapThucHanh")]
        public virtual BaiTap_ThucHanhIDEModel BaiTapThucHanh { get; set; } = null!;

        [StringLength(100)]
        public string LoaiGoiY { get; set; } = null!;

        [Required]
        public string NoiDung { get; set; } = null!;

        [StringLength(50)]
        public string TrangThai { get; set; } = null!;

        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
    }
}
