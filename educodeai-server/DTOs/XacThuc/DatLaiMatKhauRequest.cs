namespace educodeai_server.DTOs.XacThuc
{
    public class DatLaiMatKhauRequest
    {
        public string Email { get; set; }
        public string MatKhauMoi { get; set; }
        public string OtpCode { get; set; }
        public string MaThietBi { get; set; }
        public string TenThietBi { get; set; }
    }
}
