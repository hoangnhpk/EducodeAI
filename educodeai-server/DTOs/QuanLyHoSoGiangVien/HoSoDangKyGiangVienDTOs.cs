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
        public List<HoSoGiangVienTaiLieuDTO> TaiLieus { get; set; } = new();
    }

    public class HoSoGiangVienTaiLieuDTO
    {
        public long MaTaiLieu { get; set; }
        public string LoaiTaiLieu { get; set; } = string.Empty;
        public string TenFile { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long KichThuoc { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string? LyDoTuChoi { get; set; }
        public DateTime NgayTaiLen { get; set; }
        public DateTime? NgayDuyet { get; set; }
        public string? TenChungChi { get; set; }
        public string? DonViCap { get; set; }
        public DateOnly? NgayCapChungChi { get; set; }
        public DateOnly? NgayHetHanChungChi { get; set; }
        public string? MaChungChi { get; set; }
        public string? UrlXacMinh { get; set; }
        public string DownloadUrl { get; set; } = string.Empty;
    }

    public class HoSoGiangVienTaiLieuDownloadDTO
    {
        public Stream NoiDung { get; set; } = Stream.Null;
        public string ContentType { get; set; } = "application/octet-stream";
        public string TenFile { get; set; } = "tai-lieu";
    }

    public sealed class ChungChiAdminFilterRequest
    {
        public string? TuKhoa { get; set; }
        public string? TrangThai { get; set; }
        public string? DonViCap { get; set; }
        public DateOnly? TuNgay { get; set; }
        public DateOnly? DenNgay { get; set; }
        [Range(1, int.MaxValue)]
        public int Trang { get; set; } = 1;
        [Range(1, 100)]
        public int KichThuocTrang { get; set; } = 10;
    }

    public sealed class ChungChiAdminItemDTO
    {
        public long MaTaiLieu { get; set; }
        public string TenChungChi { get; set; } = string.Empty;
        public string? DonViCap { get; set; }
        public DateOnly? NgayCap { get; set; }
        public DateOnly? NgayHetHan { get; set; }
        public string? MaChungChi { get; set; }
        public string? UrlXacMinh { get; set; }
        public string TenFile { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long KichThuoc { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string? LyDoXuLy { get; set; }
        public long PhienBan { get; set; }
        public DateTime NgayCapNhat { get; set; }
        public DateTime? NgayDuyet { get; set; }
        public bool HienThiCongKhai { get; set; }
    }

    public sealed class ChungChiAdminListItemDTO
    {
        public Guid MaDotGui { get; set; }
        public int MaNguoiDung { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? AnhDaiDienUrl { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string? LyDoXuLy { get; set; }
        public DateTime NgayTaiLen { get; set; }
        public DateTime NgayCapNhat { get; set; }
        public DateTime? NgayDuyet { get; set; }
        public int SoLuongChungChi { get; set; }
        public List<ChungChiAdminItemDTO> ChungChis { get; set; } = new();
    }

    public sealed class ChungChiAdminPagedDTO
    {
        public List<ChungChiAdminListItemDTO> DuLieu { get; set; } = new();
        public int TongSo { get; set; }
        public int Trang { get; set; }
        public int KichThuocTrang { get; set; }
        public int TongSoTrang { get; set; }
    }

    public sealed class XuLyChungChiRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập lý do xử lý.")]
        [StringLength(1000)]
        public string LyDo { get; set; } = string.Empty;
    }

    public sealed class QuyetDinhDotChungChiRequest
    {
        [Required, MinLength(1), MaxLength(20)]
        public List<QuyetDinhChungChiItemRequest> QuyetDinhs { get; set; } = new();
    }

    public sealed class QuyetDinhChungChiItemRequest
    {
        [Range(1, long.MaxValue)]
        public long MaTaiLieu { get; set; }

        [Required, StringLength(20)]
        public string TrangThai { get; set; } = string.Empty;

        [StringLength(1000)]
        public string? LyDo { get; set; }

        [Range(0, long.MaxValue)]
        public long PhienBan { get; set; }
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
