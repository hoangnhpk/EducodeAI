using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class BaiTap_NgonNguModel {
        [Key]
        public int MaBaiTapNgonNgu { get; set; } 

        public int MaBaiTap { get; set; }
        [ForeignKey("MaBaiTap")] 
        public virtual BaiTapModel BaiTap { get; set; } = null!;

        public int MaNgonNgu { get; set; }
        [ForeignKey("MaNgonNgu")] 
        public virtual NgonNguLapTrinhModel NgonNgu { get; set; } = null!;

        public string? CodeMau { get; set; }
    }
}
