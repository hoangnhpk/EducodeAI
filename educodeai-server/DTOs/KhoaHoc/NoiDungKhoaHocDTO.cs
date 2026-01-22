namespace educodeai_server.DTOs.KhoaHoc
{
    public class BaiHoc_NoiDungKhoaHocDTO
    {
        public int Id { get; set; }
        public string TieuDe { get; set; } = null!;
        public string LoaiBaiHoc { get; set; } = null!;
        public string? NoiDung { get; set; }
        public int? ThoiLuong { get; set; }
        public int ThuTu { get; set; }
        public string? LinkVideo { get; set; }
        public bool DaXem { get; set; } = false;

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
        public string? Slug { get; set; }
        public List<ChuongHoc_NoiDungKhoaHocDTO> DanhSachChuongHoc { get; set; } = new List<ChuongHoc_NoiDungKhoaHocDTO>();
    }

    public class TienDoBaiHocDTO
    {
        public int MaBaiHoc { get; set; }
        public int MaNguoiDung { get; set; }
        public bool DaXem { get; set; }
        public int ThoiGianHoc { get; set; }
    }
}
