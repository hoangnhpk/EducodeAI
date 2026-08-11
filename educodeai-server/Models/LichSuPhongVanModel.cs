using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public enum TinhCachAI
    {
        Friendly = 1,
        Strict = 2,
        Normal = 3
    }

    public enum TrangThaiPhongVan
    {
        InProgress = 1,
        Completed = 2
    }

    public class LichSuPhongVanModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MaPhongVan { get; set; }

        public int MaNguoiDung { get; set; }

        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDungModel? NguoiDung { get; set; }

        [Required]
        [MaxLength(255)]
        public string ViTriUngTuyen { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string CapDo { get; set; } = string.Empty;

        public TinhCachAI TinhCachAI { get; set; } = TinhCachAI.Normal;

        public int SoLuongCauHoi { get; set; } = 3;

        public int DiemSo { get; set; } = 0;

        public string DanhGiaChung { get; set; } = string.Empty;

        [MaxLength(5000)]
        public string GhiChu { get; set; } = string.Empty;

        public DateTime? CapNhatGhiChuLuc { get; set; }

        /// <summary>
        /// Chứa chuỗi JSON mảng PhongVanTurnDto
        /// </summary>
        public string ChiTietChatJSON { get; set; } = "[]";

        public TrangThaiPhongVan TrangThai { get; set; } = TrangThaiPhongVan.InProgress;

        public DateTime NgayPhongVan { get; set; } = DateTime.UtcNow;
    }
}
