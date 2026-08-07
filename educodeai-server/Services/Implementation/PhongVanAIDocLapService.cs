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

            // Câu mở đầu cố định để bảo đảm luôn hiển thị bằng tiếng Việt.
            // Không gọi Gemini ở bước này vì Gemini đôi khi trả về nội dung meta bằng tiếng Anh.
            string cauHoiDauTien =
                $"Bạn có thể giới thiệu ngắn gọn về kinh nghiệm và kỹ năng phù hợp với vị trí {request.ViTriUngTuyen} không?";

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

Ứng viên vừa trả lời câu hỏi gần nhất. Nhiệm vụ của bạn:
1. Đưa ra nhận xét ngắn gọn (2-3 câu) về câu trả lời của ứng viên bằng TIẾNG VIỆT.
{(isFinished ? "2. Đây là câu hỏi cuối cùng, bạn không cần hỏi thêm gì nữa. Kết thúc bằng câu: 'Cảm ơn bạn, buổi phỏng vấn kết thúc tại đây.'" : "2. Đưa ra CÂU HỎI TIẾP THEO ngắn gọn (1-2 câu) cho ứng viên bằng TIẾNG VIỆT.")}

=== YÊU CẦU BẮT BUỘC ===
- BẮT BUỘC trả lời 100% bằng TIẾNG VIỆT. CẤM dùng tiếng Anh.
- Trả lời ngắn gọn, tự nhiên như đang nói chuyện. Tối đa 5-6 câu.
- KHÔNG sử dụng JSON. KHÔNG in ra kịch bản. KHÔNG liệt kê Role/Personality/Context.
- KHÔNG dùng format có dấu * hoặc markdown.";

            var rawResponse = await _geminiService.GenerateAsync(prompt);
            string nhanXet = "";
            try {
                nhanXet = ChuanHoaJsonTuAIHelper.LayTextChatTuAI(rawResponse)
                    .Replace("*", "")
                    .Trim();

                // Loại bỏ các câu trả lời dạng meta mà model đôi khi chèn vào.
                nhanXet = System.Text.RegularExpressions.Regex.Replace(
                    nhanXet,
                    @"(?im)^\s*(no\s+markdown(?:/asterisks)?\s*\??\s*(yes)?|markdown\s*/\s*asterisks\s*\??\s*(yes|no)?)\s*[.!]?\s*$",
                    ""
                ).Trim();
            } catch {
                nhanXet = "Cảm ơn bạn đã trả lời. " + (isFinished ? "Chúng ta kết thúc phỏng vấn ở đây." : "Hãy tiếp tục với câu hỏi khác nhé.");
            }

            if (string.IsNullOrWhiteSpace(nhanXet) || !nhanXet.Any(c => c >= 'À' && c <= 'ỹ'))
            {
                nhanXet = isFinished
                    ? "Cảm ơn bạn đã trả lời. Buổi phỏng vấn kết thúc tại đây."
                    : "Cảm ơn bạn đã chia sẻ. Câu trả lời của bạn đã được ghi nhận.";
            }

            string cauHoiTiepTheo = "";
            if (!isFinished)
            {
                // Chỉ lấy câu hỏi tiếng Việt, tránh bắt nhầm các dòng meta tiếng Anh của model.
                var cauHoiUngVien = nhanXet
                    .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(x => x.Trim().TrimStart('-', '•', ' '))
                    .FirstOrDefault(x => x.Contains('?') && x.Any(c => c >= 'À' && c <= 'ỹ'));
                cauHoiTiepTheo = cauHoiUngVien ?? "Bạn có thể chia sẻ thêm một ví dụ thực tế về kỹ năng này không?";
            }

            var aiMessage = nhanXet;
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
                CauHoiTiepTheo = cauHoiTiepTheo,
                TinNhanAI = aiMessage
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

        public async Task<PhongVanSessionDto> GetInterviewAsync(int userId, int maPhongVan)
        {
            var lichSu = await _context.LichSuPhongVans.FirstOrDefaultAsync(x => x.MaPhongVan == maPhongVan && x.MaNguoiDung == userId)
                ?? throw new Exception("Không tìm thấy phiên phỏng vấn.");
            return new PhongVanSessionDto
            {
                MaPhongVan = lichSu.MaPhongVan,
                ViTriUngTuyen = lichSu.ViTriUngTuyen,
                CapDo = lichSu.CapDo,
                TinhCachAI = lichSu.TinhCachAI,
                SoLuongCauHoi = lichSu.SoLuongCauHoi,
                TrangThai = lichSu.TrangThai,
                GhiChu = lichSu.GhiChu,
                LichSuChat = JsonSerializer.Deserialize<List<PhongVanDocLapTurnDto>>(lichSu.ChiTietChatJSON) ?? new()
            };
        }

        public async Task UpdateNoteAsync(int userId, int maPhongVan, string ghiChu)
        {
            if (ghiChu.Length > 5000) throw new Exception("Ghi chú không được vượt quá 5000 ký tự.");
            var lichSu = await _context.LichSuPhongVans.FirstOrDefaultAsync(x => x.MaPhongVan == maPhongVan && x.MaNguoiDung == userId)
                ?? throw new Exception("Không tìm thấy phiên phỏng vấn.");
            lichSu.GhiChu = ghiChu.Trim();
            lichSu.CapNhatGhiChuLuc = DateTime.UtcNow;
            await _context.SaveChangesAsync();
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
