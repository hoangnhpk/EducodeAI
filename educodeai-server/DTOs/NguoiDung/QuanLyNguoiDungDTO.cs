
namespace educodeai_server.DTOs.NguoiDung

{
    public class QuanLyNguoiDungDTO
    {
        public string MaNguoiDung { get; set; } = string.Empty;
        public string? HoTen { get; set; }
        public string? Email { get; set; }
        public string? AnhDaiDien { get; set; }
        public bool TrangThai { get; set; }
        public string VaiTro { get; set; } = string.Empty;
        public DateTime? NgayTao { get; set; }
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
    }
    public class CapNhatVaiTroDTO
    {
        public string? VaiTroMoi { get; set; }
    }
}
