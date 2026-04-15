using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.VideoAI;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using System.Text.Json;
using System.Text;
using System.Text.RegularExpressions;

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
        3. MỞ RỘNG KIẾN THỨC: Nếu học viên hỏi các kiến thức lập trình, công nghệ (dù không có trong bài học hiện tại), HÃY THOẢI MÁI GIẢI ĐÁP bằng kiến thức chuyên môn của bạn.
        4. TỪ CHỐI NGHIÊM NGẶT: Tuyệt đối không trả lời các chủ đề ngoài ngành IT/Công nghệ (như nấu ăn, chính trị, thể thao, tin tức giải trí...). Hãy khéo léo lái câu chuyện về việc học lập trình.
        5. Trình bày code (nếu có) bằng Markdown rõ ràng.");

            // 2. NHỒI NGỮ CẢNH BÀI HỌC
            if (!string.IsNullOrWhiteSpace(yeuCau.TieuDeBaiHoc))
            {
                promptBuilder.AppendLine("\n=== NGỮ CẢNH HIỆN TẠI: ===");
                promptBuilder.AppendLine($"Học viên đang học bài: '{yeuCau.TieuDeBaiHoc}'.");
                promptBuilder.AppendLine($"Tài liệu bài học:\n\"\"\"\n{yeuCau.NoiDungBaiHoc}\n\"\"\"\n");
                // SỬA DÒNG NÀY: Chuyển từ "bắt buộc" sang "ưu tiên"
                promptBuilder.AppendLine("HƯỚNG DẪN: Ưu tiên dùng tài liệu trên nếu câu hỏi liên quan đến bài học. Nếu học viên hỏi chủ đề lập trình khác, hãy dùng kiến thức nền tảng của bạn để hỗ trợ.");
            }
            else
            {
                promptBuilder.AppendLine("\n=== NGỮ CẢNH HIỆN TẠI: ===");
                promptBuilder.AppendLine("Học viên đang ở trang chung. Hãy trả lời kiến thức tổng quát về lập trình và nền tảng.");
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
        public async Task<VideoAnalysisResultDTO?> PhanTichVideoAsync(string linkVideo, string tieuDeBaiHoc)
        {
            string videoId = LayVideoIdTuLink(linkVideo);
            string phuDe = string.Empty;

            if (!string.IsNullOrEmpty(videoId))
            {
                phuDe = await GetPhuDeVideoHelper.LayPhuDeYoutube(videoId);
            }

            string nguCanhNoiDung = string.IsNullOrEmpty(phuDe)
                ? $"Bài học có tiêu đề: '{tieuDeBaiHoc}'. Hãy ước lượng nội dung và thời gian hợp lý."
                : $"Phụ đề video (có thời gian thực tế):\n{phuDe}";

            string prompt = $@"Bạn là chuyên gia giáo dục phân tích video học lập trình.
                Dựa vào nội dung bài học sau, hãy thực hiện 2 nhiệm vụ:
                1. Chia video thành các phần kiến thức (chapters) hợp lý.
                2. Tạo các câu hỏi trắc nghiệm (quiz) tương tác ngay trong video.

                NỘI DUNG/PHỤ ĐỀ VIDEO:
                {nguCanhNoiDung}

                YÊU CẦU QUAN TRỌNG:
                - Tổng số lượng Quiz cho cả video: TỐI ĐA 3 câu hỏi.
                - Chỉ tạo Quiz tại những mốc thời gian chứa kiến thức CỐT LÕI, QUAN TRỌNG hoặc DỄ GÂY NHẦM LẪN.
                - Nếu nội dung video ngắn hoặc kiến thức đơn giản, có thể tạo ít hơn 3 Quiz hoặc KHÔNG tạo Quiz nào (mảng Quizzes để trống).
                - Mỗi Chapter không nhất thiết phải có Quiz.

                Yêu cầu định dạng JSON CHÍNH XÁC (không có markdown, không có text thừa):
                {{
                  ""Chapters"": [
                    {{
                      ""ThoiGianBatDau"": 0,
                      ""ThoiGianKetThuc"": 60,
                      ""KienThucChinh"": ""Tên kiến thức ngắn gọn"",
                      ""BatBuoc"": true,
                      ""Quizzes"": [
                        {{
                          ""CauHoi"": ""Câu hỏi trắc nghiệm?"",
                          ""DapAnA"": ""Đáp án A"",
                          ""DapAnB"": ""Đáp án B"",
                          ""DapAnC"": ""Đáp án C"",
                          ""DapAnD"": ""Đáp án D"",
                          ""DapAnDung"": ""A""
                        }}
                      ]
                    }}
                  ]
                }}

                Lưu ý:
                - ThoiGianBatDau và ThoiGianKetThuc tính bằng GIÂY.
                - BatBuoc = true nếu đây là kiến thức quan trọng.
                - Trả về DUY NHẤT một khối JSON hợp lệ.";

            try
            {
                string rawResponse = await _gemini.GenerateAsync(prompt);
                rawResponse = ChuanHoaJsonTuAIHelper.LayTextChatTuAI(rawResponse);
                rawResponse = LamSachJson(rawResponse);

                var aiResult = JsonSerializer.Deserialize<VideoAnalysisResultDTO>(rawResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                return aiResult;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ChatBotAIService] Lỗi phân tích video AI: {ex.Message}");
                return null;
            }
        }

        private static string LayVideoIdTuLink(string link)
        {
            try
            {
                var regExp = new Regex(@"(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)");
                var match = regExp.Match(link);
                return match.Success ? match.Groups[1].Value : string.Empty;
            }
            catch { return string.Empty; }
        }

        private static string LamSachJson(string raw)
        {
            raw = raw.Trim();
            if (raw.StartsWith("```"))
            {
                int newline = raw.IndexOf('\n');
                if (newline >= 0) raw = raw.Substring(newline + 1);
                int closing = raw.LastIndexOf("```");
                if (closing >= 0) raw = raw.Substring(0, closing);
                raw = raw.Trim();
            }
            int start = raw.IndexOf('{');
            int end = raw.LastIndexOf('}');
            if (start >= 0 && end > start)
                return raw.Substring(start, end - start + 1);
            return raw;
        }
    }
}