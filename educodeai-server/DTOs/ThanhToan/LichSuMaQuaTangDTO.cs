namespace educodeai_server.DTOs.ThanhToan
{
    public class LichSuMaQuaTangDTO
    {
        public int MaQuaTang { get; set; }
        public string Code { get; set; } = string.Empty;
        public int MaDonHang { get; set; }
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public decimal SoTien { get; set; }
        public string DonViTienTe { get; set; } = "VND";
        public string NoiDungChuyenKhoan { get; set; } = string.Empty;
        public int MaNguoiTang { get; set; }
        public string? TenNguoiTang { get; set; }
        public string? EmailNguoiTang { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? ActivatedAt { get; set; }
        public DateTime? RedeemedAt { get; set; }
        public int? MaNguoiNhan { get; set; }
        public string? TenNguoiNhan { get; set; }
        public string? EmailNguoiNhan { get; set; }
    }
}
