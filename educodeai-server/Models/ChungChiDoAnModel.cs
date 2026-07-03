using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    /// <summary>
    /// Chứng chỉ Thực chiến (Certificate of Excellence) – cấp sau khi
    /// học viên vượt qua phỏng vấn AI dựa trên đồ án của mình.
    /// HOÀN TOÀN TÁCH BIỆT với ChungChiKhoaHocModel (chứng chỉ hoàn thành khóa học).
    /// </summary>
    public class ChungChiDoAnModel
    {
        [Key]
        public int MaChungChiDoAn { get; set; }

        public int MaNguoiDung { get; set; }

        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        public int MaDoAn { get; set; }

        [ForeignKey("MaDoAn")]
        public virtual DoAnThucChienModel DoAn { get; set; } = null!;

        /// <summary>Mã định danh chứng chỉ duy nhất, dùng để tra cứu/verify</summary>
        [Required]
        [StringLength(100)]
        public string MaChungChi { get; set; } = string.Empty;

        public int DiemDat { get; set; }

        public DateTime NgayCap { get; set; } = DateTime.UtcNow;
    }
}
