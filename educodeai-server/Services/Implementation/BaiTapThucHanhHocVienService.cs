using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using educodeai_server.Data;
using educodeai_server.DTOs.BaiTap;
using educodeai_server.Helpers;
using educodeai_server.Models;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class BaiTapThucHanhHocVienService
    {
        private readonly EduCodeAIDbContext _context;
        private readonly BaiTapService _compilerService;
        private readonly IGeminiAIService _gemini;

        public BaiTapThucHanhHocVienService(EduCodeAIDbContext context, BaiTapService compilerService, IGeminiAIService gemini)
        {
            _context = context;
            _compilerService = compilerService;
            _gemini = gemini;
        }

        public async Task<BaiTapThucHanhHocVienRenderDTO?> GetThongTinBaiTapAsync(int maBaiTap)
        {
            var model = await _context.BaiTapThucHanhs
                .Include(b => b.TestCases)
                .FirstOrDefaultAsync(b => b.MaBaiTap == maBaiTap);

            if (model == null) return null;

            return new BaiTapThucHanhHocVienRenderDTO
            {
                MaBaiTap = model.MaBaiTap,
                TieuDe = model.TieuDe,
                MoTaDeBai = model.MoTaDeBai,
                NgonNgu = model.NgonNgu,
                MucDo = model.MucDo,
                GoiY = model.GoiY,
                LoiGiaiMau = model.LoiGiaiMau,
                TestCases = model.TestCases.Select(tc => new TestCaseHienThiDTO
                {
                    MaTestCase = tc.MaTestCase,
                    InputDuLieu = tc.InputDuLieu,
                    // Giấu output của test ẩn
                    OutputMongDoi = tc.LaTestAn ? "???" : tc.OutputMongDoi,
                    LaTestAn = tc.LaTestAn
                }).ToList()
            };
        }

        public async Task<KetQuaSubmitDTO> SubmitCodeAsync(int maNguoiDung, int maBaiTap, SubmitCodeRequestDTO request)
        {
            var model = await _context.BaiTapThucHanhs
                .Include(b => b.TestCases)
                .FirstOrDefaultAsync(b => b.MaBaiTap == maBaiTap);

            if (model == null) throw new Exception("Không tìm thấy bài tập.");

            var ketQuaOut = new KetQuaSubmitDTO { ThanhCong = true, Results = new List<TestCaseResultDTO>() };
            float totalScore = 0;
            bool isAllPassed = true;

            // Lặp qua các test case. 
            // Nếu dùng JDoodle Free, gọi liên tục có thể bị reject do giới hạn Request / second. 
            // Tốt nhất là chạy tuần tự với một chút delay nếu cần.
            foreach (var tc in model.TestCases.OrderBy(t => t.ThuTu))
            {
                var tr = new TestCaseResultDTO
                {
                    MaTestCase = tc.MaTestCase,
                    LaTestAn = tc.LaTestAn,
                    ExpectedOutput = tc.LaTestAn ? "???" : tc.OutputMongDoi,
                    Input = tc.LaTestAn ? "???" : tc.InputDuLieu,
                    Diem = tc.Diem
                };

                // Chạy code qua Compiler
                var runResult = await _compilerService.ExecuteCodeAsync(request.NgonNgu, request.Code, tc.InputDuLieu);

                if (runResult == null || runResult.statusCode != 200)
                {
                    tr.IsPassed = false;
                    tr.ErrorMessage = runResult?.error ?? "Lỗi gọi API biên dịch.";
                    tr.ActualOutput = runResult?.output ?? "";
                    isAllPassed = false;

                    // Không tiếp tục tạo thêm container khi dịch vụ chấm đang quá tải.
                    if (runResult?.statusCode == 503 || tr.ErrorMessage.Contains("[INFRA]", StringComparison.OrdinalIgnoreCase))
                    {
                        ketQuaOut.ThanhCong = false;
                        break;
                    }
                }
                else
                {
                    string actualRaw = runResult.output ?? "";
                    string cleanActual = ChuanHoaOutputChamDiem(actualRaw);
                    string cleanExpected = ChuanHoaOutputChamDiem(tc.OutputMongDoi);

                    tr.ActualOutput = tc.LaTestAn ? "???" : actualRaw;

                    if (cleanActual == cleanExpected)
                    {
                        tr.IsPassed = true;
                        totalScore += tc.Diem;
                    }
                    else
                    {
                        tr.IsPassed = false;
                        isAllPassed = false;
                    }
                }

                ketQuaOut.Results.Add(tr);
            }

            ketQuaOut.TongDiem = totalScore;
            ketQuaOut.PassedAll = isAllPassed;

            // Lưu kết quả vào CSDL
            var ketQuaNop = new KetQuaLamBaiModel
            {
                MaNguoiDung = maNguoiDung,
                MaBaiTap = maBaiTap,
                NoiDungNopJSON = JsonSerializer.Serialize(new { code = request.Code, lang = request.NgonNgu }),
                DiemSo = totalScore,
                TrangThai = isAllPassed,
                NgayNop = DateTime.UtcNow
            };

            _context.KetQuaLamBais.Add(ketQuaNop);
            await _context.SaveChangesAsync();

            return ketQuaOut;
        }

        /// <summary>
        /// Chuẩn hóa output để bỏ qua khác biệt whitespace và dòng phân cách cuối.
        /// </summary>
        private static string ChuanHoaOutputChamDiem(string output)
        {
            var lines = output.Replace("\r\n", "\n").Replace('\r', '\n')
                .Split('\n')
                .Select(line => Regex.Replace(line.Trim(), @"[ \t]+", " "))
                .Where(line => line.Length > 0)
                .ToList();

            while (lines.Count > 0 && Regex.IsMatch(lines[^1], @"^[\-_=~*]{3,}$"))
                lines.RemoveAt(lines.Count - 1);

            return string.Join("\n", lines);
        }

        /// <summary>
        /// Gọi Gemini AI để phân tích lỗi code của học viên và đưa ra gợi ý sửa.
        /// </summary>
        public async Task<AIPhanTichLoiDTO> PhanTichLoiCodeAIAsync(PhanTichLoiCodeRequestDTO request)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Bạn là một trợ giảng lập trình chuyên nghiệp tại EduCodeAI.");
            sb.AppendLine("Học viên vừa nộp bài tập thực hành và code bị sai. Hãy phân tích và đưa ra hướng dẫn.");
            sb.AppendLine();
            sb.AppendLine($"**Ngôn ngữ:** {request.NgonNgu}");
            sb.AppendLine($"**Đề bài:** {request.TieuDeBai}");
            sb.AppendLine();
            sb.AppendLine("**Code của học viên:**");
            sb.AppendLine("```");
            sb.AppendLine(request.Code);
            sb.AppendLine("```");
            sb.AppendLine();

            if (!string.IsNullOrWhiteSpace(request.ThongBaoLoi))
            {
                sb.AppendLine($"**Thông báo lỗi biên dịch/runtime:**");
                sb.AppendLine("```");
                sb.AppendLine(request.ThongBaoLoi);
                sb.AppendLine("```");
                sb.AppendLine();
            }

            if (request.TestCasesSai != null && request.TestCasesSai.Count > 0)
            {
                sb.AppendLine("**Các test case bị sai:**");
                foreach (var tc in request.TestCasesSai.Take(3))
                {
                    sb.AppendLine($"- Input: `{tc.Input}` | Kết quả của bạn: `{tc.KetQuaThucTe}` | Kết quả mong đợi: `{tc.KetQuaMongDoi}`");
                }
                sb.AppendLine();
            }

            sb.AppendLine("**NHIỆM VỤ (QUAN TRỌNG - PHẢI TUÂN THỦ NGHIÊM NGẶT):**");
            sb.AppendLine("1. **KHÔNG BAO GIỜ** viết code giải pháp hoàn chỉnh. Tuyệt đối cấm.");
            sb.AppendLine("2. Giải thích ngắn gọn **lỗi sai** là gì (1-2 câu).");
            sb.AppendLine("3. Đưa ra **gợi ý hướng suy nghĩ** để học viên tự sửa (không quá 3 gạch đầu dòng).");
            sb.AppendLine("4. Nếu có lỗi cú pháp, chỉ **chỉ ra dòng/vị trí lỗi** chứ không sửa thay.");
            sb.AppendLine("5. Dùng Markdown, ngắn gọn, thân thiện.");

            try
            {
                var rawResult = await _gemini.GenerateAsync(sb.ToString());
                var noiDung = ChuanHoaJsonTuAIHelper.LayTextChatTuAI(rawResult);
                return new AIPhanTichLoiDTO { ThanhCong = true, NoiDungPhanTich = noiDung };
            }
            catch (Exception ex)
            {
                return new AIPhanTichLoiDTO
                {
                    ThanhCong = false,
                    NoiDungPhanTich = $"AI đang bận, vui lòng thử lại sau. ({ex.Message})"
                };
            }
        }
    }
}
