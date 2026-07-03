using System;
using System.Text.Json;
using System.Threading.Tasks;
using educodeai_server.DTOs.AI;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;

namespace educodeai_server.Services.Implementation
{
    public class SinhDoAnAIService : ISinhDoAnAIService
    {
        private readonly IGeminiAIService _gemini;

        public SinhDoAnAIService(IGeminiAIService gemini)
        {
            _gemini = gemini;
        }

        public async Task<SinhDoAnResponseDto> GenerateDoAnAsync(SinhDoAnRequestDto request)
        {
            var prompt = $@"
Bạn là một Senior System Architect dày dặn kinh nghiệm.
Nhiệm vụ của bạn là thiết kế một đồ án thực tế dựa trên yêu cầu sau:
- Mục tiêu nghề nghiệp: {request.MucTieuNgheNghiep}
- Ngôn ngữ / Công nghệ: {request.NgonNguCongNghe}
- Cấp độ: {request.CapDo}

Hãy suy nghĩ và đưa ra:
1. Tên đồ án (ngắn gọn, chuyên nghiệp).
2. Mô tả ngắn về đồ án này (khoảng 1-2 câu).
3. Danh sách các yêu cầu chức năng cốt lõi (khoảng 3-5 chức năng quan trọng nhất).
4. Cấu trúc Database cơ bản cho các chức năng trên (trình bày dưới dạng pseudo-code hoặc mã JSON tuỳ theo công nghệ, ngắn gọn, dễ hiểu).

BẠN PHẢI TRẢ VỀ DỮ LIỆU ĐÚNG CHUẨN JSON VỚI ĐỊNH DẠNG SAU, VÀ KHÔNG KÈM THEO BẤT KỲ VĂN BẢN NÀO KHÁC BÊN NGOÀI:
{{
    ""TenDoAn"": ""Tên Đồ Án"",
    ""MoTa"": ""Mô tả ngắn gọn"",
    ""YeuCauChucNang"": [
        ""Chức năng 1"",
        ""Chức năng 2""
    ],
    ""CauTrucDatabase"": ""// Collection Users\n{{ _id, name, email }}\n// Collection Products\n{{ _id, title, price }}""
}}
";

            var aiResult = await _gemini.GenerateAsync(prompt);

            var resultChuanHoa = ChuanHoaJsonTuAIHelper.ChuanHoa(aiResult);

            var responseDto = JsonSerializer.Deserialize<SinhDoAnResponseDto>(resultChuanHoa, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (responseDto == null)
            {
                throw new Exception("Không thể parse kết quả từ AI thành JSON hợp lệ.");
            }

            return responseDto;
        }
    }
}
