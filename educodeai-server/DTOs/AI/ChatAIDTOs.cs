namespace educodeai_server.DTOs.AI
{
    public class TinNhanChatDTO
    {
        // Vai trò: Bắt buộc là "user" (học viên) hoặc "assistant" (bot AI)
        public string VaiTro { get; set; } = string.Empty;

        // Nội dung của tin nhắn đó
        public string NoiDung { get; set; } = string.Empty;
    }

    // 2. Class đại diện cho TOÀN BỘ cục dữ liệu Frontend gửi lên mỗi lần bấm "Enter"
    public class YeuCauChatAIDTO
    {
        // Mảng chứa toàn bộ lịch sử chat trước đó (Để AI đọc và nhớ lại ngữ cảnh câu chuyện)
        public List<TinNhanChatDTO> LichSuChat { get; set; } = new();

        // Ngữ cảnh bài học hiện tại (Frontend sẽ truyền null nếu đang ở trang chủ/không học bài)
        public int? MaBaiHoc { get; set; }
        public string? TieuDeBaiHoc { get; set; }
        public string? NoiDungBaiHoc { get; set; }
        public double? ThoiGianVideo { get; set; }
    }
}
