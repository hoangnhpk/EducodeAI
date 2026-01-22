namespace educodeai_server.DTOs.AI
{
    public class CreateLoTrinhAIDto
    {
        public string? TrinhDoHienTai { get; set; }
        public string? PhongCachHoc { get; set; }
        public string? MucTieuNgheNghiep { get; set; }
        public int? ThoiGianHocDuKien { get; set; }
        public int ThoiGianMoiTuan { get; set; }
        public string? KienThucHienCo { get; set; }
        public string? KinhNghiemThucTe { get; set; }
        public string? KhoKhanHienTai { get; set; }

        public List<string>? LinhVucTapTrung { get; set; }
    }
}