namespace educodeai_server.DTOs
{
    public class KhongGianHocTapItemDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public string? HinhAnh { get; set; }
        public int TongSoBaiHoc { get; set; }
        public int SoBaiDaHoc { get; set; }
        public int PhanTramTienDo { get; set; }
        public string Slug { get; set; } = string.Empty;
        public DateTime NgayDangKy { get; set; }
        public string? TrangThaiDangKy { get; set; }
    }
}
