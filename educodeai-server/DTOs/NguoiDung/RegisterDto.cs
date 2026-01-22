namespace educodeai_server.DTOs.NguoiDung
{
    public class RegisterDto
    {
        public string HoTen { get; set; }
        public string Email { get; set; }
        public string TaiKhoan { get; set; }
        public string MatKhau { get; set; }
    }

    public class VerifyOtpDto
    {
        public string Email { get; set; }
        public string Otp { get; set; }
        public RegisterDto UserData { get; set; } // Chứa thông tin để lưu sau khi verify
    }
}