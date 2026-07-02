namespace educodeai_server.DTOs.BaiTap
{
    public class PhanTichLoiCodeRequestDTO
    {
        public string Code { get; set; } = string.Empty;
        public string NgonNgu { get; set; } = string.Empty;
        public string TieuDeBai { get; set; } = string.Empty;
        public string? ThongBaoLoi { get; set; }
        public List<TestCaseSaiDTO> TestCasesSai { get; set; } = new();
    }

    public class TestCaseSaiDTO
    {
        public string Input { get; set; } = string.Empty;
        public string KetQuaThucTe { get; set; } = string.Empty;
        public string KetQuaMongDoi { get; set; } = string.Empty;
    }

    public class AIPhanTichLoiDTO
    {
        public bool ThanhCong { get; set; }
        public string NoiDungPhanTich { get; set; } = string.Empty;
    }
}
