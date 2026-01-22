namespace educodeai_server.DTOs.NguoiDung
{
    public class LoginDto
    {
        // Đổi tên từ Email thành UsernameOrEmail để rõ nghĩa hơn cho Frontend
        public string UsernameOrEmail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}