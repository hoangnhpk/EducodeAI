using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.RutTienGiangVien
{
    public class YeuCauHoTroRutTienDTO
    {
        [Required(ErrorMessage = "Vui lòng nhập thông tin liên hệ nhanh.")]
        [StringLength(200, ErrorMessage = "Thông tin liên hệ tối đa 200 ký tự.")]
        public string ThongTinLienLac { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Nội dung tối đa 500 ký tự.")]
        public string? NoiDungGiangVien { get; set; }
    }
}
