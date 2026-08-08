using System.Text.Json;
using educodeai_server.Data;
using educodeai_server.DTOs.AI;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class PhongVanAIDocLapService : IPhongVanAIDocLapService
    {
        private readonly EduCodeAIDbContext _context;
        private readonly IGeminiAIService _geminiService;
        private readonly ILogger<PhongVanAIDocLapService> _logger;

        public PhongVanAIDocLapService(EduCodeAIDbContext context, IGeminiAIService geminiService, ILogger<PhongVanAIDocLapService> logger)
        {
            _context = context;
            _geminiService = geminiService;
            _logger = logger;
        }

        public async Task<StartPhongVanResponseDto> StartInterviewAsync(int userId, StartPhongVanRequestDto request)
        {
            var lichSu = new LichSuPhongVanModel
            {
                MaNguoiDung = userId,
                ViTriUngTuyen = request.ViTriUngTuyen,
                CapDo = request.CapDo,
                TinhCachAI = request.TinhCachAI,
                SoLuongCauHoi = request.SoLuongCauHoi,
                TrangThai = TrangThaiPhongVan.InProgress,
                NgayPhongVan = DateTime.UtcNow
            };

            _context.LichSuPhongVans.Add(lichSu);
            await _context.SaveChangesAsync();

            string prompt = $@"
Bạn là một chuyên gia phỏng vấn tuyển dụng NGƯỜI VIỆT NAM.
Vị trí ứng tuyển: {request.ViTriUngTuyen}
Cấp độ: {request.CapDo}
Tính cách của bạn: {request.TinhCachAI} (Friendly = Thân thiện hướng dẫn, Strict = Khó tính xoáy sâu vào lỗi sai, Normal = Bình thường).

=== YÊU CẦU BẮT BUỘC ===
1. BẮT BUỘC trả lời hoàn toàn bằng TIẾNG VIỆT. KHÔNG ĐƯỢC dùng tiếng Anh.
2. Bạn ĐANG TRONG CUỘC HỘI THOẠI TRỰC TIẾP với ứng viên. Hãy đóng vai và đưa ra CÂU HỎI ĐẦU TIÊN ngay lập tức.
3. TRẢ VỀ DUY NHẤT một câu hỏi ngắn gọn (tối đa 2-3 câu). KHÔNG suy nghĩ, KHÔNG giải thích, KHÔNG in ra kịch bản, danh sách, hay các lựa chọn.
4. KHÔNG ĐƯỢC viết tiếng Anh, KHÔNG liệt kê Option, KHÔNG dùng format Role/Personality/Constraint.";

            var rawResponse = await _geminiService.GenerateAsync(prompt);
            string cauHoiDauTien = "";
            try {
                cauHoiDauTien = ChuanHoaJsonTuAIHelper.LayTextChatTuAI(rawResponse).Replace("*", "").Trim();
                if (cauHoiDauTien.Length > 200 && cauHoiDauTien.Contains("?")) 
                {
                    var sentences = cauHoiDauTien.Split(new[] { '.', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                    var questionSentence = sentences.LastOrDefault(s => s.Contains("?"));
                    if (!string.IsNullOrWhiteSpace(questionSentence))
                    {
                        cauHoiDauTien = questionSentence.Trim();
                    }
                }
            } catch {
                cauHoiDauTien = "Xin lỗi, hiện tại tôi đang gặp vấn đề trong việc đưa ra câu hỏi. Bạn có thể tự giới thiệu về bản thân được không?";
            }

            var turnList = new List<PhongVanDocLapTurnDto>
            {
                new PhongVanDocLapTurnDto { Role = "ai", Message = cauHoiDauTien, Timestamp = DateTime.UtcNow }
            };

            lichSu.ChiTietChatJSON = JsonSerializer.Serialize(turnList);
            await _context.SaveChangesAsync();

            return new StartPhongVanResponseDto
            {
                MaPhongVan = lichSu.MaPhongVan,
                CauHoiDauTien = cauHoiDauTien
            };
        }

        public async Task<AnswerPhongVanResponseDto> AnswerQuestionAsync(int userId, AnswerPhongVanRequestDto request)
        {
            var lichSu = await _context.LichSuPhongVans
                .FirstOrDefaultAsync(x => x.MaPhongVan == request.MaPhongVan && x.MaNguoiDung == userId);

            if (lichSu == null) throw new Exception("Không tìm thấy phiên phỏng vấn.");
            if (lichSu.TrangThai == TrangThaiPhongVan.Completed) throw new Exception("Phiên phỏng vấn đã kết thúc.");
            if (string.IsNullOrWhiteSpace(request.CauTraLoi)) throw new ArgumentException("Câu trả lời không được để trống.");

            var chatHistory = JsonSerializer.Deserialize<List<PhongVanDocLapTurnDto>>(lichSu.ChiTietChatJSON) ?? new List<PhongVanDocLapTurnDto>();
            
            chatHistory.Add(new PhongVanDocLapTurnDto { Role = "user", Message = request.CauTraLoi, Timestamp = DateTime.UtcNow });

            int questionCount = chatHistory.Count(x => x.Role == "user");
            bool isFinished = questionCount >= lichSu.SoLuongCauHoi;

            string chatContext = string.Join("\n", chatHistory.Select(x => $"{(x.Role == "ai" ? "Người phỏng vấn" : "Ứng viên")}: {x.Message}"));

            string prompt = $@"
Bạn là người phỏng vấn VIỆT NAM, đang phỏng vấn ứng viên cho vị trí: {lichSu.ViTriUngTuyen} (Cấp độ: {lichSu.CapDo}).
Tính cách của bạn: {lichSu.TinhCachAI}.
Dưới đây là lịch sử cuộc trò chuyện:
{chatContext}

Hãy đánh giá câu trả lời gần nhất và trả về đúng JSON:
{{
    ""nhanXetCauTruoc"": ""Nhận xét ngắn gọn 2-3 câu bằng tiếng Việt"",
    ""cauHoiTiepTheo"": ""{(isFinished ? "" : "Câu hỏi tiếp theo ngắn gọn bằng tiếng Việt")}""
}}
Yêu cầu:
- Chỉ trả về JSON, không markdown hoặc giải thích thêm.
- Toàn bộ nội dung bằng tiếng Việt.
- {(isFinished ? "Đây là câu cuối, cauHoiTiepTheo bắt buộc là chuỗi rỗng và nhận xét kết thúc bằng lời cảm ơn." : "cauHoiTiepTheo phải là một câu hỏi mới, phù hợp với lịch sử phỏng vấn.")}";

            var rawResponse = await _geminiService.GenerateAsync(prompt, true);
            string nhanXet;
            string cauHoiTiepTheo;
            try
            {
                var responseText = ChuanHoaJsonTuAIHelper.LayTextChatTuAI(rawResponse);
                var json = ChuanHoaJsonTuAIHelper.ExtractJson(responseText);
                var aiResponse = JsonSerializer.Deserialize<JsonElement>(json);
                nhanXet = aiResponse.GetProperty("nhanXetCauTruoc").GetString()?.Trim() ?? "";
                cauHoiTiepTheo = isFinished
                    ? ""
                    : aiResponse.GetProperty("cauHoiTiepTheo").GetString()?.Trim() ?? "";

                if (string.IsNullOrWhiteSpace(nhanXet))
                    throw new JsonException("AI không trả về nhận xét.");
                if (!isFinished && string.IsNullOrWhiteSpace(cauHoiTiepTheo))
                    throw new JsonException("AI không trả về câu hỏi tiếp theo.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi phân tích câu trả lời phỏng vấn. RawResponse: {Raw}", rawResponse);
                nhanXet = isFinished
                    ? "Cảm ơn bạn đã trả lời. Buổi phỏng vấn kết thúc tại đây."
                    : "Cảm ơn bạn đã trả lời. Hãy tiếp tục thể hiện rõ cách suy nghĩ và kinh nghiệm của bạn.";
                cauHoiTiepTheo = isFinished
                    ? ""
                    : "Bạn có thể chia sẻ một tình huống thực tế mà bạn đã áp dụng kiến thức này không?";
            }

            var aiMessage = isFinished
                ? nhanXet
                : $"{nhanXet}\n\n{cauHoiTiepTheo}";

            var aiTurn = new PhongVanDocLapTurnDto
            {
                Role = "ai",
                Message = aiMessage,
                Timestamp = DateTime.UtcNow
            };
            chatHistory.Add(aiTurn);

            lichSu.ChiTietChatJSON = JsonSerializer.Serialize(chatHistory);
            await _context.SaveChangesAsync();

            return new AnswerPhongVanResponseDto
            {
                IsFinished = isFinished,
                NhanXetCauTruoc = nhanXet,
                CauHoiTiepTheo = cauHoiTiepTheo
            };
        }

        public async Task<EndPhongVanResponseDto> EndInterviewAsync(int userId, int maPhongVan)
        {
            var lichSu = await _context.LichSuPhongVans
                .FirstOrDefaultAsync(x => x.MaPhongVan == maPhongVan && x.MaNguoiDung == userId);

            if (lichSu == null) throw new Exception("Không tìm thấy phiên phỏng vấn.");

            var chatHistory = JsonSerializer.Deserialize<List<PhongVanDocLapTurnDto>>(lichSu.ChiTietChatJSON) ?? new List<PhongVanDocLapTurnDto>();

            string chatContext = string.Join("\n", chatHistory.Select(x => $"{(x.Role == "ai" ? "Người phỏng vấn" : "Ứng viên")}: {x.Message}"));

            string prompt = $@"
Đây là toàn bộ lịch sử buổi phỏng vấn cho vị trí: {lichSu.ViTriUngTuyen} (Cấp độ: {lichSu.CapDo}).
Lịch sử cuộc trò chuyện:
{chatContext}

Buổi phỏng vấn đã kết thúc. Dựa vào toàn bộ câu trả lời của ứng viên, hãy đưa ra đánh giá tổng quát và chấm điểm.
Viết HOÀN TOÀN bằng TIẾNG VIỆT.
Hãy trả về định dạng JSON CHÍNH XÁC như sau:
```json
{{
    ""diemSo"": (Một số nguyên từ 0 đến 100),
    ""danhGiaChung"": ""Nhận xét tổng quát ngắn gọn (2-3 câu) về ứng viên."",
    ""diemManh"": [""Điểm mạnh 1"", ""Điểm mạnh 2""],
    ""canCaiThien"": [""Điểm cần cải thiện 1"", ""Điểm cần cải thiện 2""],
    ""loiKhuyen"": ""Lời khuyên cụ thể giúp ứng viên tiến bộ (2-3 câu).""
}}
```
Yêu cầu:
- Chỉ trả về JSON, không kèm giải thích, không dùng markdown ngoài JSON.
- Toàn bộ nội dung BẮT BUỘC bằng TIẾNG VIỆT.
- diemManh và canCaiThien là mảng, mỗi phần tử là 1 ý ngắn gọn. Nếu không có thì để mảng rỗng.";

            var rawResponse = await _geminiService.GenerateAsync(prompt);
            string responseText = "";
            int diemSo = 0;
            string danhGiaChung = "";
            var diemManh = new List<string>();
            var canCaiThien = new List<string>();
            string loiKhuyen = "";

            try
            {
                responseText = ChuanHoaJsonTuAIHelper.LayTextChatTuAI(rawResponse);
                string json = ChuanHoaJsonTuAIHelper.ExtractJson(responseText);
                var aiRes = JsonSerializer.Deserialize<JsonElement>(json);
                diemSo = aiRes.GetProperty("diemSo").GetInt32();
                danhGiaChung = aiRes.GetProperty("danhGiaChung").GetString() ?? "";

                if (aiRes.TryGetProperty("diemManh", out var dm) && dm.ValueKind == JsonValueKind.Array)
                    diemManh = dm.EnumerateArray()
                        .Select(x => x.GetString() ?? "")
                        .Where(x => !string.IsNullOrWhiteSpace(x)).ToList();

                if (aiRes.TryGetProperty("canCaiThien", out var cct) && cct.ValueKind == JsonValueKind.Array)
                    canCaiThien = cct.EnumerateArray()
                        .Select(x => x.GetString() ?? "")
                        .Where(x => !string.IsNullOrWhiteSpace(x)).ToList();

                if (aiRes.TryGetProperty("loiKhuyen", out var lk))
                    loiKhuyen = lk.GetString() ?? "";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi phân tích JSON kết quả phỏng vấn. RawResponse: {Raw}", rawResponse);
                diemSo = 0;
                danhGiaChung = "Đã xảy ra lỗi khi phân tích kết quả. Bạn có thể tự mình đánh giá lại phần trả lời của bản thân.";
            }

            lichSu.TrangThai = TrangThaiPhongVan.Completed;
            lichSu.DiemSo = diemSo;
            lichSu.DanhGiaChung = danhGiaChung;
            await _context.SaveChangesAsync();

            return new EndPhongVanResponseDto
            {
                DiemSo = diemSo,
                DanhGiaChung = danhGiaChung,
                DiemManh = diemManh,
                CanCaiThien = canCaiThien,
                LoiKhuyen = loiKhuyen,
                LichSuChat = chatHistory
            };
        }

        public async Task<List<LichSuPhongVanModel>> GetInterviewHistoryAsync(int userId)
        {
            return await _context.LichSuPhongVans
                .Where(x => x.MaNguoiDung == userId)
                .OrderByDescending(x => x.NgayPhongVan)
                .ToListAsync();
        }
    }
}
