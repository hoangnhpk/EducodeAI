namespace educodeai_server.DTOs.BaiTap
{
    public class DanhSachBaiTapDTO
    {
        public int MaBaiTap { get; set; }
        public string TenBaiTap { get; set; } = string.Empty;
        public string LoaiBaiTap { get; set; } = string.Empty;
        public string TenKhoaHoc { get; set; } = string.Empty; // Cột mới
        public string TenChuong { get; set; } = string.Empty;  // Cột mới
        public string TenBaiHoc { get; set; } = string.Empty;
        public string TrangThai { get; set; } = "Published";
    }
}
