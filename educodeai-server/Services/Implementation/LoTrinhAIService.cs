using System.Text.Json;
using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

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
            if (string.IsNullOrEmpty(dto.MucTieuNgheNghiep))
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

            var resultChuanHoa = ChuanHoaJsonTuAIHelper.ChuanHoa(aiResult);
            resultChuanHoa = await EnrichCoursePricesAsync(resultChuanHoa);

            var resultusageMetadata = ChuanHoaJsonTuAIHelper.usageMetadata(aiResult);
            Console.WriteLine("[LoTrinhAIService] AI result usageMetadata: " + resultusageMetadata);

            // Generation is intentionally client-side draft only. Persist only on Apply.
            return new LoTrinhAIResponseDto
            {
                MaLoTrinh = null,
                NoiDungJSON = resultChuanHoa
            };
        }

        public async Task<bool> XacNhanLoTrinhAsync(int maNguoiDung, SaveLoTrinhDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.NoiDungJSON))
                throw new ArgumentException("Nội dung lộ trình không được để trống.");

            var noiDung = JsonSerializer.Deserialize<NoiDungLoTrinhDTO>(dto.NoiDungJSON)
                ?? throw new ArgumentException("Nội dung lộ trình không hợp lệ.");

            var danhSachMaKhoaHoc = noiDung.LoTrinh
                .SelectMany(gd => gd.KhoaHocSuDung)
                .Select(kh => kh.MaKhoaHoc)
                .Distinct()
                .ToList();

            if (!danhSachMaKhoaHoc.Any())
                throw new ArgumentException("Lộ trình không có khóa học.");

            // Apply only persists the roadmap. It never enrolls or starts payment.
            var loTrinh = new LoTrinhAIModel
            {
                MaNguoiDung = maNguoiDung,
                YeuCau = dto.YeuCau ?? noiDung.TenLoTrinh,
                NoiDungJSON = dto.NoiDungJSON,
                TrangThai = "Hoạt động",
                NgayTao = DateTime.UtcNow
            };

            await _loTrinhRepo.AddAsync(loTrinh);
            return true;
        }

        private async Task<string> EnrichCoursePricesAsync(string noiDungJson)
        {
            var noiDung = JsonSerializer.Deserialize<NoiDungLoTrinhDTO>(noiDungJson)
                ?? throw new ArgumentException("Nội dung lộ trình không hợp lệ.");
            var ids = noiDung.LoTrinh.SelectMany(x => x.KhoaHocSuDung)
                .Select(x => x.MaKhoaHoc).Distinct().ToList();
            var courses = await _khoaHocRepo.GetKhoaHocByIdsAsync(ids);
            var byId = courses.ToDictionary(x => x.MaKhoaHoc);

            foreach (var course in noiDung.LoTrinh.SelectMany(x => x.KhoaHocSuDung))
            {
                if (byId.TryGetValue(course.MaKhoaHoc, out var source))
                {
                    course.TenKhoaHoc = source.TenKhoaHoc;
                    course.GiaKhoaHoc = source.GiaKhoaHoc;
                    course.DonViTienTe = source.DonViTienTe;
                }
            }

            return JsonSerializer.Serialize(noiDung);
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
                17. Các ngôn ngữ sql chỉ được chọn 1 loại phù hợp nhất.

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
            if (string.IsNullOrWhiteSpace(dto.NoiDungJSON))
                throw new ArgumentException("Nội dung bản nháp không được để trống.");

            var tuKhoa = Extract(dto.YeuCauMoi);
            var keywordChuanHoa = ChuanHoa(tuKhoa);
            var khoaHoc = await _khoaHocRepo.GetKhoaHocTheoKeywordAsync(keywordChuanHoa);
            var khoaHocJson = JsonSerializer.Serialize(khoaHoc);
            var prompt = TaoPromptChinhSua(dto.NoiDungJSON, dto.YeuCauMoi, khoaHocJson);
            var aiResult = await _gemini.GenerateAsync(prompt);
            var resultChuanHoa = ChuanHoaJsonTuAIHelper.ChuanHoa(aiResult);
            resultChuanHoa = await EnrichCoursePricesAsync(resultChuanHoa);

            return new LoTrinhAIResponseDto
            {
                MaLoTrinh = null,
                NoiDungJSON = resultChuanHoa
            };
        }

        public static string TaoPromptChinhSua(string loTrinhCuJson, string yeuCauMoi, string khoaHocJson)
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

        public async Task<List<LoTrinhAICuaToiResponseDTO>?> GetLoTrinhCuaToiAsync(int maNguoiDung)
        {
            var loTrinhs = await _loTrinhRepo.GetByUserIdAsync(maNguoiDung);
            var danhSachDangKy = await _khoaHocRepo.GetDangKyKhoaHocAsync(maNguoiDung);

            var ketQua = new List<LoTrinhAICuaToiResponseDTO>();

            foreach (var loTrinh in loTrinhs)
            {
                var noiDung = JsonSerializer.Deserialize<NoiDungLoTrinhDTO>(loTrinh.NoiDungJSON);
                if (noiDung == null) continue;

                var (soGdHoanThanh, phanTram) =
                    TinhTienDoTheoGiaiDoan(noiDung.LoTrinh, danhSachDangKy);

                ketQua.Add(new LoTrinhAICuaToiResponseDTO
                {
                    MaLoTrinh = loTrinh.MaLoTrinh,
                    TenLoTrinh = noiDung.TenLoTrinh,
                    MoTaChung = noiDung.MoTaChung,
                    TongSoKhoaHoc = noiDung.LoTrinh.Sum(gd => gd.KhoaHocSuDung.Count),
                    TongThoiGianTuan = noiDung.TongThoiGianTuan,

                    TongSoGiaiDoan = noiDung.LoTrinh.Count,
                    SoGiaiDoanHoanThanh = soGdHoanThanh,

                    PhanTramHoanThanh = phanTram
                });
            }

            return ketQua;
        }

        public async Task<LoTrinhAICuaToiResponseDTO?> GetChiTietLoTrinhAsync(int maLoTrinh, int maNguoiDung)
        {
            var loTrinh = await _loTrinhRepo.GetByIdAsync(maLoTrinh);
            if (loTrinh == null || loTrinh.MaNguoiDung != maNguoiDung)
                throw new Exception("Không tìm thấy lộ trình");

            var noiDung = JsonSerializer.Deserialize<NoiDungLoTrinhDTO>(loTrinh.NoiDungJSON);
            if (noiDung == null)
                throw new Exception("Nội dung lộ trình không hợp lệ");

            var danhSachDangKy = await _khoaHocRepo.GetDangKyKhoaHocAsync(maNguoiDung);

            var (soGdHoanThanh, phanTram) =
                TinhTienDoTheoGiaiDoan(noiDung.LoTrinh, danhSachDangKy);

            // ===== Trạng thái chi tiết từng giai đoạn =====
            var giaiDoanProgress = new List<GiaiDoanProgressDTO>();

            foreach (var gd in noiDung.LoTrinh)
            {
                var maKhoaHocGd = gd.KhoaHocSuDung.Select(kh => kh.MaKhoaHoc).ToList();

                int khoahocHoanThanhCount = maKhoaHocGd.Count(maKH =>
                    danhSachDangKy.Any(dk =>
                        dk.MaKhoaHoc == maKH && (dk.TienDo == 100 || dk.TrangThai == "Hoàn thành")
                    )
                );

                // Giai đoạn chỉ được coi là xong khi ALL khoá học đều done
                bool daHoanThanhGiaiDoan = (maKhoaHocGd.Count > 0) && (khoahocHoanThanhCount == maKhoaHocGd.Count);

                var chiTietKhoaHocs = gd.KhoaHocSuDung.Select(khJson => {

                    return new KhoaHocLoTrinhChiTietDTO
                    {
                        MaKhoaHoc = khJson.MaKhoaHoc,
                        TenKhoaHoc = khJson.TenKhoaHoc,
                        NoiDungChinh = khJson.NoiDungChinh,
                        GhiChu = khJson.GhiChu,
                        TuTuan = khJson.TuTuan,
                        DenTuan = khJson.DenTuan,
                        Slug = SlugHelper.Generate(khJson.TenKhoaHoc)
                    };
                }).ToList();

                giaiDoanProgress.Add(new GiaiDoanProgressDTO
                {
                    GiaiDoan = gd.GiaiDoan,
                    MucTieu = gd.MucTieu,
                    TongKhoaHoc = maKhoaHocGd.Count,
                    KhoaHocHoanThanh = khoahocHoanThanhCount,
                    PhanTram = maKhoaHocGd.Count == 0 ? 0 : Math.Round((double)khoahocHoanThanhCount / maKhoaHocGd.Count * 100, 2),
                    HoanThanh = daHoanThanhGiaiDoan,
                    DanhSachKhoaHoc = chiTietKhoaHocs
                });
            }

            return new LoTrinhAICuaToiResponseDTO
            {
                MaLoTrinh = loTrinh.MaLoTrinh,
                TenLoTrinh = noiDung.TenLoTrinh,
                MoTaChung = noiDung.MoTaChung,
                TongSoKhoaHoc = noiDung.LoTrinh.Sum(gd => gd.KhoaHocSuDung.Count),
                TongThoiGianTuan = noiDung.TongThoiGianTuan,

                // Map lại cho chuẩn
                TongSoGiaiDoan = noiDung.LoTrinh.Count,
                SoGiaiDoanHoanThanh = soGdHoanThanh,

                PhanTramHoanThanh = phanTram,
                GiaiDoan = giaiDoanProgress
            };
        }

        private static (int soGiaiDoanHoanThanh, double phanTram) TinhTienDoTheoGiaiDoan(List<GiaiDoanDTO> giaiDoanJson, List<DangKyKhoaHocModel> danhSachDangKy)
        {
            if (giaiDoanJson == null || giaiDoanJson.Count == 0)
                return (0, 0);

            int tongGiaiDoan = giaiDoanJson.Count;
            int giaiDoanHoanThanh = 0;

            foreach (var gd in giaiDoanJson)
            {
                var maKhoaHocGd = gd.KhoaHocSuDung.Select(kh => kh.MaKhoaHoc).ToList();

                if (!maKhoaHocGd.Any()) continue;

                // Điểm mấu chốt: .All() -> Tất cả phải xong
                bool hoanThanhGd = maKhoaHocGd.All(maKH =>
                    danhSachDangKy.Any(dk =>
                        dk.MaKhoaHoc == maKH &&
                        (dk.TienDo == 100 || dk.TrangThai == "Hoàn thành")
                    )
                );

                if (hoanThanhGd)
                    giaiDoanHoanThanh++;
            }

            double phanTram = Math.Round((double)giaiDoanHoanThanh / tongGiaiDoan * 100, 2);

            return (giaiDoanHoanThanh, phanTram);
        }

    }
}
