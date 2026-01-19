using System.ComponentModel.DataAnnotations;

namespace educodeai_server.Models
{
    public class NgonNguLapTrinhModel {
        [Key]
        public int MaNgonNgu { get; set; }

        [Required]
        [StringLength(50)]
        public required string TenNgonNgu { get; set; }
    }
}
