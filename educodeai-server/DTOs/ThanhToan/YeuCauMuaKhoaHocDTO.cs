using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.ThanhToan
{
    public class YeuCauMuaKhoaHocDTO
    {
        [Required]
        public int MaKhoaHoc { get; set; }

        public string? MaVoucher { get; set; }
    }
}
