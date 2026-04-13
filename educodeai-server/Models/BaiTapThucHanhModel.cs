using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class BaiTapThucHanhModel
    {
        [Key]
        public int MaBaiTapTH { get; set; }

        public int MaBaiTap { get; set; }

        [ForeignKey("MaBaiTap")]
        public virtual BaiTapModel BaiTap { get; set; } = null!;

        [Required]
        [StringLength(255)]
        public string TieuDe { get; set; } = null!;

        [Required]
        public string MoTaDeBai { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string NgonNgu { get; set; } = null!;

        [StringLength(50)]
        public string MucDo { get; set; } = "De";

        public string? LoiGiaiMau { get; set; }

        public string? GoiY { get; set; }

        public DateTime NgayTao { get; set; } = DateTime.UtcNow;

        public bool TrangThai { get; set; } = true;

        public virtual ICollection<TestCaseThucHanhModel> TestCases { get; set; } = new List<TestCaseThucHanhModel>();
    }
}
