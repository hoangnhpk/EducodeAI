using educodeai_server.DTOs.AI;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using System.Text;

namespace educodeai_server.Services.Implementation
{
    public class ChatBotAIService : IChatBotAIService
    {
        private readonly IGeminiAIService _gemini;

        public ChatBotAIService(IGeminiAIService gemini)
        {
            _gemini = gemini;
        }

        public async Task<string> TuVanHocTapAsync(YeuCauChatAIDTO yeuCau)
        {
            // 1. TẠO LUẬT LỆ CHO AI (System Prompt)
            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine(@"Bạn là 'Trợ lý EduCodeAI' - một chuyên gia lập trình tận tâm.
                === NGUYÊN TẮC: ===
                1. Xưng hô là 'mình', gọi người dùng là 'bạn'. Thân thiện, ngắn gọn.
                2. KHÔNG BAO GIỜ viết sẵn code giải bài tập hoàn chỉnh. Chỉ đưa ra gợi ý, ví dụ minh họa hoặc chỉ ra lỗi sai để học viên tự suy nghĩ.
                3. Từ chối trả lời các câu hỏi không liên quan đến công nghệ, lập trình hoặc khóa học.
                4. Trình bày code (nếu có) bằng Markdown rõ ràng.");

            // 2. NHỒI NGỮ CẢNH BÀI HỌC
            if (!string.IsNullOrWhiteSpace(yeuCau.TieuDeBaiHoc))
            {
                promptBuilder.AppendLine("\n=== NGỮ CẢNH HIỆN TẠI: ===");
                promptBuilder.AppendLine($"Học viên đang học bài: '{yeuCau.TieuDeBaiHoc}'.");
                promptBuilder.AppendLine($"Tài liệu bài học:\n\"\"\"\n{yeuCau.NoiDungBaiHoc}\n\"\"\"\n");
                promptBuilder.AppendLine("HÃY DỰA VÀO TÀI LIỆU NÀY để trả lời.");
            }
            else
            {
                promptBuilder.AppendLine("\n=== NGỮ CẢNH HIỆN TẠI: ===");
                promptBuilder.AppendLine("Học viên đang ở trang chung. Trả lời kiến thức tổng quát.");
            }

            // 3. BIẾN LỊCH SỬ CHAT THÀNH ĐOẠN HỘI THOẠI TEXT CHUNG
            promptBuilder.AppendLine("\n=== LỊCH SỬ TRÒ CHUYỆN ===");

            if (yeuCau.LichSuChat != null && yeuCau.LichSuChat.Count > 0)
            {
                var lichSuNganGoc = yeuCau.LichSuChat.TakeLast(10).ToList();

                foreach (var tinNhan in lichSuNganGoc)
                {
                    // Chuyển role thành tên người nói cho AI dễ hiểu
                    string tenNguoiNoi = tinNhan.VaiTro.ToLower() == "user" ? "HỌC VIÊN" : "TRỢ LÝ EDUCODEAI";
                    promptBuilder.AppendLine($"{tenNguoiNoi}: {tinNhan.NoiDung}");
                }
            }
            else
            {
                promptBuilder.AppendLine("(Chưa có lịch sử)");
            }

            // 4. CHỐT HẠ BẰNG DÒNG NÀY ĐỂ MỜI AI TRẢ LỜI CHO CÂU HỎI CUỐI CÙNG
            promptBuilder.AppendLine("\nTRỢ LÝ EDUCODEAI:");

            // Ép kiểu tất cả thành 1 chuỗi (string) duy nhất
            string finalPrompt = promptBuilder.ToString();

            try
            {
                // 5. GỌI HÀM CỦA BẠN NHƯ TRONG QUIZ SERVICE
                Console.WriteLine("Đang gửi ngữ cảnh và lịch sử cho Gemini...");
                string cauTraLoi = await _gemini.GenerateAsync(finalPrompt);

                var resultChuanHoa = ChuanHoaJsonTuAIHelper.LayTextChatTuAI(cauTraLoi);

                return resultChuanHoa;
            }
            catch (Exception loi)
            {
                Console.WriteLine($"Lỗi gọi AI: {loi.Message}");
                throw new Exception("Trợ lý AI đang bận, vui lòng thử lại sau.");
            }
        }

        public async Task<string> TomTatVideoAsync(YeuCauTomTatVideoDTO yeuCau)
        {
            string phuDeKhaiThac = "";
            if (!string.IsNullOrWhiteSpace(yeuCau.VideoId))
            {
                Console.WriteLine($"Đang cào phụ đề từ YouTube ID: {yeuCau.VideoId}...");
                phuDeKhaiThac = await GetPhuDeVideoHelper.LayPhuDeYoutube(yeuCau.VideoId);
            }

            // 2. CHUẨN BỊ LỜI LỆNH (PROMPT) CHO GEMINI
            string promptTomTat = "";

            if (!string.IsNullOrWhiteSpace(phuDeKhaiThac))
            {
                // Kịch bản 1: Lấy được phụ đề
                promptTomTat = $@"
                    Bạn là một chuyên gia tóm tắt nội dung giáo dục chuyên ngành Công nghệ thông tin. 
                    Dưới đây là phụ đề thô (transcript) từ YouTube của bài học: '{yeuCau.TieuDe}'. 

                    NHIỆM VỤ CỦA BẠN: Thực hiện 'Lọc nhiễu chuyên sâu' và 'Trích xuất kiến thức chuẩn' theo các quy tắc:

                    1. SỬA LỖI & DỊCH THUẬT NGỮ (Cực kỳ quan trọng): 
                       - Phụ đề YouTube thường bị lỗi font (dấu ?) hoặc nhận diện sai âm thanh tiếng Việt.
                       - Hãy dựa vào ngữ cảnh lập trình để suy luận từ đúng (Ví dụ: 'a sinh' -> 'Async', 'ph?m vi' -> 'Phạm vi', 'bi?n' -> 'Biến', 'clâu dơ' -> 'Closure').
                       - Chuyển các thuật ngữ được phiên âm sai về dạng chuẩn tiếng Anh chuyên ngành (Ví dụ: 'vê ri bồ' -> 'Variable').

                    2. LOẠI BỎ (Nhiễu): 
                       - Tuyệt đối loại bỏ lời chào, lời tạm biệt, kêu gọi Like/Subscribe.
                       - Bỏ qua các từ đệm vô nghĩa (ờ, à, thì là, mà lại, ok chưa, nhé các bạn...).
                       - Loại bỏ các câu nói lặp đi lặp lại do lỗi người nói hoặc lỗi nhận diện của máy.

                    3. TRÍCH XUẤT (Kiến thức cốt lõi):
                       - Chỉ giữ lại: Định nghĩa, Khái niệm, Các bước thực hiện, Lưu ý kỹ thuật quan trọng.
                       - Nếu phụ đề quá nát, hãy kết hợp với Tiêu đề bài học '{yeuCau.TieuDe}' để viết lại kiến thức một cách logic.

                    4. ĐỊNH DẠNG ĐẦU RA (Markdown chuẩn):
                       - **Tiêu đề**: Tên bài học (Viết hoa).
                       - **Tóm tắt tổng quan**: 1-2 câu ngắn gọn về giá trị của bài học.
                       - **Kiến thức cốt lõi**: Dùng danh sách gạch đầu dòng, in đậm các **Thuật ngữ chuyên môn**.
                       - **Ví dụ/Ghi chú**: Tóm tắt ngắn gọn ví dụ minh họa hoặc các lỗi thường gặp (nếu có).

                    === NỘI DUNG PHỤ ĐỀ THÔ ===
                    {phuDeKhaiThac}";
            }
            else
            {
                // Kịch bản 2: Video không có phụ đề -> Yêu cầu Gemini tự suy luận qua Tiêu đề
                promptTomTat = $@"
                    Bạn là một trợ lý học tập thông minh. Video bài học này không có phụ đề.
                    Tuy nhiên, bài học có tiêu đề là: '{yeuCau.TieuDe}'.
                    Dựa vào kiến thức chuyên môn của bạn về lập trình và công nghệ, hãy tóm tắt các kiến thức cốt lõi nhất mà một học viên cần nắm được khi học về chủ đề này.
                    Hãy trình bày ngắn gọn, in đậm từ khóa quan trọng và dùng gạch đầu dòng.";
                        }

            try
            {

                // 3. GỌI GEMINI (Giống code cũ của bạn)
                string rawJsonResult = await _gemini.GenerateAsync(promptTomTat);
                string ketQuaTomTat = ChuanHoaJsonTuAIHelper.LayTextChatTuAI(rawJsonResult);
                return ketQuaTomTat;
            }
            catch (Exception loi)
            {
                Console.WriteLine($"Lỗi: {loi.Message}");
                throw new Exception("Lỗi gọi AI tóm tắt.");
            }
        }
    }
}