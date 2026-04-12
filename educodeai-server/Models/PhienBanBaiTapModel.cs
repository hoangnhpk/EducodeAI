using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace educodeai_server.Models
{
    public class PhienBanBaiTapModel
    {
        [Key]
        public int MaPhienBan { get; set; }

        [Required]
        public int MaBaiTapThucHanh { get; set; }

        [Required]
        public string SnapshotJSON { get; set; } = null!;

        public DateTime NgayTao { get; set; } = DateTime.UtcNow;

        [ForeignKey("MaBaiTapThucHanh")]
        public virtual BaiTap_ThucHanhIDEModel BaiTapThucHanh { get; set; } = null!;
    }
}
