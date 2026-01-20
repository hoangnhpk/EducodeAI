namespace educodeai_server.DTOs.AI
{
    public class KhoaHocAISnapshotDto
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = null!;
        public string TrinhDo { get; set; } = null!;
        public string LinhVuc { get; set; } = null!;
        public string KyNangChinh { get; set; } = null!;
        public int ThoiLuongGio { get; set; }
    }
}
