using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    [Table("RefreshToken")]
    public class RefreshTokenModel
    {
        [Key]
        public long MaRefreshToken { get; set; }

        public int MaNguoiDung { get; set; }
        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        public int? MaPhien { get; set; }
        [ForeignKey("MaPhien")]
        public virtual PhienDangNhapModel? PhienDangNhap { get; set; }

        [Required]
        [MaxLength(128)]
        public required string TokenHash { get; set; }

        [Required]
        [MaxLength(64)]
        public required string FamilyId { get; set; }

        [MaxLength(64)]
        public string? Jti { get; set; }

        public DateTime ThoiGianHetHan { get; set; }

        public DateTime? AbsoluteExpiresAtUtc { get; set; }

        public DateTime NgayTao { get; set; }

        public DateTime? NgayThuHoi { get; set; }

        [MaxLength(64)]
        public string? LyDoThuHoi { get; set; }

        [MaxLength(128)]
        public string? ReplacedByTokenHash { get; set; }

        [MaxLength(64)]
        public string? IpTao { get; set; }

        [MaxLength(256)]
        public string? UserAgentTao { get; set; }

        [MaxLength(64)]
        public string? IpThuHoi { get; set; }
    }
}
