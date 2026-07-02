namespace educodeai_server.DTOs.MaGiamGia
{
    public class MaGiamGiaItemDTO
    {
        public int MaVoucher { get; set; }
        public string Code { get; set; } = string.Empty;
        public string TenChuongTrinh { get; set; } = string.Empty;
        public string LoaiGiamGia { get; set; } = string.Empty;
        public decimal GiaTriGiam { get; set; }
        public decimal? GiamToiDa { get; set; }
        public int SoLuongToiDa { get; set; }
        public int SoLuongDaDung { get; set; }
        public bool KichHoat { get; set; }
        public DateTime BatDauAt { get; set; }
        public DateTime KetThucAt { get; set; }
        public string PhamViApDung { get; set; } = string.Empty;
        public IReadOnlyList<int> DanhSachMaKhoaHoc { get; set; } = Array.Empty<int>();
    }
}
