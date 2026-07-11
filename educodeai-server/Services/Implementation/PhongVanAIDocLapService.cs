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

        public PhongVanAIDocLapService(EduCodeAIDbContext context, IGeminiAIService geminiService)
        {
            _context = context;
            _geminiService = geminiService;
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
Bạn là một chuyên gia phỏng vấn tuyển dụng.
Vị trí ứng tuyển: {request.ViTriUngTuyen}
Cấp độ: {request.CapDo}
Tính cách của bạn: {request.TinhCachAI} (Friendly = Thân thiện hướng dẫn, Strict = Khó tính xoáy sâu vào lỗi sai, Normal = Bình thường).
Nhiệm vụ của bạn: Hãy đưa ra CÂU HỎI ĐẦU TIÊN để bắt đầu buổi phỏng vấn chuyên môn. Câu hỏi nên phù hợp với cấp độ và vị trí.
Chỉ trả về trực tiếp nội dung câu hỏi, không cần giải thích thêm.";

            string cauHoiDauTien = await _geminiService.GenerateAsync(prompt);

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
Bạn đang phỏng vấn ứng viên cho vị trí: {lichSu.ViTriUngTuyen} (Cấp độ: {lichSu.CapDo}).
Tính cách của bạn: {lichSu.TinhCachAI}.
Dưới đây là lịch sử cuộc trò chuyện từ đầu đến giờ:
{chatContext}

Ứng viên vừa trả lời câu hỏi gần nhất. Nhiệm vụ của bạn:
1. Đưa ra nhận xét ngắn gọn về câu trả lời của ứng viên (đúng/sai, điểm tốt, điểm cần cải thiện) dựa trên tính cách của bạn.
{(isFinished ? "2. Đây là câu hỏi cuối cùng, bạn không cần hỏi thêm gì nữa. Chỉ cần nói: 'Cảm ơn bạn, chúng ta kết thúc ở đây.'" : "2. Đưa ra CÂU HỎI TIẾP THEO cho ứng viên. Câu hỏi phải liên quan đến chủ đề đang trao đổi hoặc chuyển sang một khía cạnh khác của vị trí ứng tuyển.")}

Hãy trả về định dạng JSON CHÍNH XÁC như sau:
```json
{{
    ""nhanXet"": ""Nhận xét của bạn về câu trả lời vừa rồi"",
    ""cauHoiTiepTheo"": ""{(isFinished ? "" : "Câu hỏi tiếp theo của bạn")}""
}}
```
Chỉ trả về JSON, không kèm giải thích.";

            string responseJson = await _geminiService.GenerateAsync(prompt);
            string nhanXet = "";
            string cauHoiTiepTheo = "";

            try
            {
                string json = ChuanHoaJsonTuAIHelper.ExtractJson(responseJson);
                var aiRes = JsonSerializer.Deserialize<JsonElement>(json);
                nhanXet = aiRes.GetProperty("nhanXet").GetString() ?? "";
                cauHoiTiepTheo = aiRes.GetProperty("cauHoiTiepTheo").GetString() ?? "";
            }
            catch
            {
                nhanXet = responseJson; // fallback
            }

            var aiTurn = new PhongVanDocLapTurnDto
            {
                Role = "ai",
                Message = (nhanXet + "\n\n" + cauHoiTiepTheo).Trim(),
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
Hãy trả về định dạng JSON CHÍNH XÁC như sau:
```json
{{
    ""diemSo"": (Một số nguyên từ 0 đến 100),
    ""danhGiaChung"": ""Nhận xét tổng quát, chi tiết điểm mạnh, điểm yếu và lời khuyên.""
}}
```
Chỉ trả về JSON, không kèm giải thích.";

            string responseJson = await _geminiService.GenerateAsync(prompt);
            int diemSo = 0;
            string danhGiaChung = "";

            try
            {
                string json = ChuanHoaJsonTuAIHelper.ExtractJson(responseJson);
                var aiRes = JsonSerializer.Deserialize<JsonElement>(json);
                diemSo = aiRes.GetProperty("diemSo").GetInt32();
                danhGiaChung = aiRes.GetProperty("danhGiaChung").GetString() ?? "";
            }
            catch
            {
                danhGiaChung = "Đã có lỗi xảy ra trong quá trình đánh giá tổng quát từ AI.";
            }

            lichSu.TrangThai = TrangThaiPhongVan.Completed;
            lichSu.DiemSo = diemSo;
            lichSu.DanhGiaChung = danhGiaChung;
            await _context.SaveChangesAsync();

            return new EndPhongVanResponseDto
            {
                DiemSo = diemSo,
                DanhGiaChung = danhGiaChung,
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
