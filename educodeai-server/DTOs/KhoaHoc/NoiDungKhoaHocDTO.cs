namespace educodeai_server.DTOs.KhoaHoc
{
    public class BaiHocDTO
    {
        public int Id { get; set; }
        public string TieuDe { get; set; } = null!;
        public string LoaiBaiHoc { get; set; } = null!;
        public string NoiDung { get; set; } = null!;
        public string? ThoiLuong { get; set; }
        public int ThuTu { get; set; }
        public string? LinkVideo { get; set; }

    }

    public class ChuongHocDTO
    {
        public int Id { get; set; }
        public string TieuDe { get; set; } = null!;
        public int ThuTu { get; set; }
        public List<BaiHocDTO> DanhSachBaiHoc { get; set; } = new List<BaiHocDTO>();
    }
}
