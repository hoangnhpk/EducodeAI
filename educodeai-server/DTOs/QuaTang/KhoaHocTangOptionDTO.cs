namespace educodeai_server.DTOs.QuaTang
{
    public class KhoaHocTangOptionDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public decimal GiaKhoaHoc { get; set; }
        public string DonViTienTe { get; set; } = "VND";
    }
}
