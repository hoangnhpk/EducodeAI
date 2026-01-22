namespace educodeai_server.DTOs.NguoiDung
{
    public class HoSoHocVienDTO
    {
        public string HoTen { get; set; }
        public string Email { get; set; }
        public int VaiTro { get; set; }
        public string? AnhDaiDien { get; set; }

        public int TongKhoaHoc { get; set; }
        public int DaHoanThanh { get; set; }
        public int ChungChi { get; set; }

        public int GioDaHoc { get; set; }
        public int DangHoc { get; set; }
        public int TyLeHoanThanh { get; set; }
    }
}
