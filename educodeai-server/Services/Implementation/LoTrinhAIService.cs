using System.Text.Json;
using educodeai_server.DTOs.AI;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;

namespace educodeai_server.Services.Implementation
{
    public class LoTrinhAIService : ILoTrinhAIService
    {
        private readonly IKhoaHocRepository _khoaHocRepo;
        private readonly ILoTrinhAIRepository _loTrinhRepo;
        private readonly IGeminiAIService _gemini;

        public LoTrinhAIService(
            IKhoaHocRepository khoaHocRepo,
            ILoTrinhAIRepository loTrinhRepo,
            IGeminiAIService gemini)
        {
            _khoaHocRepo = khoaHocRepo;
            _loTrinhRepo = loTrinhRepo;
            _gemini = gemini;
        }

        public async Task<LoTrinhAIResponseDto> TaoLoTrinhAsync(
            int maNguoiDung,
            CreateLoTrinhAIDto dto)
        {
            // Validate
            if(string.IsNullOrEmpty(dto.MucTieuNgheNghiep))
            {
                throw new ArgumentException("Mục tiêu nghề nghiệp không được để trống.");
            }    

            // Lấy khoá học phù hợp
            var khoaHoc = await _khoaHocRepo.GetKhoaHocPhuHopAsync(dto);

            Console.WriteLine($"[LoTrinhAIService] Tìm thấy {khoaHoc.Count} khoá học phù hợp.");

            if (khoaHoc == null || !khoaHoc.Any())
            {
                throw new ArgumentException("Không tìm thấy khoá học phù hợp để tạo lộ trình.");
            }

            // Serialize JSON
            var khoaHocJson = JsonSerializer.Serialize(khoaHoc);

            // Build prompt
            var prompt = Build(dto, khoaHocJson);

            // Call AI
            var aiResult = await _gemini.GenerateAsync(prompt);

            // Save DB
            var loTrinh = new LoTrinhAIModel
            {
                MaNguoiDung = 8,
                YeuCau = prompt,
                NoiDungJSON = aiResult,
                TrangThai = "Generated",
                NgayTao = DateTime.Now
            };

            await _loTrinhRepo.AddAsync(loTrinh);

            return new LoTrinhAIResponseDto
            {
                MaLoTrinh = loTrinh.MaLoTrinh,
                NoiDungJSON = aiResult
            };
        }

        public static string Build(
            CreateLoTrinhAIDto dto,
            string khoaHocJson)
        {
            var outputSchema = """
                {
                  "tongThoiGianTuan": 0,
                  "loTrinh": [
                    {
                      "tuan": 1,
                      "mucTieu": "",
                      "khoaHocSuDung": [
                        {
                          "maKhoaHoc": 0,
                          "tenKhoaHoc": "",
                          "noiDungChinh": ""
                        }
                      ]
                    }
                  ]
                }
                """;
            return $"""
                Bạn là AI Coach của hệ thống EduCodeAI.
                CHỈ được sử dụng dữ liệu được cung cấp, KHÔNG được tự tạo khoá học.

                === INPUT: KHOÁ HỌC (JSON) ===
                {khoaHocJson}

                === INPUT: HỌC VIÊN ===
                Trình độ hiện tại: {dto.TrinhDoHienTai}
                Phong cách học: {dto.PhongCachHoc}
                Mục tiêu nghề nghiệp: {dto.MucTieuNgheNghiep}
                Thời gian học dự kiến: {dto.ThoiGianHocDuKien}
                Thời gian học mỗi tuần: {dto.ThoiGianMoiTuan} giờ
                Kiến thức đã có: {dto.KienThucHienCo}
                Kinh nghiệm thực tế: {dto.KinhNghiemThucTe}
                Khó khăn hiện tại: {dto.KhoKhanHienTai}
                Lĩnh vực muốn tập trung: {string.Join(", ", dto.LinhVucTapTrung ?? new())}

                === YÊU CẦU XỬ LÝ ===
                1. Tạo lộ trình học theo từng tuần.
                2. Bỏ qua hoặc rút gọn nội dung học viên đã biết.
                3. Chỉ sử dụng khoá học trong danh sách INPUT.
                4. Không suy đoán, không thêm dữ liệu ngoài.
                5. Kết quả trả về JSON thuần, không giải thích.
                6. Nếu một khoá học dài, có thể chia ra nhiều tuần.
                7. BẮT BUỘC tạo ít nhất 1 tuần học nếu có bất kỳ khoá học nào phù hợp.

                === OUTPUT FORMAT (JSON) ===
                {outputSchema}

                KHÔNG suy luận từng bước.
                KHÔNG giải thích.
                KHÔNG lập kế hoạch nội bộ.
                Chia tuần một cách trực tiếp.
                Chỉ trả kết quả cuối cùng.
                """;
        }
    }

}
