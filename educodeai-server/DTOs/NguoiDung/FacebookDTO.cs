namespace EduCodeAI.DTOs
{
    public class FacebookDTO
    {
        // E.6: access token do Facebook SDK trả về; backend verify với Graph API rồi lấy profile từ đó.
        // Các field email/name/picture/userID client gửi kèm chỉ tham khảo, KHÔNG được tin.
        public string? AccessToken { get; set; }

        public string Email { get; set; }
        public string Name { get; set; }
        public string Picture { get; set; }
        public string UserID { get; set; }
    }
}