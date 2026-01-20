using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class TinNhanAIModel {
        [Key]
        public int MaTinNhan { get; set; }

        public int MaHoiThoai { get; set; }
        [ForeignKey("MaHoiThoai")]
        public virtual CuocHoiThoaiAIModel CuocHoiThoaiAI { get; set; } = null!;

        [StringLength(20)]
        public string? VaiTro { get; set; } // User, Model

        [Required]
        public required string NoiDung { get; set; }

        public DateTime ThoiGian { get; set; } = DateTime.Now;
    }
}
