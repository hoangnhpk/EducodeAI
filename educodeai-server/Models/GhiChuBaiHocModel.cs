using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class GhiChuBaiHocModel
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MaNguoiDung { get; set; }

        [Required]
        public int MaBaiHoc { get; set; }

        [Required]
        public int ThoiGianVideo { get; set; }

        [Required]
        [StringLength(2000)]
        public string NoiDung { get; set; } = string.Empty;

        public DateTime NgayTao { get; set; } = DateTime.UtcNow;

        // ===== Navigation (nếu cần) =====
        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;
        [ForeignKey("MaBaiHoc")]
        public virtual BaiHocModel BaiHoc { get; set; } = null!;
    }
}
