using System.ComponentModel.DataAnnotations;

namespace educodeai_server.Models
{
    public class NgonNguLapTrinhModel {
        [Key]
        public int MaNgonNgu { get; set; }

        [Required]
        [StringLength(50)]
        public required string TenNgonNgu { get; set; }

        // Navigation
        public virtual ICollection<BaiTap_NgonNguModel> BaiTap_NgonNgus { get; set; } = null!;
        public virtual ICollection<BaiNopModel> BaiNops { get; set; } = null!;
    }
}
