using System.Text.Json;
using educodeai_server.Data;
using educodeai_server.DTOs.BaiTapThucHanh;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class BaiTapThucHanhService : IBaiTapThucHanhService
    {
        private readonly EduCodeAIDbContext _context;
        private readonly IGeminiAIService _geminiService;

        public BaiTapThucHanhService(EduCodeAIDbContext context, IGeminiAIService geminiService)
        {
            _context = context;
            _geminiService = geminiService;
        }

        public async Task<List<KhoaHocTreeDto>> GetCayDuLieuAsync(int maGiangVien)
        {
            return await _context.KhoaHocs
                .Where(kh => kh.MaGiangVien == maGiangVien)
                .Select(kh => new KhoaHocTreeDto
                {
                    MaKhoaHoc = kh.MaKhoaHoc,
                    TenKhoaHoc = kh.TenKhoaHoc,
                    DanhSachChuong = kh.ChuongHocs.Select(ch => new ChuongHocTreeDto
                    {
                        MaChuong = ch.MaChuong,
                        TenChuong = ch.TenChuong,
                        DanhSachBaiHoc = ch.BaiHocs.Select(bh => new BaiHocTreeDto
                        {
                            MaBaiHoc = bh.MaBaiHoc,
                            TieuDe = bh.TieuDe,
                            LoaiBaiHoc = bh.LoaiBaiHoc,
                            MaBaiTapThucHanh = bh.BaiTaps
                                .Where(bt => bt.BaiTapThucHanh != null)
                                .Select(bt => (int?)bt.BaiTapThucHanh.MaBaiTapTH)
                                .FirstOrDefault()
                        }).ToList()
                    }).ToList()
                }).ToListAsync();
        }

        public async Task<BaiTapThucHanhPreviewDto> GeneratePracticeExerciseAsync(TaoBaiTapThucHanhAiRequestDto request, int maGiangVien)
        {
            Console.WriteLine($"[DEBUG] GeneratePracticeExerciseAsync called. LessonId: {request.MaBaiHoc}, GiangVien: {maGiangVien}");
            // 1. Validate Ownership
            var baiHoc = await _context.BaiHocs
                .Include(bh => bh.ChuongHoc)
                    .ThenInclude(ch => ch.KhoaHoc)
                .FirstOrDefaultAsync(bh => bh.MaBaiHoc == request.MaBaiHoc);

            if (baiHoc == null || baiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền thao thác trên bài học này.");
            }

            // 2. AI Request Content
            string jsonSchema = @"
{
  ""metadata"": {
    ""title"": ""Tiêu đề bài tập"",
    ""difficulty"": ""Dễ"",
    ""language"": ""Python""
  },
  ""problemContent"": {
    ""description"": ""Nội dung đề bài chi tiết bằng Markdown.""
  },
  ""hints"": [
    { ""title"": ""Gợi ý 1"", ""content"": ""Nội dung gợi ý"", ""level"": 1 }
  ],
  ""solution"": {
    ""code"": ""Mã nguồn hoàn chỉnh"",
    ""explanation"": ""Giải thích thuật toán""
  },
  ""evaluation"": {
    ""testCases"": [
      { ""input"": ""1"", ""output"": ""1"", ""isHidden"": false, ""score"": 10 }
    ]
  }
}";

            string prompt = $"Hãy sinh một bài tập thực hành lập trình cho bài học: {baiHoc.TieuDe}. \n" +
                            $"Mục tiêu bài học: {baiHoc.NoiDung}. \n" +
                            $"Yêu cầu ngôn ngữ: {request.NgonNgu ?? "tự chọn"}. \n" +
                            $"Mức độ: {request.MucDo ?? "Dễ"}. \n" +
                            $"YeuCauBoSung: {request.HuongDanBoSung ?? "Không có"}. \n\n" +
                            $"TRẢ VỀ JSON trong khối code markdown ```json ... ``` theo cấu trúc sau: \n" +
                            jsonSchema;
            // 3. Call AI Service
            string aiResponseRaw = await _geminiService.GenerateAsync(prompt);

            // 4. Extract & Standardize JSON
            string aiJson = ChuanHoaJsonTuAIHelper.ChuanHoa(aiResponseRaw);
            Console.WriteLine("=== AI_JSON_FOR_DEBUG ===");
            Console.WriteLine(aiJson);

            // 5. Map AI JSON -> DTO
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString
                };
                
                var preview = JsonSerializer.Deserialize<BaiTapThucHanhPreviewDto>(aiJson, options);

                if (preview != null)
                {
                    // 6. Defensive Mapping & Logging
                    if (preview.Evaluation?.TestCases != null)
                    {
                        foreach (var tc in preview.Evaluation.TestCases)
                        {
                            // Nếu OutputMongDoi bị rỗng (do mismatch naming), ta có thể lấy từ Raw JSON nếu cần
                            // Tuy nhiên, vì ta đã đổi [JsonPropertyName("output")] cho OutputMongDoi nên nó sẽ tự map dúng.
                            // Ở dây ta log dể kiểm tra:
                            Console.WriteLine($"[DEBUG] TestCase: Input='{tc.InputDuLieu}', Output='{tc.OutputMongDoi}'");
                        }
                    }

                    preview.System.GeneratedAt = DateTime.Now;
                    preview.System.GeneratedBy = "EduCodeAI-Gen";

                    return preview;
                }
                
                throw new Exception("Không thể chuyển đổi dữ liệu từ AI.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SERALIZATION ERROR]: {ex.Message}. JSON: {aiJson}");
                throw new Exception("Lỗi khi xử lý cấu trúc dữ liệu từ AI: " + ex.Message);
            }
        }

        public async Task<BaiTapThucHanhPreviewDto> CreatePracticeExerciseAsync(BaiTapThucHanhPreviewDto dto, int maBaiHoc, int maGiangVien)
        {
            // 1. Validate Ownership (L?y hierarchy t? DB, kh?ng tin maBaiHoc t? Client)
            var baiHoc = await _context.BaiHocs
                .Include(bh => bh.ChuongHoc)
                    .ThenInclude(ch => ch.KhoaHoc)
                .FirstOrDefaultAsync(bh => bh.MaBaiHoc == maBaiHoc);

            if (baiHoc == null || baiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien)
            {
                throw new UnauthorizedAccessException("Quy?n truy c?p b? t? ch?i.");
            }

            var executionStrategy = _context.Database.CreateExecutionStrategy();

            return await executionStrategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // Create Parent BaiTap
                    var baiTap = new BaiTapModel { MaBaiHoc = maBaiHoc };
                    _context.BaiTaps.Add(baiTap);
                    await _context.SaveChangesAsync();

                    // Map DTO -> Model
                    var model = new BaiTapThucHanhModel
                    {
                        MaBaiTap = baiTap.MaBaiTap,
                        TieuDe = dto.Metadata.TieuDe,
                        MoTaDeBai = dto.ProblemContent.MoTaDeBai,
                        NgonNgu = dto.Metadata.NgonNgu,
                        MucDo = dto.Metadata.MucDo,
                        LoiGiaiMau = dto.Solution.LoiGiaiMau,
                        GoiY = string.Join("\n", dto.GoiYs.Select(g => $"- {g.TieuDe}: {g.NoiDung}")),
                        NgayTao = DateTime.UtcNow,
                        TrangThai = true
                    };

                    _context.BaiTapThucHanhs.Add(model);
                    await _context.SaveChangesAsync();

                    if (dto.Evaluation?.TestCases != null)
                    {
                        int thuTu = 0;
                        foreach (var tc in dto.Evaluation.TestCases)
                        {
                            _context.TestCaseThucHanhs.Add(new TestCaseThucHanhModel
                            {
                                MaBaiTapThucHanh = model.MaBaiTapTH,
                                InputDuLieu = tc.InputDuLieu,
                                OutputMongDoi = tc.OutputMongDoi,
                                LaTestAn = tc.LaTestAn,
                                Diem = tc.Diem,
                                ThuTu = thuTu++,
                                NgayTao = DateTime.UtcNow
                            });
                        }
                        await _context.SaveChangesAsync();
                    }

                    await transaction.CommitAsync();

                    return await GetDetailAsync(baiTap.MaBaiTap, maGiangVien);
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        public async Task<BaiTapThucHanhPreviewDto> GetDetailAsync(int maBaiTap, int maGiangVien)
        {
            var model = await _context.BaiTapThucHanhs
                .Include(m => m.BaiTap)
                    .ThenInclude(bt => bt.BaiHoc)
                        .ThenInclude(bh => bh.ChuongHoc)
                            .ThenInclude(ch => ch.KhoaHoc)
                .Include(m => m.TestCases)
                .FirstOrDefaultAsync(m => m.MaBaiTap == maBaiTap);

            if (model == null) return null!;

            // Ownership check
            if (model.BaiTap.BaiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xem bài tập này.");
            }

            return new BaiTapThucHanhPreviewDto
            {
                Metadata = new MetadataDto
                {
                    TieuDe = model.TieuDe,
                    NgonNgu = model.NgonNgu,
                    MucDo = model.MucDo
                },
                ProblemContent = new ProblemContentDto
                {
                    MoTaDeBai = model.MoTaDeBai
                },
                Solution = new SolutionDto
                {
                    LoiGiaiMau = model.LoiGiaiMau ?? "",
                    GiaiThich = model.GoiY ?? ""
                },
                Evaluation = new EvaluationDto
                {
                    TestCases = model.TestCases?.Select(tc => new TestCaseDto
                    {
                        InputDuLieu = tc.InputDuLieu,
                        OutputMongDoi = tc.OutputMongDoi,
                        LaTestAn = tc.LaTestAn,
                        Diem = tc.Diem
                    }).ToList() ?? new List<TestCaseDto>()
                },
                System = new SystemMetadataDto
                {
                    GeneratedAt = model.NgayTao
                }
            };
        }

        public async Task<bool> UpdateAsync(int maBaiTap, BaiTapThucHanhPreviewDto dto, int maGiangVien)
        {
            var model = await _context.BaiTapThucHanhs
                .Include(m => m.BaiTap)
                    .ThenInclude(bt => bt.BaiHoc)
                        .ThenInclude(bh => bh.ChuongHoc)
                            .ThenInclude(ch => ch.KhoaHoc)
                .Include(m => m.TestCases)
                .FirstOrDefaultAsync(m => m.MaBaiTap == maBaiTap);

            if (model == null || model.BaiTap.BaiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien)
            {
                throw new UnauthorizedAccessException("Không có quyền cập nhật.");
            }

            model.TieuDe = dto.Metadata.TieuDe;
            model.MoTaDeBai = dto.ProblemContent.MoTaDeBai;
            model.NgonNgu = dto.Metadata.NgonNgu;
            model.MucDo = dto.Metadata.MucDo;
            model.LoiGiaiMau = dto.Solution.LoiGiaiMau;
            model.GoiY = dto.Solution.GiaiThich;
            model.TrangThai = true;

            // Simple update testcases: remove and add
            _context.TestCaseThucHanhs.RemoveRange(model.TestCases);
            int thuTu = 0;
            if (dto.Evaluation?.TestCases != null)
            {
                foreach (var tc in dto.Evaluation.TestCases)
                {
                    _context.TestCaseThucHanhs.Add(new TestCaseThucHanhModel
                    {
                        MaBaiTapThucHanh = model.MaBaiTapTH,
                        InputDuLieu = tc.InputDuLieu,
                        OutputMongDoi = tc.OutputMongDoi,
                        LaTestAn = tc.LaTestAn,
                        Diem = tc.Diem,
                        ThuTu = thuTu++,
                        NgayTao = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int maBaiTap, int maGiangVien)
        {
            var baiTap = await _context.BaiTaps
                .Include(bt => bt.BaiTapThucHanh)
                    .ThenInclude(th => th.TestCases)
                .Include(bt => bt.BaiHoc)
                    .ThenInclude(bh => bh.ChuongHoc)
                        .ThenInclude(ch => ch.KhoaHoc)
                .FirstOrDefaultAsync(bt => bt.MaBaiTap == maBaiTap);

            if (baiTap == null || baiTap.BaiHoc.ChuongHoc.KhoaHoc.MaGiangVien != maGiangVien)
            {
                throw new UnauthorizedAccessException("Không có quyền xóa.");
            }

            if (baiTap.BaiTapThucHanh != null)
            {
                _context.TestCaseThucHanhs.RemoveRange(baiTap.BaiTapThucHanh.TestCases);
                _context.BaiTapThucHanhs.Remove(baiTap.BaiTapThucHanh);
            }
            _context.BaiTaps.Remove(baiTap);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
