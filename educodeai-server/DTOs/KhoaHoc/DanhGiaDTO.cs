namespace educodeai_server.DTOs.KhoaHoc
{
    public class DanhGiaDTO
    {
        public int MaKhoaHoc { get; set; }
        public int MaNguoiDung { get; set; }
        public int SoSao { get; set; } // Sẽ giới hạn 1 -> 5 ở Controller
        public string NhanXet { get; set; } = string.Empty;
    }
}
