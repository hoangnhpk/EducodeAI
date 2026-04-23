namespace educodeai_server.DTOs.ThanhToan
{
    public class ThongTinMuaKhoaHocDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public string? HinhAnh { get; set; }
        public decimal GiaKhoaHoc { get; set; }
        public string DonViTienTe { get; set; } = "VND";
        public bool DaMua { get; set; }
        public bool ChoPhepMua { get; set; }
    }
}
