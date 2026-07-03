namespace educodeai_server.DTOs.ThanhToan
{
    public class KetQuaNhapMaQuaTangDTO
    {
        public bool ThanhCong { get; set; }
        public string ThongBao { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public int MaNguoiNhan { get; set; }
    }
}
