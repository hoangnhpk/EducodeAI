using System.Text.Json.Serialization;

namespace educodeai_server.DTOs.BaiTapThucHanh
{
    public class BaiHocTreeDto
    {
        public int MaBaiHoc { get; set; }
        public string TieuDe { get; set; } = string.Empty;
        public string LoaiBaiHoc { get; set; } = string.Empty;
        public int? MaBaiTapThucHanh { get; set; }
    }

    public class ChuongHocTreeDto
    {
        public int MaChuong { get; set; }
        public string TenChuong { get; set; } = string.Empty;
        public List<BaiHocTreeDto> DanhSachBaiHoc { get; set; } = new();
    }

    public class KhoaHocTreeDto
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public List<ChuongHocTreeDto> DanhSachChuong { get; set; } = new();
    }
}
