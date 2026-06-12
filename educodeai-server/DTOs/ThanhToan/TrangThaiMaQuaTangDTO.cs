namespace educodeai_server.DTOs.ThanhToan
{
    public class TrangThaiMaQuaTangDTO
    {
        public int MaDonHang { get; set; }
        public string TrangThaiDonHang { get; set; } = string.Empty;
        public string TrangThaiMaQuaTang { get; set; } = string.Empty;
        public bool SanSangSuDung { get; set; }
        public string ThongBao { get; set; } = string.Empty;
    }
}
