using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.ThanhToan
{
    public class YeuCauTaoMaQRDTO
    {
        [Required]
        public int MaKhoaHoc { get; set; }

        [StringLength(40)]
        public string? MaVoucher { get; set; }
    }
}
