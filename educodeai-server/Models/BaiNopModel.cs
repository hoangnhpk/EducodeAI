using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class BaiNopModel {
        [Key]
        public int MaBaiNop { get; set; }

        public int MaNguoiDung { get; set; }
        [ForeignKey("MaNguoiDung")] 
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        public int MaBaiTap { get; set; }
        [ForeignKey("MaBaiTap")] 
        public virtual BaiTapModel BaiTap { get; set; } = null!;

        public int MaNgonNgu { get; set; }
        [ForeignKey("MaNgonNgu")] 
        public virtual NgonNguLapTrinhModel NgonNgu { get; set; } = null!;

        [Required]
        public required string CodeNop { get; set; }

        public int LanNop { get; set; }

        [StringLength(50)]
        public string? TrangThai { get; set; } // AC, WA, TLE...

        public int ThoiGianChay { get; set; }
        public int BoNhoSuDung { get; set; }
        public DateTime NgayNop { get; set; } = DateTime.Now;
    }
}
