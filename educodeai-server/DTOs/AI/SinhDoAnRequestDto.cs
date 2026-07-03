using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.AI
{
    public class SinhDoAnRequestDto
    {
        [Required]
        public string MucTieuNgheNghiep { get; set; }

        [Required]
        public string NgonNguCongNghe { get; set; }

        [Required]
        public string CapDo { get; set; }
    }
}
