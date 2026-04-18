namespace educodeai_server.DTOs.RutTienGiangVien
{
    public class ThongTinViGiangVienDTO
    {
        public decimal TongDoanhThuDaGhiNhan { get; set; }
        public decimal TongDangChoXuLyRut { get; set; }
        public decimal TongDaChuyenKhoan { get; set; }
        public decimal SoDuKhaDung { get; set; }

        /// <summary>Mã VietQR đang lưu (dùng tạo QR).</summary>
        public string? MaNganHangNhanTien { get; set; }

        /// <summary>Mã chọn trong dropdown (Ma nội bộ, ví dụ STB).</summary>
        public string? MaNganHangChon { get; set; }

        public string? SoTaiKhoanNhanTien { get; set; }
        public string? TenTaiKhoanNhanTien { get; set; }
    }
}
