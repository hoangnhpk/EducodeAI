using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace educodeai_server.Models
{
    public class VideoQuizModel
    {
        [Key]
        public int MaVideoQuiz { get; set; }

        public int MaChapter { get; set; }

        [ForeignKey("MaChapter")]
        [JsonIgnore] // Tránh lỗi JSON cycle khi serialize
        public virtual VideoChapterModel Chapter { get; set; } = null!;

        [Required]
        [StringLength(1000)]
        public string CauHoi { get; set; } = null!;

        [Required]
        [StringLength(500)]
        public string DapAnA { get; set; } = null!;

        [Required]
        [StringLength(500)]
        public string DapAnB { get; set; } = null!;

        [StringLength(500)]
        public string? DapAnC { get; set; }

        [StringLength(500)]
        public string? DapAnD { get; set; }

        [Required]
        [StringLength(5)]
        public string DapAnDung { get; set; } = null!; // "A", "B", "C", "D"
    }
}
