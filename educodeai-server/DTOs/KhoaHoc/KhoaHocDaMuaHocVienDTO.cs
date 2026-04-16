namespace educodeai_server.DTOs.KhoaHoc
{
    /// <summary>
    /// Khóa học đã đăng ký / mua của học viên (danh sách "Khóa học của tôi").
    /// </summary>
    public class KhoaHocDaMuaHocVienDTO
    {
        public int MaDangKy { get; set; }
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public string? HinhAnh { get; set; }
        public string LinhVuc { get; set; } = string.Empty;
        public int ThoiLuongGio { get; set; }
        /// <summary>Tiến độ 0–100 (%).</summary>
        public int TienDo { get; set; }
        public string? TrangThai { get; set; }
        public DateTime NgayDangKy { get; set; }
        /// <summary>Slug cho URL nội dung khóa học.</summary>
        public string Slug { get; set; } = string.Empty;
    }
}
