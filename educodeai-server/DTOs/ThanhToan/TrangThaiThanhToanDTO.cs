namespace educodeai_server.DTOs.ThanhToan
{
    public class TrangThaiThanhToanDTO
    {
        public int MaDonHang { get; set; }
        public string TrangThaiDonHang { get; set; } = string.Empty;
        public bool DaMoKhoaHoc { get; set; }
        public string ThongBao { get; set; } = string.Empty;
    }
}
