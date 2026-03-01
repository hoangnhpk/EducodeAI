using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class LoiGiaiMauModel
    {
        [Key]
        public int MaLoiGiai { get; set; }

        [Required]
        public int MaBaiTapThucHanh { get; set; }

        public int MaNgonNgu { get; set; }

        [Required]
        public string CodeMau { get; set; } = null!;

        [StringLength(50)]
        public string DoPhucTap { get; set; } = null!;

        public string GiaiThich { get; set; } = null!;

        [ForeignKey("MaBaiTapThucHanh")]
        public virtual BaiTap_ThucHanhIDEModel BaiTapThucHanh { get; set; } = null!;

        [ForeignKey("MaNgonNgu")]
        public virtual NgonNguLapTrinhModel NgonNguLapTrinh { get; set; } = null!;
    }
}
