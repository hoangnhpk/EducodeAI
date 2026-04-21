namespace educodeai_server.DTOs.BaiTapThucHanh
{
    public class BaiTapThucHanhChiTietDto
    {
        public int MaBaiTap { get; set; }
        public int MaBaiHoc { get; set; }
        public string TieuDe { get; set; } = string.Empty;
        public string MoTaDeBai { get; set; } = string.Empty;
        public string NgonNgu { get; set; } = string.Empty;
        public string MucDo { get; set; } = string.Empty;
        public string LoiGiaiMau { get; set; } = string.Empty;
        public string GoiY { get; set; } = string.Empty; // Mapped to DB string
        public DateTime NgayTao { get; set; }
        public bool TrangThai { get; set; }
        public List<TestCaseDto> DanhSachTestCase { get; set; } = new();
    }
}
