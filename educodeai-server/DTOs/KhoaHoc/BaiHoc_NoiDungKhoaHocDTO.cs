namespace educodeai_server.DTOs.KhoaHoc
{
    public class BaiHoc_NoiDungKhoaHocDTO
    {
        public int Id { get; set; }
        public string TieuDe { get; set; } = string.Empty;
        public string LoaiBaiHoc { get; set; } = string.Empty;
        public string? NoiDung { get; set; }
        public int ThoiLuong { get; set; }
        public int ThuTu { get; set; }
        public string? LinkVideo { get; set; }
    }
}
