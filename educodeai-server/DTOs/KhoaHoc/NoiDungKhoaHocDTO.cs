namespace educodeai_server.DTOs.KhoaHoc
{
    public class BaiHoc_NoiDungKhoaHocDTO
    {
        public int Id { get; set; }
        public string TieuDe { get; set; } = null!;
        public string LoaiBaiHoc { get; set; } = null!;
        public string? NoiDung { get; set; }
        public string? ThoiLuong { get; set; }
        public int ThuTu { get; set; }
        public string? LinkVideo { get; set; }

    }

    public class ChuongHoc_NoiDungKhoaHocDTO
    {
        public int Id { get; set; }
        public string TieuDe { get; set; } = null!;
        public int ThuTu { get; set; }
        public List<BaiHoc_NoiDungKhoaHocDTO> DanhSachBaiHoc { get; set; } = new List<BaiHoc_NoiDungKhoaHocDTO>();
    }

    public class KhoaHoc_NoiDungKhoaHocDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = null!;
        public List<ChuongHoc_NoiDungKhoaHocDTO> DanhSachChuongHoc { get; set; } = new List<ChuongHoc_NoiDungKhoaHocDTO>();
    }
}
