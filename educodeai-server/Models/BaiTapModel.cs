using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class BaiTapModel {
        [Key]
        public int MaBaiTap { get; set; }

        public int MaBaiHoc { get; set; }
        [ForeignKey("MaBaiHoc")]
        public virtual BaiHocModel BaiHoc { get; set; } = null!;

        [Required]
        public required string DeBai { get; set; }

        public int GioiHanThoiGian { get; set; } = 1000;
        public int GioiHanBoNho { get; set; } = 128;
    }
}
