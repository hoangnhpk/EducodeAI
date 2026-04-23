using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.RutTienGiangVien
{
    public class TuChoiYeuCauRutTienDTO
    {
        [Required]
        [StringLength(500)]
        public string LyDoTuChoi { get; set; } = string.Empty;
    }
}
