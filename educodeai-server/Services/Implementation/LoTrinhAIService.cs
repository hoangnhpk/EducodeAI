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
            if(string.IsNullOrEmpty(dto.MucTieuNgheNghiep))
            {
                throw new ArgumentException("Mục tiêu nghề nghiệp không được để trống.");
            }    

            var khoaHoc = await _khoaHocRepo.GetKhoaHocPhuHopAsync(dto);


            if (khoaHoc == null || !khoaHoc.Any())
            {
                throw new ArgumentException("Không tìm thấy khoá học phù hợp để tạo lộ trình.");
            }

            var khoaHocJson = JsonSerializer.Serialize(khoaHoc);

            dto.ThoiGianHocDuKien = dto.ThoiGianHocDuKien * 4;

            var prompt = Build(dto, khoaHocJson);


            var aiResult = await _gemini.GenerateAsync(prompt);

            var resultChuanHoa = ChuanHoaJsonTuAI.ChuanHoa(aiResult);

            var resultusageMetadata = ChuanHoaJsonTuAI.usageMetadata(aiResult);
            Console.WriteLine("[LoTrinhAIService] AI result usageMetadata: " + resultusageMetadata);

            var loTrinh = new LoTrinhAIModel
            {
                MaNguoiDung = maNguoiDung,
                YeuCau = prompt,
                NoiDungJSON = resultChuanHoa,
                TrangThai = "Nháp",
                NgayTao = DateTime.Now
            };

            await _loTrinhRepo.AddAsync(loTrinh);

            return new LoTrinhAIResponseDto
            {
                MaLoTrinh = loTrinh.MaLoTrinh,
                NoiDungJSON = resultChuanHoa
            };
        }

        public async Task<bool> XacNhanLoTrinhAsync(int maLoTrinh)
        {
            var loTrinh = await _loTrinhRepo.GetByIdAsync(maLoTrinh);
            if (loTrinh == null) throw new Exception("Không tìm thấy lộ trình");

            loTrinh.TrangThai = "Hoạt động"; // Chuyển sang chính thức
            await _loTrinhRepo.UpdateAsync(loTrinh);

            return true;
        }

        public static string Build(
            CreateLoTrinhAIDto dto,
            string khoaHocJson)
        {
            var outputSchema = """
                {
                  "tenLoTrinh": "",
                  "moTaChung": "",
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
                          "noiDungChinh": "",
                          "ghiChu": ""
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

                === YÊU CẦU XỬ LÝ ===
                1. Tạo lộ trình học theo từng tuần.
                2. Bỏ qua hoặc rút gọn các khoá học trùng với kiến thức học viên đã có.
                3. Chỉ sử dụng khoá học trong danh sách INPUT.
                4. Tổng số tuần KHÔNG ĐƯỢC vượt quá thời gian học dự kiến của học viên.
                5. Có thể chia một khoá học ra nhiều tuần nếu thời lượng dài.
                6. Phải tạo ÍT NHẤT 1 tuần học nếu tồn tại khoá học phù hợp.
                7. Tối đa 4 giai đoạn học chính.
                8. Mỗi giai đoạn:
                - Chỉ tập trung MỘT lĩnh vực liên quan trực tiếp đến mục tiêu nghề nghiệp
                - Có mục tiêu rõ ràng
                - Có sự liên kết logic với giai đoạn trước
                9. Không lan man sang lĩnh vực khác nếu không phục vụ mục tiêu nghề nghiệp.
                10. Tổng thời gian học = tổng số tuần trong toàn bộ lộ trình
                11. Sắp xếp giai đoạn 1 cách trật tự phải đi từ cái cơ bản đến cái khó
                12. Không được chuyển sang ngôn ngữ lập trình khác trừ khi danh sách input không tồn tại bất kỳ khoá học nào phù hợp cho ngôn ngữ mà học viên đã có khi đó phải viết vào ghiChu ở khoaHocSuDung..
                13. Mỗi 1 nghề nghiệp chỉ được chọn 1 ngôn ngữ lập trình chính để tập trung không mở rộng, không tham khảo, không so sánh.
                14. Các kiến thức nền tảng (ví dụ: Nhập môn CNTT, tư duy lập trình, toán nền, xác suất thống kê cơ bản)
                    BẮT BUỘC phải nằm ở giai đoạn đầu tiên nếu được sử dụng.
                15. KHÔNG được sắp xếp bất kỳ khoá học nhập môn / kiến thức nền chung
                    sau khi đã bắt đầu giai đoạn học chuyên ngành chính của nghề nghiệp.
                16. Không mở rộng sang kiến thức khác mà không phục vụ trực tiếp mục tiêu nghề nghiệp của học viên để tránh tốn thời gian.
                17. "Mở rộng kiến thức Backend" chỉ được hiểu là:
                - Kiến trúc
                - Hiệu năng
                - Bảo mật
                - Database
                - DevOps cơ bản
                TRÊN CÙNG ngôn ngữ lập trình đã chọn.

                JSON output PHẢI có cấu trúc GIỐNG HỆT schema dưới đây.
                Mọi mảng trong JSON phải có ít nhất 1 phần tử nếu có dữ liệu phù hợp.
                KHÔNG được thêm, bớt hoặc đổi tên field.
                Không markdown, không text, chỉ trả về JSON thuần có thể parse được, không string lồng string.
                Mọi field dạng số phải là number, không được null, không được string.
                Nếu không có khoá học phù hợp, trả về JSON với loTrinh là mảng rỗng.
                Tổng thời gian học được tính theo tổng tuần trong giai đoạn 

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
            // Từ đệm
            "ạ", "nhé", "nha", "ha", "à", "ơi", "nhỉ", "nè", "cơ", "chứ",

            // Đại từ
            "tôi", "mình", "tớ", "tao", "bạn", "cậu", "anh", "chị", "em",
            "chúng", "chúng tôi", "chúng ta",

            // Động từ & ý định
            "muốn", "muốn biết", "cần", "học", "tìm", "đang tìm", "tìm hiểu",
            "biết", "làm", "có", "là", "được", "bị", "đang", "sẽ", "đã",
            "nên", "định", "dự định", "bắt đầu", "mới", "lần đầu",

            // Giới từ / liên từ
            "về", "cho", "với", "từ", "đến", "trong", "ngoài", "trên", "dưới",
            "và", "hoặc", "hay", "nhưng", "thì", "mà", "để", "khi", "vào",

            // Lượng từ
            "một", "các", "những", "nhiều", "ít", "mỗi", "vài",
            "rất", "khá", "hơi", "quá",

            // Thời gian
            "hiện tại", "bây giờ", "sau này", "trước đây", "lâu dài", "ngắn hạn",

            // Đánh giá
            "tốt", "hay", "ổn", "phù hợp", "hiệu quả", "nhanh", "chậm", "dễ", "khó",

            // Từ chung chung
            "cái", "việc", "thứ", "vấn đề", "điều", "phần", "loại", "kiểu", "dạng", "thêm",

            // Câu hỏi
            "làm sao", "như thế nào", "bao nhiêu", "tại sao", "vì sao",
            "liệu", "có thể", "có phải", "nên không", "được không", "không biết",

            // Ngữ cảnh lập trình
            "ngôn", "ngữ", "lập", "trình", "khóa", "học", "kiến", "thức",
            "cơ bản", "nâng cao"
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
            ["frontend"] = new[]
            {
                "giao", "diện", "frontend", "ui", "ux", "web", "website", "trang"
            },

            // Backend
            ["backend"] = new[]
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

            Console.WriteLine("[LoTrinhAIService] Từ khoá trích xuất: " + string.Join(", ", tuKhoa));

            var keywordChuanHoa = ChuanHoa(tuKhoa);

            Console.WriteLine("[LoTrinhAIService] Từ khoá sau chuẩn hoá: " + string.Join(", ", keywordChuanHoa));

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
                          "noiDungChinh": "",
                          "ghiChu": ""
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
                    - Nếu không có khoá học phù hợp với kiến thức user đã có thì khi chọn kiến thức khác phải khi vào ghi chú ở khoá học đó.
                    - Mỗi 1 nghề nghiệp chỉ được chọn 1 ngôn ngữ lập trình chính để tập trung.
                    """;
        }


    }

}
