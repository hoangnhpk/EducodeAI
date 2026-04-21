using System.Text.Json;
using educodeai_server.Data;
using educodeai_server.DTOs.BaiTap;
using educodeai_server.Models;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class BaiTapThucHanhHocVienService
    {
        private readonly EduCodeAIDbContext _context;
        private readonly BaiTapService _compilerService;

        public BaiTapThucHanhHocVienService(EduCodeAIDbContext context, BaiTapService compilerService)
        {
            _context = context;
            _compilerService = compilerService;
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
                }
                else
                {
                    string actualRaw = runResult.output ?? "";
                    string cleanActual = actualRaw.Trim().Replace("\r\n", "\n");
                    string cleanExpected = tc.OutputMongDoi.Trim().Replace("\r\n", "\n");

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
    }
}
