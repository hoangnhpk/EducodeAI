namespace educodeai_server.DTOs.BaiTap
{
    public class CreateQuizDTO
    {
        public int MaBaiHoc { get; set; }
        public int ThoiGianLamBai { get; set; }
        public double DiemCanDat { get; set; }
        public bool ChoPhepLamLai { get; set; }
        public bool DaoCauHoi { get; set; }

        // Nhét cả mảng câu hỏi (dạng chuỗi JSON), Tiêu đề, Độ khó vào đây luôn 
        // vì DB mình đang thiết kế lưu cục JSON siêu to khổng lồ này!
        public string DuLieuCauHoi { get; set; } = string.Empty;
    }
    public class GenerateQuizAIDTO
    {
        public int MaBaiHoc { get; set; }
        public string TieuDe { get; set; } = null!; // Ví dụ: "Quiz về Biến và Kiểu Dữ Liệu trong C#"
        public string NoiDungTomTat { get; set; } = null!; // Tóm tắt nội dung bài học để AI dựa vào đó mà tạo câu hỏi
        public string DoKho { get; set; } = null!; // Ví dụ: "Easy", "Medium", "Hard"
        public int SoCauHoi { get; set; }
        public string NgonNgu { get; set; } = string.Empty;
    }
}
