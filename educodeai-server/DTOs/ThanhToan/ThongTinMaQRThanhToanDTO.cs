namespace educodeai_server.DTOs.ThanhToan
{
    public class ThongTinMaQRThanhToanDTO
    {
        public int MaDonHang { get; set; }
        public int MaKhoaHoc { get; set; }
        public decimal SoTienCanThanhToan { get; set; }
        public string DonViTienTe { get; set; } = "VND";
        public string NoiDungChuyenKhoan { get; set; } = string.Empty;
        public string DuongDanAnhQr { get; set; } = string.Empty;
        public DateTime? HetHanLuc { get; set; }
    }
}
