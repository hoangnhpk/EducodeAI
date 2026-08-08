using educodeai_server.Data;
using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.VideoAI;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text;
using System.Text.RegularExpressions;

namespace educodeai_server.Services.Implementation
{
    public class ChatBotAIService : IChatBotAIService
    {
        private readonly IGeminiAIService _gemini;
        private readonly EduCodeAIDbContext _dbContext;
        private readonly HttpClient _http;

        public ChatBotAIService(IGeminiAIService gemini, EduCodeAIDbContext dbContext, HttpClient http)
        {
            _gemini = gemini;
            _dbContext = dbContext;
            _http = http;
        }

        public async Task<string> TuVanHocTapAsync(YeuCauChatAIDTO yeuCau)
        {
            string systemInstruction = @"Bạn là 'Trợ lý EduCodeAI' - một chuyên gia tư vấn và giảng dạy lập trình tận tâm.
=== NGUYÊN TẮC QUAN TRỌNG: ===
1. Xưng hô là 'mình', gọi người dùng là 'bạn'. Thân thiện, ngắn gọn, súc tích.
2. HIỂU NGỮ CẢNH CŨ: Đọc kỹ LỊCH SỬ TRÒ CHUYỆN để tiếp nối tự nhiên với các câu hỏi/câu trả lời trước đó của học viên.
3. HIỂU NỘI DUNG VÀ PHỤ ĐỀ BÀI HỌC: Nếu có lời giảng phụ đề video hoặc nội dung bài học, hãy giải đáp sát với những gì giảng viên đã truyền tải trong video đó.
4. KHÔNG BAO GIỜ viết sẵn toàn bộ code bài tập hoàn chỉnh. Chỉ đưa ra gợi ý, giải thích tư duy hoặc ví dụ minh họa để học viên tự viết.
5. MỞ RỘNG KIẾN THỨC: Nếu học viên hỏi các kiến thức lập trình, công nghệ ngoài bài học, HÃY THOẢI MÁI GIẢI ĐÁP bằng kiến thức chuyên môn của bạn.
6. TỪ CHỐI NGHIÊM NGẶT: Tuyệt đối không trả lời các chủ đề ngoài ngành IT/Lập trình (như giải trí, nấu ăn, thể thao...).
7. Trình bày Markdown đẹp mắt với thẻ code tương ứng.";

            var promptBuilder = new StringBuilder();

            // Khai thác phụ đề video nếu có MaBaiHoc
            string phuDeVideo = string.Empty;
            string tieuDe = yeuCau.TieuDeBaiHoc ?? string.Empty;

            if (yeuCau.MaBaiHoc.HasValue && yeuCau.MaBaiHoc.Value > 0)
            {
                try
                {
                    var baiHoc = await _dbContext.BaiHocs.FindAsync(yeuCau.MaBaiHoc.Value);
                    if (baiHoc != null)
                    {
                        if (string.IsNullOrWhiteSpace(tieuDe)) tieuDe = baiHoc.TieuDe;

                        if (!string.IsNullOrWhiteSpace(baiHoc.SubtitleUrl))
                        {
                            try
                            {
                                string rawSub = await _http.GetStringAsync(baiHoc.SubtitleUrl);
                                var (cleanedText, _) = CleanVttOrSrtSubtitleWithTimestamps(rawSub);
                                phuDeVideo = cleanedText;
                            }
                            catch (Exception exSub)
                            {
                                Console.WriteLine($"[TuVanHocTap] Lỗi tải subtitle: {exSub.Message}");
                            }
                        }

                        if (string.IsNullOrWhiteSpace(phuDeVideo) && !string.IsNullOrWhiteSpace(baiHoc.LinkVideo))
                        {
                            string videoId = LayVideoIdTuLink(baiHoc.LinkVideo);
                            if (!string.IsNullOrEmpty(videoId))
                            {
                                phuDeVideo = await GetPhuDeVideoHelper.LayPhuDeYoutube(videoId);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[TuVanHocTap] Lỗi truy vấn DB cho bài học #{yeuCau.MaBaiHoc}: {ex.Message}");
                }
            }

            if (!string.IsNullOrWhiteSpace(tieuDe) || !string.IsNullOrWhiteSpace(phuDeVideo) || !string.IsNullOrWhiteSpace(yeuCau.NoiDungBaiHoc))
            {
                promptBuilder.AppendLine("=== NGỮ CẢNH NỘI DUNG VÀ PHỤ ĐỀ BÀI HỌC VỪA XEM ===");
                if (!string.IsNullOrWhiteSpace(tieuDe))
                {
                    promptBuilder.AppendLine($"Tiêu đề bài học: '{tieuDe}'");
                }
                if (!string.IsNullOrWhiteSpace(phuDeVideo))
                {
                    promptBuilder.AppendLine($"Lời giảng phụ đề trong video (có mốc thời gian [MM:SS]):\n{phuDeVideo.Substring(0, Math.Min(phuDeVideo.Length, 6000))}");
                }
                else if (!string.IsNullOrWhiteSpace(yeuCau.NoiDungBaiHoc))
                {
                    promptBuilder.AppendLine($"Nội dung bài học:\n{yeuCau.NoiDungBaiHoc.Substring(0, Math.Min(yeuCau.NoiDungBaiHoc.Length, 3000))}");
                }
                promptBuilder.AppendLine("HƯỚNG DẪN: Ưu tiên trả lời dựa trên nội dung/lời giảng video trên nếu học viên hỏi liên quan đến bài học.\n");
            }
            else
            {
                promptBuilder.AppendLine("=== NGỮ CẢNH BÀI HỌC ===");
                promptBuilder.AppendLine("Học viên đang ở trang tư vấn chung. Hãy tư vấn tổng quát về lập trình.\n");
            }

            promptBuilder.AppendLine("=== LỊCH SỬ TRÒ CHUYỆN TRƯỚC ĐÓ CỦA HỌC VIÊN VỚI AI ===");
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
                string cauTraLoi = await _gemini.GenerateAsync(finalPrompt, false, systemInstruction);
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
            string subtitleUrlToUse = yeuCau.SubtitleUrl ?? "";

            // 1. Nếu chưa có SubtitleUrl trong DTO nhưng có MaBaiHoc, truy vấn DB lấy thông tin bài học & SubtitleUrl
            if (string.IsNullOrWhiteSpace(subtitleUrlToUse) && yeuCau.MaBaiHoc > 0)
            {
                var baiHocDb = await _dbContext.BaiHocs.FindAsync(yeuCau.MaBaiHoc);
                if (baiHocDb != null)
                {
                    if (!string.IsNullOrWhiteSpace(baiHocDb.SubtitleUrl))
                    {
                        subtitleUrlToUse = baiHocDb.SubtitleUrl;
                    }
                    if (string.IsNullOrWhiteSpace(yeuCau.TieuDe) && !string.IsNullOrWhiteSpace(baiHocDb.TieuDe))
                    {
                        yeuCau.TieuDe = baiHocDb.TieuDe;
                    }
                }
            }

            // 2. Ưu tiên 1: Tải phụ đề từ Cloudinary/Cloud URL nếu có SubtitleUrl
            if (!string.IsNullOrWhiteSpace(subtitleUrlToUse))
            {
                try
                {
                    string rawVttContent = await _http.GetStringAsync(subtitleUrlToUse);
                    phuDeKhaiThac = CleanVttOrSrtSubtitleWithTimestamps(rawVttContent).CleanText;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[TomTatVideo] Lỗi tải phụ đề từ Cloud ({subtitleUrlToUse}): {ex.Message}");
                }
            }

            // 3. Ưu tiên 2: Nếu chưa có phụ đề từ SubtitleUrl, dùng phụ đề truyền từ Frontend (yeuCau.PhuDeVideo)
            if (string.IsNullOrWhiteSpace(phuDeKhaiThac) && !string.IsNullOrWhiteSpace(yeuCau.PhuDeVideo))
            {
                phuDeKhaiThac = CleanVttOrSrtSubtitleWithTimestamps(yeuCau.PhuDeVideo).CleanText;
            }

            // 4. Ưu tiên 3: Nếu là video YouTube (có VideoId), thử lấy phụ đề YouTube
            if (string.IsNullOrWhiteSpace(phuDeKhaiThac) && !string.IsNullOrWhiteSpace(yeuCau.VideoId))
            {
                phuDeKhaiThac = await GetPhuDeVideoHelper.LayPhuDeYoutube(yeuCau.VideoId);
            }

            string systemInstruction = @"Bạn là Chuyên gia Tóm tắt Bài giảng Lập trình Công nghệ Thông tin.
NHIỆM VỤ CỦA BẠN: Tóm tắt lại kiến thức bài giảng một cách súc tích, chuẩn xác và dễ hiểu.
QUY TẮC BẮT BUỘC:
1. TRẢ VỀ HOÀN TOÀN BẰNG TIẾNG VIỆT.
2. TUYỆT ĐỐI KHÔNG lặp lại bất kỳ câu hướng dẫn, quy tắc prompt hay văn bản tiếng Anh nào.
3. LOẠI BỎ hoàn toàn lời chào hỏi, kêu gọi like/subscribe, từ đệm.
4. ĐỊNH DẠNG Markdown đẹp mắt: dùng các tiêu đề (###), danh sách gạch đầu dòng và in đậm các **Thuật ngữ CNTT**.
5. Bắt đầu ngay trực tiếp bằng tiêu đề bài tóm tắt.";

            string promptTomTat = "";
            if (!string.IsNullOrWhiteSpace(phuDeKhaiThac))
            {
                promptTomTat = $@"Hãy tóm tắt nội dung chính bài học '{yeuCau.TieuDe}' dựa trên phụ đề bài giảng dưới đây:

NỘI DUNG BÀI GIẢNG:
{phuDeKhaiThac}";
            }
            else
            {
                promptTomTat = $@"Hãy tóm tắt các kiến thức cốt lõi nhất cần học của bài học lập trình có tiêu đề: '{yeuCau.TieuDe}'.
Hãy trình bày ngắn gọn bằng tiếng Việt, dùng gạch đầu dòng và in đậm các thuật ngữ quan trọng.";
            }

            try
            {
                string rawJsonResult = await _gemini.GenerateAsync(promptTomTat, false, systemInstruction);
                string ketQuaTomTat = ChuanHoaJsonTuAIHelper.LayTextChatTuAI(rawJsonResult);
                return ketQuaTomTat;
            }
            catch (Exception loi)
            {
                Console.WriteLine($"Lỗi: {loi.Message}");
                throw new Exception("Lỗi gọi AI tóm tắt.");
            }
        }

        private static (string CleanText, int TotalSeconds) CleanVttOrSrtSubtitleWithTimestamps(string rawSubtitle)
        {
            if (string.IsNullOrWhiteSpace(rawSubtitle)) return (string.Empty, 0);

            var lines = rawSubtitle.Split(new[] { "\r\n", "\n" }, StringSplitOptions.None);
            var cleanLines = new List<string>();
            int maxSeconds = 0;
            string currentTimestampStr = "";

            foreach (var line in lines)
            {
                string trimmed = line.Trim();
                if (string.IsNullOrWhiteSpace(trimmed)) continue;
                if (trimmed.Equals("WEBVTT", StringComparison.OrdinalIgnoreCase)) continue;
                if (trimmed.StartsWith("NOTE", StringComparison.OrdinalIgnoreCase)) continue;
                if (int.TryParse(trimmed, out _)) continue;

                var timeMatch = Regex.Match(trimmed, @"(?:(\d{2}):)?(\d{2}):(\d{2})(?:\.\d+)?\s*-->\s*(?:(\d{2}):)?(\d{2}):(\d{2})");
                if (timeMatch.Success)
                {
                    int startMin = int.Parse(timeMatch.Groups[2].Value);
                    int startSec = int.Parse(timeMatch.Groups[3].Value);
                    if (!string.IsNullOrEmpty(timeMatch.Groups[1].Value))
                    {
                        startMin += int.Parse(timeMatch.Groups[1].Value) * 60;
                    }

                    int endMin = int.Parse(timeMatch.Groups[5].Value);
                    int endSec = int.Parse(timeMatch.Groups[6].Value);
                    if (!string.IsNullOrEmpty(timeMatch.Groups[4].Value))
                    {
                        endMin += int.Parse(timeMatch.Groups[4].Value) * 60;
                    }
                    int totalEndSec = endMin * 60 + endSec;
                    if (totalEndSec > maxSeconds) maxSeconds = totalEndSec;

                    currentTimestampStr = $"[{startMin:D2}:{startSec:D2}]";
                    continue;
                }

                string textOnly = Regex.Replace(trimmed, @"<[^>]+>", "").Trim();
                if (!string.IsNullOrWhiteSpace(textOnly))
                {
                    if (!string.IsNullOrEmpty(currentTimestampStr))
                    {
                        cleanLines.Add($"{currentTimestampStr} {textOnly}");
                        currentTimestampStr = "";
                    }
                    else
                    {
                        cleanLines.Add(textOnly);
                    }
                }
            }

            return (string.Join("\n", cleanLines), maxSeconds);
        }

        public async Task<VideoAnalysisResultDTO?> PhanTichVideoAsync(string linkVideo, string tieuDeBaiHoc, string? subtitleUrl = null)
        {
            string videoId = LayVideoIdTuLink(linkVideo);
            string phuDe = string.Empty;
            int totalVideoDuration = 0;

            if (!string.IsNullOrWhiteSpace(subtitleUrl))
            {
                try
                {
                    string rawSub = await _http.GetStringAsync(subtitleUrl);
                    var (cleanedText, maxSec) = CleanVttOrSrtSubtitleWithTimestamps(rawSub);
                    phuDe = cleanedText;
                    totalVideoDuration = maxSec;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[PhanTichVideo] Lỗi tải phụ đề từ Cloud ({subtitleUrl}): {ex.Message}");
                }
            }

            if (string.IsNullOrWhiteSpace(phuDe) && !string.IsNullOrEmpty(videoId))
            {
                phuDe = await GetPhuDeVideoHelper.LayPhuDeYoutube(videoId);
                if (!string.IsNullOrEmpty(phuDe))
                {
                    var matches = Regex.Matches(phuDe, @"\[(\d{2}):(\d{2})\]");
                    if (matches.Count > 0)
                    {
                        var lastMatch = matches[matches.Count - 1];
                        totalVideoDuration = int.Parse(lastMatch.Groups[1].Value) * 60 + int.Parse(lastMatch.Groups[2].Value);
                    }
                }
            }

            string systemInstruction = @"Bạn là Chuyên gia Thiết kế Bài giảng Lập trình Công nghệ Thông tin.
NHIỆM VỤ CỦA BẠN:
1. Đọc phụ đề bài giảng kèm mốc thời gian [MM:SS].
2. TỰ ĐỘNG XÁC ĐỊNH TẤT CẢ CÁC MỐC KIẾN THỨC CỐT LÕI mà giảng viên trình bày trong video (Khái niệm mới, Cú pháp, Nguyên lý hoạt động, Cách xử lý lỗi, Ví dụ thực tế).
3. CO ĐỘNG THEO NỘI DUNG (Không giới hạn cố định số lượng): Video có bao nhiêu mốc kiến thức chính thì tự động tạo bấy nhiêu mốc Quiz tương ứng.
4. Gán 'ThoiGianKetThuc' (tính bằng GIÂY) chính xác ngay tại mốc thời gian [MM:SS] giảng viên vừa giảng xong ý đó.
5. Đặt câu hỏi trắc nghiệm (Quiz) sát với ĐÚNG NỘI DUNG kiến thức giảng viên vừa giảng.";

            string nguCanhNoiDung = string.IsNullOrEmpty(phuDe)
                ? $"Bài học có tiêu đề: '{tieuDeBaiHoc}'. Hãy ước lượng nội dung và thời gian hợp lý."
                : $"Phụ đề video có mốc thời gian thực tế [MM:SS]:\n{phuDe}";

            string prompt = $@"Dựa vào phụ đề thực tế của bài học '{tieuDeBaiHoc}' (Tổng thời lượng video: {totalVideoDuration} giây), hãy phân tích kiến thức và tạo bài trắc nghiệm tương tác co động theo nội dung:

NỘI DUNG VÀ MỐC THỜI GIAN VIDEO:
{nguCanhNoiDung}

QUY TẮC TẠO QUIZ CO ĐỘNG (BẮT BUỘC):
1. TẠO QUIZ THEO TỪNG NỘI DUNG CHÍNH: Bất kỳ khi nào giảng viên giải thích xong 1 chủ đề/khái niệm/cú pháp quan trọng, hãy tạo 1 mốc Quiz ngay tại thời điểm đó.
2. KHÔNG GIỚI HẠN CỐ ĐỊNH: Số lượng mốc Quiz phụ thuộc hoàn toàn vào các nội dung chính trong video (tùy thuộc vào lượng kiến thức trong video ít hay nhiều).
3. ĐÚNG THỜI ĐIỂM: 'ThoiGianKetThuc' (đơn vị GIÂY) phải trùng khớp với mốc thời gian [MM:SS] trong phụ đề khi giảng viên vừa trình bày xong ý đó.
4. MỖI MỐC QUIZ GỒM: 1 câu hỏi trắc nghiệm kiểm tra đúng ý chuyên môn giảng viên vừa giảng + 4 lựa chọn (DapAnA, DapAnB, DapAnC, DapAnD) + 1 đáp án đúng (DapAnDung: 'A' hoặc 'B' hoặc 'C' hoặc 'D').

Cấu trúc JSON bắt buộc:
{{
  ""Chapters"": [
    {{
      ""ThoiGianBatDau"": 0,
      ""ThoiGianKetThuc"": 150,
      ""KienThucChinh"": ""Khái niệm & Cú pháp khai báo"",
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
                string rawResponse = await _gemini.GenerateAsync(prompt, true, systemInstruction);
                rawResponse = ChuanHoaJsonTuAIHelper.LayTextChatTuAI(rawResponse);
                rawResponse = LamSachJson(rawResponse);

                var aiResult = JsonSerializer.Deserialize<VideoAnalysisResultDTO>(rawResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (aiResult?.Chapters != null && aiResult.Chapters.Any())
                {
                    // Sắp xếp các chapters theo thời gian tăng dần
                    aiResult.Chapters = aiResult.Chapters.OrderBy(c => c.ThoiGianBatDau).ToList();

                    // Đảm bảo ThoiGianBatDau chapter đầu tiên là 0
                    if (aiResult.Chapters[0].ThoiGianBatDau != 0)
                    {
                        aiResult.Chapters[0].ThoiGianBatDau = 0;
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