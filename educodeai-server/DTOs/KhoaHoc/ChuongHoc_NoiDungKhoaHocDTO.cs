namespace educodeai_server.DTOs.KhoaHoc
{
    public class ChuongHoc_NoiDungKhoaHocDTO
    {
        public int Id { get; set; }
        public string TieuDe { get; set; } = string.Empty;
        public int ThuTu { get; set; }

        public List<BaiHoc_NoiDungKhoaHocDTO> DanhSachBaiHoc { get; set; }
            = new();
    }
}
