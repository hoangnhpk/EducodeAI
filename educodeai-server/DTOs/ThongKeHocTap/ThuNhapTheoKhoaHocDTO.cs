namespace educodeai_server.DTOs.ThongKeHocTap
{
    public class ThuNhapTheoKhoaHocDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public int SoDonHang { get; set; }
        public decimal TongDoanhThu { get; set; }
        public decimal PhiNenTang { get; set; }
        public decimal ThucNhan { get; set; }
    }
}
