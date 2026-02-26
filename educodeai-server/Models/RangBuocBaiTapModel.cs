using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace educodeai_server.Models
{
    public class RangBuocBaiTapModel
    {
        [Key]
        public int MaRangBuoc { get; set; }

        [Required]
        public int MaBaiTapThucHanh { get; set; }

        [Required]
        [StringLength(255)]
        public string TenRangBuoc { get; set; } = null!;

        [Required]
        public string GiaTri { get; set; } = null!;

        [ForeignKey("MaBaiTapThucHanh")]
        public virtual BaiTap_ThucHanhIDEModel BaiTapThucHanh { get; set; } = null!;
    }
}
