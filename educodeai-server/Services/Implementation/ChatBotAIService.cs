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
            var promptBuilder = new StringBuilder();
            promptBuilder.AppendLine(@"Bạn là 'Trợ lý EduCodeAI' - một chuyên gia lập trình tận tâm.
        === NGUYÊN TẮC: ===
        1. Xưng hô là 'mình', gọi người dùng là 'bạn'. Thân thiện, ngắn gọn.
        2. KHÔNG BAO GIỜ viết sẵn code giải bài tập hoàn chỉnh. Chỉ đưa ra gợi ý, ví dụ minh họa hoặc chỉ ra lỗi sai để học viên tự suy nghĩ.
        3. MỞ RỘNG KIẾN THỨC: Nếu học viên hỏi các kiến thức lập trình, công nghệ (dù không có trong bài học hiện tại), HÃY THOẢI MÁI GIẢI ĐÁP bằng kiến thức chuyên môn của bạn.
        4. TỪ CHỐI NGHIÊM NGẶT: Tuyệt đối không trả lời các chủ đề ngoài ngành IT/Công nghệ (như nấu ăn, chính trị, thể thao, tin tức giải trí...). Hãy khéo léo lái câu chuyện về việc học lập trình.
        5. Trình bày code (nếu có) bằng Markdown rõ ràng.");

            if (!string.IsNullOrWhiteSpace(yeuCau.TieuDeBaiHoc))
            {
                promptBuilder.AppendLine("\n=== NGỮ CẢNH HIỆN TẠI: ===");
                promptBuilder.AppendLine($"Học viên đang học bài: '{yeuCau.TieuDeBaiHoc}'.");
                promptBuilder.AppendLine($"Tài liệu bài học:\n\"\"\"\n{yeuCau.NoiDungBaiHoc}\n\"\"\"\n");
                promptBuilder.AppendLine("HƯỚNG DẪN: Ưu tiên dùng tài liệu trên nếu câu hỏi liên quan đến bài học. Nếu học viên hỏi chủ đề lập trình khác, hãy dùng kiến thức nền tảng của bạn để hỗ trợ.");
            }
            else
            {
                promptBuilder.AppendLine("\n=== NGỮ CẢNH HIỆN TẠI: ===");
                promptBuilder.AppendLine("Học viên đang ở trang chung. Hãy trả lời kiến thức tổng quát về lập trình và nền tảng.");
            }

            promptBuilder.AppendLine("\n=== LỊCH SỬ TRÒ CHUYỆN ===");
            if (yeuCau.LichSuChat != null && yeuCau.LichSuChat.Count > 0)
            {
                var lichSuNganGoc = yeuCau.LichSuChat.TakeLast(10).ToList();
                foreach (var tinNhan in lichSuNganGoc)
                {
                    string tenNguoiNoi = tinNhan.VaiTro.ToLower() == "user" ? "HỌC VIÊN" : "TRỢ LÝ EDUCODEAI";
                    promptBuilder.AppendLine($"{tenNguoiNoi}: {tinNhan.NoiDung}");
                }
            }
            else
            {
                promptBuilder.AppendLine("(Chưa có lịch sử)");
            }

            promptBuilder.AppendLine("\nTRỢ LÝ EDUCODEAI:");
            string finalPrompt = promptBuilder.ToString();

            try
            {
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
                phuDeKhaiThac = await GetPhuDeVideoHelper.LayPhuDeYoutube(yeuCau.VideoId);
            }

            string promptTomTat = "";
            if (!string.IsNullOrWhiteSpace(phuDeKhaiThac))
            {
                promptTomTat = $@"
                    Bạn là một chuyên gia tóm tắt nội dung giáo dục chuyên ngành Công nghệ thông tin. 
                    Dưới đây là phụ đề thô (transcript) từ YouTube của bài học: '{yeuCau.TieuDe}'. 

                    NHIỆM VỤ CỦA BẠN: Thực hiện 'Lọc nhiễu chuyên sâu' và 'Trích xuất kiến thức chuẩn' theo các quy tắc:
                    1. SỬA LỖI & DỊCH THUẬT NGỮ: Ví dụ: 'a sinh' -> 'Async', 'bi?n' -> 'Biến'.
                    2. LOẠI BỎ: Lời chào, lời tạm biệt, kêu gọi Like/Subscribe, từ đệm vô nghĩa.
                    3. TRÍCH XUẤT: Chỉ giữ lại định nghĩa, khái niệm, các bước thực hiện.
                    4. ĐỊNH DẠNG: Markdown chuẩn, in đậm các **Thuật ngữ chuyên môn**.

                    === NỘI DUNG PHỤ ĐỀ THÔ ===
                    {phuDeKhaiThac}";
            }
            else
            {
                promptTomTat = $@"
                    Bạn là một trợ lý học tập thông minh. Video bài học này không có phụ đề.
                    Tuy nhiên, bài học có tiêu đề là: '{yeuCau.TieuDe}'.
                    Dựa vào kiến thức chuyên môn của bạn về lập trình và công nghệ, hãy tóm tắt các kiến thức cốt lõi nhất mà một học viên cần nắm được khi học về chủ đề này.
                    Hãy trình bày ngắn gọn, in đậm từ khóa quan trọng và dùng gạch đầu dòng.";
            }

            try
            {
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

            int giayCuoiCung = 0;
            if (!string.IsNullOrEmpty(phuDe))
            {
                var matches = Regex.Matches(phuDe, @"\[(\d{2}):(\d{2})\]");
                if (matches.Count > 0)
                {
                    var lastMatch = matches[matches.Count - 1];
                    giayCuoiCung = int.Parse(lastMatch.Groups[1].Value) * 60 + int.Parse(lastMatch.Groups[2].Value);
                }
            }

            string prompt = $@"Bạn là chuyên gia thiết kế bài giảng. 
                Dựa vào nội dung dưới đây, hãy chia video thành các phần (chapters) và tạo quiz.
                THÔNG TIN QUAN TRỌNG: Video này kết thúc tại giây thứ {giayCuoiCung}. Bạn PHẢI phân tích và chia Chapter cho đến tận giây cuối cùng.

                NỘI DUNG VIDEO:
                {nguCanhNoiDung}

                QUY TẮC BẮT BUỘC (PHẢI TUÂN THỦ NGHIÊM NGẶT):
                1. BAO PHỦ TOÀN BỘ VIDEO: Phải chia Chapter từ giây 0 cho đến tận giây {giayCuoiCung}. Tuyệt đối không được dừng lại ở giữa video.
                2. CHIA CHAPTER HỢP LÝ: Mỗi chapter nên dài từ 2.5 - 4.5 phút. Đừng chia quá vụn vặt nhưng cũng đừng để quá dài dẫn đến thiếu Quiz.
                3. SỐ LƯỢNG MỐC QUIZ DỰ KIẾN:
                   - Video < 5 phút: 1 mốc Quiz.
                   - Video 5 - 10 phút: 2 mốc Quiz.
                   - Video > 10 phút: 3 mốc Quiz.
                   (Hãy cố gắng đạt được số mốc này nếu nội dung kiến thức cho phép).
                4. VỊ TRÍ CHIẾN LƯỢC: Quiz đầu tiên nên xuất hiện sau khoảng 2.5 phút đầu video. Các mốc Quiz tiếp theo nên cách nhau từ 2.5 - 3.5 phút.
                5. ĐỊNH DẠNG: Trả về DUY NHẤT một khối JSON hợp lệ.

                Cấu trúc JSON:
                {{
                  ""Chapters"": [
                    {{
                      ""ThoiGianBatDau"": 0,
                      ""ThoiGianKetThuc"": 200,
                      ""KienThucChinh"": ""Tiêu đề phần"",
                      ""BatBuoc"": true,
                      ""Quizzes"": [
                        {{
                          ""CauHoi"": ""..."",
                          ""DapAnA"": ""..."",
                          ""DapAnB"": ""..."",
                          ""DapAnC"": ""..."",
                          ""DapAnD"": ""..."",
                          ""DapAnDung"": ""A""
                        }}
                      ]
                    }}
                  ]
                }}";

            try
            {
                string rawResponse = await _gemini.GenerateAsync(prompt);
                rawResponse = ChuanHoaJsonTuAIHelper.LayTextChatTuAI(rawResponse);
                rawResponse = LamSachJson(rawResponse);

                var aiResult = JsonSerializer.Deserialize<VideoAnalysisResultDTO>(rawResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (aiResult?.Chapters != null && aiResult.Chapters.Any())
                {
                    int totalDuration = aiResult.Chapters.Max(c => c.ThoiGianKetThuc);
                    int maxAllowedMarkers = 3;
                    if (totalDuration < 300) maxAllowedMarkers = 1; 
                    else if (totalDuration < 600) maxAllowedMarkers = 2;

                    int chapterWithQuizCount = 0;
                    int lastQuizTimeRecord = -300; 
                    int minGapSeconds = 150; 
                    int minStartTime = 150; 

                    foreach (var chapter in aiResult.Chapters)
                    {
                        if (chapter.Quizzes != null && chapter.Quizzes.Count > 0)
                        {
                            if (chapter.ThoiGianKetThuc < minStartTime || 
                                chapterWithQuizCount >= maxAllowedMarkers || 
                                (chapter.ThoiGianBatDau - lastQuizTimeRecord) < minGapSeconds)
                            {
                                chapter.Quizzes = new List<VideoQuizDTO>(); 
                            }
                            else
                            {
                                chapterWithQuizCount++;
                                lastQuizTimeRecord = chapter.ThoiGianBatDau;
                            }
                        }
                    }
                }

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