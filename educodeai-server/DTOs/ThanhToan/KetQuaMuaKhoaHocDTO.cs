namespace educodeai_server.DTOs.ThanhToan
{
    public class KetQuaMuaKhoaHocDTO
    {
        public bool ThanhCong { get; set; }
        public string ThongBao { get; set; } = string.Empty;
        public int? MaDonHang { get; set; }
        public int MaKhoaHoc { get; set; }
        public bool DaMua { get; set; }
    }
}
