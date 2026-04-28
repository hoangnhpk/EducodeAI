using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.ThanhToan
{
    public class YeuCauTaoMaQuaTangDTO
    {
        [Required]
        public int MaKhoaHoc { get; set; }
    }
}
