using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.ThanhToan
{
    public class NhapMaQuaTangDTO
    {
        [Required]
        [StringLength(40)]
        public string Code { get; set; } = string.Empty;
    }
}
