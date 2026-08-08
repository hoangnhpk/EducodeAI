namespace educodeai_server.DTOs.KhoaHoc
{
    public class KhoaHocDto
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; }
        public string Slug { get; set; }
        public string HinhAnh { get; set; }
        public string LinhVuc { get; set; }
        public double DiemDanhGiaTB { get; set; }
        public int ThoiLuongGio { get; set; }
        public string TrinhDo { get; set; }
        public string KyNangChinh { get; set; }
        public bool KhoaHocDaDangKy { get; set; }
        public decimal GiaKhoaHoc { get; set; }
        public string DonViTienTe { get; set; }
    }
}