using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class BaiHocModel {
        [Key]
        public int MaBaiHoc { get; set; }

        public int MaChuong { get; set; }
        [ForeignKey("MaChuong")]
        public virtual ChuongHocModel ChuongHoc { get; set; } = null!;

        [Required]
        [StringLength(200)]
        public required string TieuDe { get; set; }

        [StringLength(50)]
        public required string LoaiBaiHoc { get; set; } // Video, VanBan, BaiTap

        public string? NoiDung { get; set; } // HTML content nên để MAX
        public int? ThoiLuong { get; set; } // VD: "15:30" (15 phút 30 giây)

        [StringLength(500)]
        public string? LinkVideo { get; set; }

        public int ThuTu { get; set; }

        // Bật/tắt tính năng Quiz tương tác cho bài học này (default: true = bật)
        // Sau này có thể quản lý qua trang Giảng viên
        public bool CoQuiz { get; set; } = true;

        // Cloudinary Video Properties
        [StringLength(255)]
        public string? VideoPublicId { get; set; }

        [Required]
        [StringLength(20)]
        public string VideoSource { get; set; } = "youtube"; // youtube | cloudinary

        [StringLength(30)]
        public string? VideoStatus { get; set; }

        public int? VideoDurationS { get; set; } // Giây
        public int? VideoSizeMb { get; set; } // MB

        // Subtitle Properties
        public bool HasSubtitle { get; set; } = false;

        public string? SubtitleUrl { get; set; }

        [StringLength(20)]
        public string? SubtitleSource { get; set; } // manual | ai | null

        public bool AiFeaturesEnabled { get; set; } = true;

        // Navigation
        public virtual ICollection<BaiTapModel> BaiTaps { get; set; } = null!;
        public virtual ICollection<TienDoBaiHocModel> TienDoBaiHocs { get; set; } = null!;
        public virtual ICollection<BinhLuanModel> BinhLuans { get; set; } = null!;
        public virtual ICollection<GhiChuBaiHocModel> GhiChuBaiHocs { get; set; } = null!;
        public virtual ICollection<VideoChapterModel> VideoChapters { get; set; } = null!;
    }
}
