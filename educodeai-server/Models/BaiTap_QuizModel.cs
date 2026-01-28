using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class BaiTap_QuizModel
    {
        [Key]
        public int MaBaiTapQuiz { get; set; }

        [Required]
        public int MaBaiTap { get; set; }
        [ForeignKey("MaBaiTap")]
        public virtual BaiTapModel BaiTap { get; set; } = null!;

        public int? ThoiGianLamBai { get; set; }

        [Required]
        public double DiemCanDat { get; set; }

        public bool ChoPhepLamLai { get; set; } = false;
        public bool DaoCauHoi { get; set; } = false;

        [Required]
        [Column(TypeName = "nvarchar(max)")]
        public string DuLieuCauHoi { get; set; } = string.Empty;


    }
}
