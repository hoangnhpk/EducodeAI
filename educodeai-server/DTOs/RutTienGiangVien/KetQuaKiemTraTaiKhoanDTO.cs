namespace educodeai_server.DTOs.RutTienGiangVien
{
    public class KetQuaKiemTraTaiKhoanDTO
    {
        public bool TimThayTaiKhoan { get; set; }

        public bool TenKhop { get; set; }

        public string? TenChuTaiKhoanTuVietQr { get; set; }

        public string ThongBao { get; set; } = string.Empty;

        /// <summary>True khi chưa cấu hình VietQrLookup (ClientId, ApiKey) trên server.</summary>
        public bool ThieuCauHinhVietQrLookup { get; set; }
    }
}
