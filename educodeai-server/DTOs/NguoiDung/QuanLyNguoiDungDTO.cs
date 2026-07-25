
namespace educodeai_server.DTOs.NguoiDung

{
    public class QuanLyNguoiDungDTO
    {
        public string MaNguoiDung { get; set; } = string.Empty;
        public string? HoTen { get; set; }
        public string? Email { get; set; }
        public string? AnhDaiDien { get; set; }
        public string? TrangThai { get; set; }
        public string VaiTro { get; set; } = string.Empty;
        public DateTime? NgayTao { get; set; }
        public DateTime? ThoiGianMoKhoa { get; set; }
        public string? LyDoKhoa { get; set; }
    }
    public class ThemNguoiDungDTO
    {
        public string? HoTen { get; set; }
        public string? Email { get; set; }
        public string? AnhDaiDien { get; set; }
        public string? MatKhau { get; set; }
        public int VaiTro { get; set; }
    }

    public class CapNhatNguoiDungDTO
    {
        public string? HoTen { get; set; }
        public string? Email { get; set; }
        public string? AnhDaiDien {  get; set; }
        public int VaiTro { get; set; }
        public string? MatKhauMoi { get; set; }
        public string? TrangThai { get; set; }
        public string? LyDoKhoa { get; set; }
        public string? ThoiHanKhoa { get; set; } // "15s", "1d", "3d", "1w", "2w", "1m", "vinh-vien"
    }
    public class CapNhatVaiTroDTO
    {
        public string? VaiTroMoi { get; set; }
    }

    // H.7: filter + pagination server-side cho danh sách user (giảng viên + học viên).
    public class NguoiDungFilterDTO
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Keyword { get; set; }
        public int? VaiTro { get; set; }      // 1=Giảng viên, 2=Học viên; null=cả hai
        public string? TrangThai { get; set; } // "Hoạt động"/"Bị khóa"/"Khóa vĩnh viễn"; null=tất cả
    }
}
