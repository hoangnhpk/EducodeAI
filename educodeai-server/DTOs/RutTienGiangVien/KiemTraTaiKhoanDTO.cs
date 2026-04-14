using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.RutTienGiangVien
{
    public class KiemTraTaiKhoanDTO
    {
        [Required]
        [StringLength(50)]
        public string MaNganHang { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string SoTaiKhoan { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string TenChuTaiKhoan { get; set; } = string.Empty;
    }
}
