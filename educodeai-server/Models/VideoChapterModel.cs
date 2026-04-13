using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace educodeai_server.Models
{
    public class VideoChapterModel
    {
        [Key]
        public int MaChapter { get; set; }

        public int MaBaiHoc { get; set; }
        
        [ForeignKey("MaBaiHoc")]
        [JsonIgnore] // Tránh lỗi JSON cycle khi serialize
        public virtual BaiHocModel BaiHoc { get; set; } = null!;

        [Required]
        public int ThoiGianBatDau { get; set; } // Tính theo giây

        [Required]
        public int ThoiGianKetThuc { get; set; } // Tính theo giây

        [Required]
        [StringLength(500)]
        public string KienThucChinh { get; set; } = null!;

        public bool BatBuoc { get; set; } = false;

        // Navigation
        public virtual ICollection<VideoQuizModel> VideoQuizs { get; set; } = null!;
    }
}
