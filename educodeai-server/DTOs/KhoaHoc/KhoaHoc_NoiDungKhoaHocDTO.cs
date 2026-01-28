namespace educodeai_server.DTOs.KhoaHoc
{
    public class KhoaHoc_NoiDungKhoaHocDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; }
        public string Slug { get; set; }   
        public List<ChuongHoc_NoiDungKhoaHocDTO> DanhSachChuongHoc { get; set; }
    }
}
