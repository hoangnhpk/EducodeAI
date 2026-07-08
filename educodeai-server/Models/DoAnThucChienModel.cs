using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public enum TrangThaiDoAn
    {
        ChuaNop = 0,
        DangPhongVan = 1,
        DatChungChi = 2,
        ChuaDat = 3
    }

    public class DoAnThucChienModel
    {
        [Key]
        public int MaDoAn { get; set; }

        public int MaNguoiDung { get; set; }

        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        [Required]
        [StringLength(300)]
        public string TenDoAn { get; set; } = string.Empty;

        [StringLength(1000)]
        public string MoTa { get; set; } = string.Empty;

        /// <summary>JSON mảng string[] - danh sách yêu cầu chức năng</summary>
        public string YeuCauChucNangJSON { get; set; } = string.Empty;

        /// <summary>Chuỗi mô tả cấu trúc database (pseudo-code / JSON)</summary>
        public string CauTrucDatabaseText { get; set; } = string.Empty;

        /// <summary>Mục tiêu nghề nghiệp học viên nhập khi sinh đồ án</summary>
        [StringLength(200)]
        public string MucTieuNgheNghiep { get; set; } = string.Empty;

        /// <summary>Ngôn ngữ / Công nghệ học viên nhập khi sinh đồ án</summary>
        [StringLength(200)]
        public string NgonNguCongNghe { get; set; } = string.Empty;

        public TrangThaiDoAn TrangThai { get; set; } = TrangThaiDoAn.ChuaNop;

        /// <summary>Điểm phỏng vấn cuối cùng (0–100)</summary>
        public int? DiemPhongVan { get; set; }

        /// <summary>JSON array of PhongVanTurnDto – lưu toàn bộ lịch sử hỏi-đáp</summary>
        public string LichSuPhongVanJSON { get; set; } = "[]";

        public DateTime NgayNop { get; set; } = DateTime.UtcNow;

        public DateTime? NgayPhongVan { get; set; }

        // Navigation
        public virtual ChungChiDoAnModel? ChungChiDoAn { get; set; }
    }
}
