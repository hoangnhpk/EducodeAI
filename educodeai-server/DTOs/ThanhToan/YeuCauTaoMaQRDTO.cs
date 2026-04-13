using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.ThanhToan
{
    public class YeuCauTaoMaQRDTO
    {
        [Required]
        public int MaKhoaHoc { get; set; }
    }
}
