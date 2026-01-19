namespace educodeai_server.DTOs.AI
{
    public class CreateLoTrinhAIDto
    {
        public string? TrinhDoHienTai { get; set; }
        public string? PhongCachHoc { get; set; }
        public string? MucTieuNgheNghiep { get; set; }
        public int ThoiGianMoiTuan { get; set; }

        public List<string>? LinhVucTapTrung { get; set; }
        public string? LinhVucKhac { get; set; }
    }
}