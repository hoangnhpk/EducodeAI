using educodeai_server.DTOs.BaiTap;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Repository.Implementation;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;

namespace educodeai_server.Services.Implementation
{
    public class QuizService : IQuizService
    {
        private readonly IBaiTapRepository _baiTapRepository;
        private readonly IGeminiAIService _gemini;

        public QuizService(IBaiTapRepository baiTapRepository, IGeminiAIService gemini)
        {
            _baiTapRepository = baiTapRepository;
            _gemini = gemini;
        }

        // Hàm xử lý logic tạo quiz
        public async Task<int> CreateQuizAsync(CreateQuizDTO dto)
        {
            // Bắt lỗi nhẹ nhàng sương sương
            if (dto.MaBaiHoc <= 0)
            {
                throw new ArgumentException("Ủa alo, mã bài học không hợp lệ nè bạn êy!");
            }

            // Map data từ túi DTO sang Model Bài Tập
            var baiTap = new BaiTapModel
            {
                MaBaiHoc = dto.MaBaiHoc
            };

            // Map data từ túi DTO sang Model Quiz
            var quiz = new BaiTap_QuizModel
            {
                ThoiGianLamBai = dto.ThoiGianLamBai,
                DiemCanDat = dto.DiemCanDat,
                ChoPhepLamLai = dto.ChoPhepLamLai,
                DaoCauHoi = dto.DaoCauHoi,
                DuLieuCauHoi = dto.DuLieuCauHoi
            };

            // Gọi đệ Repository chốt sổ vào Database
            return await _baiTapRepository.CreateQuizAsync(baiTap, quiz);
        }
        public async Task<string> GenerateQuizByAIAsync(GenerateQuizAIDTO dto)
        {
            // 1. Lấy nội dung bài học từ DB
            var noiDungBaiHoc = await _baiTapRepository.GetNoiDungBaiHocAsync(dto.MaBaiHoc);

            if (string.IsNullOrEmpty(noiDungBaiHoc))
            {
                throw new Exception("Úi, bài học này chưa có nội dung, AI không biết đường nào mà lần đâu Khôi ơi!");
            }

            // 2. Viết tâm thư (Prompt) cho AI
            var outputSchema = """
            {
                "Tiêu đề": "",
                "Độ khó": "",
                "Câu hỏi": [
                  {
                    "Id": 1,
                    "NoiDung": "Nội dung câu hỏi...",
                    "LuaChon": [
                        "",
                        "",
                        "",
                        ""
                    ],
                    "DapAnDung": "0",
                  }
                ]
            }
            """;

            var prompt = $"""
                Bạn là một chuyên gia giáo dục và tạo đề thi của hệ thống EduCodeAI.
                Dựa vào NỘI DUNG BÀI HỌC dưới đây, hãy tạo ra đúng {dto.SoCauHoi} câu hỏi trắc nghiệm với độ khó: {dto.DoKho}.

                == TIÊU ĐỀ VÀ NỘI DUNG TÓM TẮT TỪ NGƯỜI DÙNG ==
                - Tiêu đề: {dto.TieuDe}
                - Nội dung tóm tắt: {dto.NoiDungTomTat}

                === NỘI DUNG BÀI HỌC ===
                {noiDungBaiHoc}

                === YÊU CẦU BẮT BUỘC ===
                1. Đọc kỹ nội dung và tạo câu hỏi bám sát kiến thức.
                2. Mỗi câu hỏi có 4 đáp án (A, B, C, D) và chỉ có 1 đáp án đúng.
                3. Trường "dapAnDung" chỉ được điền 1 ký tự: "A", "B", "C", hoặc "D".
                4. Phải có lời giải thích ngắn gọn, dễ hiểu cho mỗi câu.
                5. Đảm bảo các câu hỏi không bị trùng lặp ý tưởng và nội dung.

                === OUTPUT FORMAT (JSON) ===
                Cấu trúc mảng JSON phải GIỐNG HỆT schema dưới đây. 
                KHÔNG giải thích, KHÔNG suy luận, KHÔNG dùng markdown. Chỉ trả về JSON thuần:
                {outputSchema}
                """;

            // 3. Gọi Gemini nhả não
            var aiResult = await _gemini.GenerateAsync(prompt);
            Console.WriteLine("Output thô từ Gemini: " + aiResult);

            // 4. Chuẩn hóa chuỗi JSON (Dùng lại đồ xịn của Khôi)
            var resultChuanHoa = ChuanHoaJsonTuAI.ChuanHoa(aiResult);
            Console.WriteLine("Output sau khi chuẩn hóa: " + resultChuanHoa);

            return resultChuanHoa; // Trả nguyên cục JSON về cho FE hiển thị ở Màn 2 (Preview)
        }
    }

}
