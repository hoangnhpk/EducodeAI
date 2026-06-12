namespace educodeai_server.DTOs.QuaTang
{
    public class QuaTangKhoaHocItemDTO
    {
        public int MaQuaTang { get; set; }
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public int MaNguoiTang { get; set; }
        public string TenNguoiTang { get; set; } = string.Empty;
        public int MaNguoiNhan { get; set; }
        public string TenNguoiNhan { get; set; } = string.Empty;
        public string? EmailNguoiNhan { get; set; }
        public string LoaiNguoiTang { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public string? LoiNhan { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
