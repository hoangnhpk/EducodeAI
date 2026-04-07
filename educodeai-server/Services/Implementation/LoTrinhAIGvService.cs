using System.Text.Json;
using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;

namespace educodeai_server.Services.Implementation
{
    public class LoTrinhAIGvService : ILoTrinhAIGvService
    {
        private readonly ILoTrinhAIGvRepository _loTrinhGvRepo;
        private readonly IGeminiAIService _gemini;

        public LoTrinhAIGvService(
            ILoTrinhAIGvRepository loTrinhGvRepo,
            IGeminiAIService gemini)
        {
            _loTrinhGvRepo = loTrinhGvRepo;
            _gemini = gemini;
        }


        public async Task<AIGeneratedKhoaHocDTO> PhacThaoKhoaHocBangAIAsync(TaoLoTrinhRequest request, int maGiangVien)
        {
            var prompt = BuildPromptGiangVien(request);
            Console.WriteLine("=== PROMPT GỬI LÊN AI ===");
            Console.WriteLine(prompt);
            Console.WriteLine("=========================");
            var aiResult = await _gemini.GenerateAsync(prompt);
            var resultChuanHoa = ChuanHoaJsonTuAIHelper.ChuanHoa(aiResult);

            var loTrinhLog = new LoTrinhAIModel
            {
                MaNguoiDung = maGiangVien,
                YeuCau = $"Tạo khóa học GV: {request.ChuDe} - Trình độ: {request.TrinhDo}",
                NoiDungJSON = resultChuanHoa,
                TrangThai = "Phác thảo",
                NgayTao = DateTime.Now
            };

            await _loTrinhGvRepo.LuuLichSuAIAsync(loTrinhLog);

            var result = JsonSerializer.Deserialize<AIGeneratedKhoaHocDTO>(resultChuanHoa, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result ?? throw new Exception("Không thể parse dữ liệu JSON từ AI.");
        }

        public async Task<bool> LuuKhoaHocChinhThucAsync(AIGeneratedKhoaHocDTO data, int maGiangVien)
        {
            return await _loTrinhGvRepo.LuuKhoaHocChinhThucAsync(data, maGiangVien);
        }

        private static string BuildPromptGiangVien(TaoLoTrinhRequest request)
        {
            var outputSchema = """
            {
              "TenKhoaHoc": "",
              "MoTa": "",
              "LinhVuc": "",
              "TrinhDo": "",
              "KyNangChinh": "",
              "ThoiLuongGio": 0,
              "ChuongHocs": [
                {
                  "TenChuong": "",
                  "ThuTu": 1,
                  "BaiHocs": [
                    { "TieuDe": "", "LoaiBaiHoc": "Video", "ThuTu": 1 },
                    { "TieuDe": "", "LoaiBaiHoc": "VanBan", "ThuTu": 2 },
                    { "TieuDe": "", "LoaiBaiHoc": "BaiTap", "ThuTu": 3 }
                  ]
                }
              ]
            }
            """;

            return $"""
            Bạn là chuyên gia thiết kế giáo trình lập trình đỉnh cao.
            Tạo phác thảo KHÓA HỌC mới dựa trên yêu cầu:
            - Chủ đề: {request.ChuDe}
            - Trình độ: {request.TrinhDo}
            - Lĩnh vực: {request.LinhVuc}
            - Số chương: Khoảng {request.SoChuongDuKien} chương.

            YÊU CẦU BẮT BUỘC:
            1. Trả về JSON hợp lệ, khớp CHÍNH XÁC SCHEMA.
            2. 'LoaiBaiHoc' CHỈ nhận 1 trong 3 giá trị: "Video", "VanBan", "BaiTap".
            3. KHÔNG dùng markdown ```json. KHÔNG giải thích.
            4. Các trường số phải là number.

            === OUTPUT FORMAT (JSON) ===
            {outputSchema}
            """;
        }
    }
}