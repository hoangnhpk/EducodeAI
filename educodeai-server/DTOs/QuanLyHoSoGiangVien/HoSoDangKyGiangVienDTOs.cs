using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace educodeai_server.DTOs.QuanLyHoSoGiangVien
{
    /// <summary>
    /// DTO trả về cho danh sách hồ sơ đăng ký giảng viên (admin xem).
    /// </summary>
    public class HoSoDangKyGiangVienDTO
    {
        public long MaHoSoDangKyGiangVien { get; set; }
        public int? MaNguoiDung { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? SoDienThoai { get; set; }
        public string TaiKhoan { get; set; } = string.Empty;
        public string LinhVucGiangDay { get; set; } = string.Empty;
        public string TieuSu { get; set; } = string.Empty;
        public string? LinkedInUrl { get; set; }
        public string? WebsiteUrl { get; set; }
        public string LoaiGiayTo { get; set; } = string.Empty;
        public string SoGiayTo { get; set; } = string.Empty;
        public string? AnhDaiDienUrl { get; set; }
        /// <summary>D? li?u OCR CCCD ?? ???c gi?i m?; ch? tr? v? t? API y?u c?u quy?n Admin.</summary>
        public Dictionary<string, string>? ThongTinCccdQuet { get; set; }
        [JsonIgnore]
        public string? DuLieuCccdMaHoa { get; set; }
        public string PhuongThucThanhToan { get; set; } = string.Empty;
        public string? TenNganHang { get; set; }
        public string? SoTaiKhoanNhanTien { get; set; }
        public string? TenChuTaiKhoan { get; set; }
        public string? MaSoThue { get; set; }
        public string? LoaiDoiTuongThue { get; set; }
        public string TrangThaiHoSo { get; set; } = "ChoDuyet";
        public string? LyDoTuChoi { get; set; }
        public int? MaQuanTriVienDuyet { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime NgayCapNhat { get; set; }
        public DateTime? NgayDuyet { get; set; }
        public bool DaNopBoSung { get; set; }
        public DateTime? NgayNopBoSung { get; set; }
    }

    /// <summary>
    /// Request body khi admin từ chối hồ sơ.
    /// </summary>
    public class TuChoiHoSoRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập lý do từ chối.")]
        public string LyDoTuChoi { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request body khi admin yêu cầu bổ sung hồ sơ.
    /// </summary>
    public class YeuCauBoSungHoSoRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập nội dung cần bổ sung.")]
        public string NoiDungBoSung { get; set; } = string.Empty;
    }
}
