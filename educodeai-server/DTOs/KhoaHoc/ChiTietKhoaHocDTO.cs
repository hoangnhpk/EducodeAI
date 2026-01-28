namespace educodeai_server.DTOs.KhoaHoc
{
    public class ChiTietKhoaHocDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = null!;
        public string? MoTa { get; set; }
        public string? HinhAnh { get; set; }

        
        public double DiemDanhGiaTB { get; set; }

        public string TenGiangVien { get; set; } = null!;
        public string? AnhGiangVien { get; set; }

        public List<ChuongHoc_NoiDungKhoaHocDTO> ChuongHocs { get; set; }
            = new();
    }

}
