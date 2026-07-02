using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.QuaTang
{
    public class TangKhoaHocDTO
    {
        [Required]
        public int MaKhoaHoc { get; set; }

        [Required]
        public int MaNguoiNhan { get; set; }

        [StringLength(500)]
        public string? LoiNhan { get; set; }
    }
}
