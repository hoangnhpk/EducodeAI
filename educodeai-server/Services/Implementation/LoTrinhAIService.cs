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

            var khoaHoc = await _khoaHocRepo.GetKhoaHocPhuHopAsync(dto);

            Console.WriteLine($"[LoTrinhAIService] Tìm thấy {khoaHoc.Count} khoá học phù hợp.");

            if (khoaHoc == null || !khoaHoc.Any())
            {
                throw new ArgumentException("Không tìm thấy khoá học phù hợp để tạo lộ trình.");
            }

            var khoaHocJson = JsonSerializer.Serialize(khoaHoc);

            dto.ThoiGianHocDuKien = dto.ThoiGianHocDuKien * 4; // Chuyển tháng sang tuần

            var prompt = Build(dto, khoaHocJson);

            var aiResult = await _gemini.GenerateAsync(prompt);

            var resultChuanHoa = ChuanHoaJsonTuAI.ChuanHoa(aiResult);

            var loTrinh = new LoTrinhAIModel
            {
                MaNguoiDung = 8,
                YeuCau = prompt,
                NoiDungJSON = resultChuanHoa,
                TrangThai = "Generated",
                NgayTao = DateTime.Now
            };

            await _loTrinhRepo.AddAsync(loTrinh);

            return new LoTrinhAIResponseDto
            {
                MaLoTrinh = loTrinh.MaLoTrinh,
                NoiDungJSON = resultChuanHoa
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
                      "GiaiDoan": 1,
                      "mucTieu": "",
                      "khoaHocSuDung": [
                        {
                          "maKhoaHoc": 0,
                          "TuTuan": 0,  
                          "DenTuan": 0,
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
                Thời gian học dự kiến: {dto.ThoiGianHocDuKien} tuần
                Thời gian học mỗi tuần: {dto.ThoiGianMoiTuan} giờ
                Kiến thức đã có: {dto.KienThucHienCo}
                Kinh nghiệm thực tế: {dto.KinhNghiemThucTe}
                Khó khăn hiện tại: {dto.KhoKhanHienTai}
                Lĩnh vực muốn tập trung: {string.Join(", ", dto.LinhVucTapTrung ?? new())}

                === YÊU CẦU XỬ LÝ ===
                1. Tạo lộ trình học theo từng tuần.
                2. Bỏ qua hoặc rút gọn nội dung học viên đã biết.
                3. Chỉ sử dụng khoá học trong danh sách INPUT.
                4. Không suy đoán ra ngoài dữ liệu, nhưng được suy luận nội bộ để chia tuần.
                5. Kết quả trả về JSON thuần, không giải thích.
                6. Nếu một khoá học dài, có thể chia ra nhiều tuần.
                7. BẮT BUỘC tạo ít nhất 1 tuần học nếu có bất kỳ khoá học nào phù hợp.
                8. tối đa 4 giai đoạn học chính, tương ứng với các lĩnh vực tập trung
                9. Mỗi giai đoạn học cần có mục tiêu rõ ràng, liên quan đến lĩnh vực tập trung, và có sự liên kết với nhau.

                JSON output PHẢI có cấu trúc GIỐNG HỆT schema dưới đây.
                Mọi mảng trong JSON phải có ít nhất 1 phần tử nếu có dữ liệu phù hợp.
                KHÔNG được thêm, bớt hoặc đổi tên field.
                Không markdown, không text, chỉ trả về JSON thuần có thể parse được, không string lồng string.
                Mọi field dạng số phải là number, không được null, không được string.
                Nếu không có khoá học phù hợp, trả về JSON với loTrinh là mảng rỗng.

                === OUTPUT FORMAT (JSON) ===
                {outputSchema}

                KHÔNG suy luận từng bước.
                KHÔNG giải thích.
                KHÔNG lập kế hoạch nội bộ.
                Chia tuần một cách trực tiếp.
                Chỉ trả kết quả cuối cùng.
                """;
        }

        private static readonly HashSet<string> StopWords = new()
        {
            "tôi", "muốn", "học", "thêm", "về",
            "là", "cho", "và", "hoặc", "các", "một"
        };

        public static List<string> Extract(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return new();

            return input
                .ToLower()
                .Replace(",", "")
                .Replace(".", "")
                .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                .Where(x => x.Length >= 2 && !StopWords.Contains(x))
                .Distinct()
                .ToList();
        }

        public static readonly Dictionary<string, string[]> Map = new()
        {
            // Frontend
            ["fe"] = new[]
            {
                "giao", "diện", "frontend", "ui", "ux", "web", "website", "trang"
            },

            // Backend
            ["be"] = new[]
            {
                "backend", "máy", "chủ", "server", "api", "rest"
            },

            // Mobile
            ["mobile"] = new[]
            {
                "mobile", "điện", "thoại", "android", "ios"
            }
        };

        public static readonly HashSet<string> Languages = new()
        {
            "html", "css", "js", "javascript",
            "c#", "java", "python", "php",
            "sql", "mysql", "postgres",
            ".net", "asp.net", "node", "nodejs"
        };

        public static List<string> ChuanHoa(List<string> tuKhoaNguoiDung)
        {
            var ketQua = new HashSet<string>();

            foreach (var tu in tuKhoaNguoiDung)
            {
                if (Languages.Contains(tu))
                {
                    ketQua.Add(tu);
                    continue;
                }

                foreach (var domain in Map)
                {
                    if (domain.Value.Contains(tu))
                    {
                        ketQua.Add(domain.Key);
                    }
                }
            }

            return ketQua.ToList();
        }

        public async Task<LoTrinhAIResponseDto> CapNhatLoTrinhAsync(int maNguoiDung, UpdateLoTrinhDto dto)
        {
            var loTrinhCu = await _loTrinhRepo.GetByIdAsync(dto.MaLoTrinh);
            if (loTrinhCu == null)
                throw new Exception("Không tìm thấy lộ trình");

            var tuKhoa = Extract(dto.YeuCauMoi);

            var keywordChuanHoa = ChuanHoa(tuKhoa);

            var khoaHoc = await _khoaHocRepo.GetKhoaHocTheoKeywordAsync(keywordChuanHoa);
            Console.WriteLine($"[LoTrinhAIService] Tìm thấy {khoaHoc.Count} khoá học phù hợp để cập nhật.");
            var khoaHocJson = JsonSerializer.Serialize(khoaHoc);

            var prompt = TaoPromptChinhSua(
                loTrinhCu.NoiDungJSON!,
                dto.YeuCauMoi,
                khoaHocJson);

            var aiResult = await _gemini.GenerateAsync(prompt);

            Console.WriteLine("[LoTrinhAIService] AI response received for update: " + aiResult);

            var resultChuanHoa = ChuanHoaJsonTuAI.ChuanHoa(aiResult);

            loTrinhCu.NoiDungJSON = resultChuanHoa;
            loTrinhCu.YeuCau = dto.YeuCauMoi;
            loTrinhCu.TrangThai = "Updated";

            await _loTrinhRepo.UpdateAsync(loTrinhCu);

            return new LoTrinhAIResponseDto
            {
                MaLoTrinh = loTrinhCu.MaLoTrinh,
                NoiDungJSON = resultChuanHoa
            };
        }

        public static string TaoPromptChinhSua(string loTrinhCuJson, string yeuCauMoi, string khoaHocJson)
        {
            var outputSchema = """
                {
                  "tongThoiGianTuan": 0,
                  "loTrinh": [
                    {
                      "GiaiDoan": 1,
                      "mucTieu": "",
                      "khoaHocSuDung": [
                        {
                          "maKhoaHoc": 0,
                          "TuTuan": 0,  
                          "DenTuan": 0,
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

                    Đây là lộ trình học hiện tại (JSON):
                    {loTrinhCuJson}

                    Yêu cầu chỉnh sửa của người dùng:
                    {yeuCauMoi}

                    Danh sách khoá học phù hợp (JSON):
                    {khoaHocJson}

                    === OUTPUT FORMAT (JSON) ===
                    {outputSchema}

                    Hãy chỉnh sửa lộ trình cho phù hợp.
                    - Giữ nguyên cấu trúc JSON
                    - Chỉ chỉnh phần liên quan
                    - Không giải thích
                    - Chỉ trả JSON thuần không có text, markdown
                    - KHÔNG suy luận từng bước.
                    - KHÔNG lập kế hoạch nội bộ.
                    - Chỉ trả kết quả cuối cùng.
                    """;
        }


    }

}
