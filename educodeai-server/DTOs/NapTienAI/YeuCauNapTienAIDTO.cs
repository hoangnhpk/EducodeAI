using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.NapTienAI
{
    public class YeuCauNapTienAIDTO
    {
        [Required]
        [Range(10000, 1000000000)]
        public decimal SoTienVnd { get; set; }
    }
}
