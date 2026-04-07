using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    [Table("PhienDangNhap")]
    public class PhienDangNhapModel
    {
        [Key]
        public int MaPhien { get; set; }

        public int MaNguoiDung { get; set; }
        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDungModel NguoiDung { get; set; }

        [Required]
        [MaxLength(255)]
        public string MaThietBi { get; set; }

        [MaxLength(255)]
        public string TenThietBi { get; set; }

        [MaxLength(50)]
        public string? DiaChiIP { get; set; }

        public DateTime ThoiGianDangNhap { get; set; }

        public DateTime ThoiGianHoatDongCuoi { get; set; }

        public bool DangHoatDong { get; set; } = true; // Trạng thái: đang login hay đã logout
    }
}