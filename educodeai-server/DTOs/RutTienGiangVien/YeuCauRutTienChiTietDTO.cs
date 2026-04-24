namespace educodeai_server.DTOs.RutTienGiangVien
{
    public class YeuCauRutTienChiTietDTO
    {
        public int MaYeuCauRutTien { get; set; }
        public int MaGiangVien { get; set; }
        public string TenGiangVien { get; set; } = string.Empty;
        public string? EmailGiangVien { get; set; }
        public decimal SoTienYeuCau { get; set; }
        public string TrangThaiYeuCau { get; set; } = string.Empty;
        public string LoaiTien { get; set; } = "VND";
        public string MaNganHangNhan { get; set; } = string.Empty;
        public string SoTaiKhoanNhan { get; set; } = string.Empty;
        public string TenTaiKhoanNhan { get; set; } = string.Empty;
        public string? NoiDungChuyenKhoan { get; set; }
        public string? DuongDanAnhQr { get; set; }
        public decimal? SoTienDaChuyen { get; set; }
        public long? MaGiaoDichSePay { get; set; }
        public string? GhiChuAdmin { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? DuyetLuc { get; set; }
        public DateTime? ChuyenKhoanThanhCongLuc { get; set; }
    }
}
