namespace educodeai_server.DTOs.RutTienGiangVien
{
    public class NganHangItemDTO
    {
        /// <summary>Mã nội bộ (khóa chọn trong dropdown).</summary>
        public string Ma { get; set; } = string.Empty;

        /// <summary>Tên hiển thị.</summary>
        public string TenHienThi { get; set; } = string.Empty;

        /// <summary>Mã dùng cho VietQR (img.vietqr.io).</summary>
        public string MaVietQr { get; set; } = string.Empty;

        /// <summary>Mã BIN 6 số (API tra cứu STK VietQR.io).</summary>
        public string? MaBin { get; set; }
    }
}
