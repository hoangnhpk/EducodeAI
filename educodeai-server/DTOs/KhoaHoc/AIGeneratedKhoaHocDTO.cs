namespace educodeai_server.DTOs.AI
{
    public class AIGeneratedKhoaHocDTO
    {
        public string TenKhoaHoc { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public string LinhVuc { get; set; } = string.Empty;
        public string TrinhDo { get; set; } = string.Empty;
        public string KyNangChinh { get; set; } = string.Empty;
        public int ThoiLuongGio { get; set; } = 0;
        public List<AIGeneratedChuongHocDTO> ChuongHocs { get; set; } = new();
    }

    public class AIGeneratedChuongHocDTO
    {
        public string TenChuong { get; set; } = string.Empty;
        public int ThuTu { get; set; }
        public List<AIGeneratedBaiHocDTO> BaiHocs { get; set; } = new();
    }

    public class AIGeneratedBaiHocDTO
    {
        public string TieuDe { get; set; } = string.Empty;
        public string LoaiBaiHoc { get; set; } = string.Empty; // "Video", "VanBan", hoặc "BaiTap"
        public int ThuTu { get; set; }
    }
}