using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.RutTienGiangVien
{
    public class CapNhatTaiKhoanRutTienDTO
    {
        /// <summary>Mã chọn từ dropdown (Ma trong danh mục, ví dụ STB, BIDV).</summary>
        [Required]
        [StringLength(50)]
        public string MaNganHangNhanTien { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string SoTaiKhoanNhanTien { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string TenTaiKhoanNhanTien { get; set; } = string.Empty;
    }
}
