namespace educodeai_server.DTOs.NguoiDung
{
    public class GoogleLoginRequest
    {
        // id_token (JWT) do Google Identity Services trả về; backend verify chữ ký/issuer/audience.
        // Email/Name/Picture do client gửi KHÔNG còn được tin — chỉ dùng identity đã verify từ token (E.5).
        public string Credential { get; set; } = string.Empty;
    }
}
