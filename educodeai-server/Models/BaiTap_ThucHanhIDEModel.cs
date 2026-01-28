using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class BaiTap_ThucHanhIDEModel {
        [Key]
        public int MaBaiTapThucHanh { get; set; } 

        public int MaBaiTap { get; set; }
        [ForeignKey("MaBaiTap")] 
        public virtual BaiTapModel BaiTap { get; set; } = null!;

        public int MaNgonNgu { get; set; }
        [ForeignKey("MaNgonNgu")] 
        public virtual NgonNguLapTrinhModel NgonNgu { get; set; } = null!;
        [Required]
        public required string DeBai { get; set; }

        public string? CodeMau { get; set; }

        public virtual ICollection<BoThuNghiemModel> BoThuNghiems { get; set; } = null!;
    }
}
