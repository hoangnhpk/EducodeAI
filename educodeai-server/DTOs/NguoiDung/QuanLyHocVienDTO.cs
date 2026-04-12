namespace educodeai_server.DTOs.NguoiDung
{
    public class HocVienFilterDTO
    {
        public string? Keyword { get; set; }
        public string? TrangThai { get; set; }
        public string? SortBy { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;

    }

    public class ChiTietHocVienDTO
    {
        public int MaNguoiDung { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? AnhDaiDien { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public DateTime NgayThamGia { get; set; }
        public string? LyDoKhoa { get; set; }
    }
}