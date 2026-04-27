namespace educodeai_server.DTOs.QuaTang
{
    public class KetQuaTangKhoaHocDTO
    {
        public int MaQuaTang { get; set; }
        public int MaKhoaHoc { get; set; }
        public int MaNguoiNhan { get; set; }
        public int MaNguoiTang { get; set; }
        public string LoaiNguoiTang { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public bool DaGuiEmailNguoiTang { get; set; }
        public bool DaGuiEmailNguoiNhan { get; set; }
        public string ThongBao { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
