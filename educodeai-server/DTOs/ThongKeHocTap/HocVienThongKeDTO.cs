namespace educodeai_server.DTOs.ThongKeHocTap
{
    public class HocVienThongKeDTO
    {
        public int MaNguoiDung { get; set; }
        public string HoTen { get; set; } = null!;
        public string Email { get; set; } = null!;
        public double TienDo { get; set; }
        public int SoBaiDaNop { get; set; }
        public double GioHoc { get; set; }
        public string TrangThai { get; set; } = null!;
    }
}

