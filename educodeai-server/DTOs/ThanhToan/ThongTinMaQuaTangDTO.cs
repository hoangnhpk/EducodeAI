namespace educodeai_server.DTOs.ThanhToan
{
    public class ThongTinMaQuaTangDTO
    {
        public int MaQuaTang { get; set; }
        public string Code { get; set; } = string.Empty;
        public int MaDonHang { get; set; }
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public decimal SoTienCanThanhToan { get; set; }
        public string DonViTienTe { get; set; } = "VND";
        public string NoiDungChuyenKhoan { get; set; } = string.Empty;
        public string DuongDanAnhQr { get; set; } = string.Empty;
        public DateTime? HetHanThanhToan { get; set; }
        public string TrangThaiMaQuaTang { get; set; } = string.Empty;
    }
}
