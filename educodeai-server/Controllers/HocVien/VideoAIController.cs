using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using educodeai_server.Data;
using educodeai_server.Models;
using educodeai_server.Helpers;
using educodeai_server.DTOs.VideoAI;

namespace educodeai_server.Controllers.HocVien
{
    [ApiController]
    [Route("api/HocVien/[controller]")]
    public class VideoAIController : ControllerBase
    {
        private readonly EduCodeAIDbContext _context;
        private readonly IGeminiAIService _geminiService;

        public VideoAIController(EduCodeAIDbContext context, IGeminiAIService geminiService)
        {
            _context = context;
            _geminiService = geminiService;
        }

        /// <summary>
        /// Tự động lấy phụ đề YouTube → gửi Gemini phân tích → lưu chapters + quiz vào DB.
        /// Học viên gọi endpoint này lần đầu xem video để kích hoạt nội dung tương tác.
        /// </summary>
        [HttpPost("PhanTichVideo/{maBaiHoc}")]
        public async Task<IActionResult> PhanTichVideo(int maBaiHoc)
        {
            var baiHoc = await _context.BaiHocs.FirstOrDefaultAsync(b => b.MaBaiHoc == maBaiHoc);
            if (baiHoc == null) return NotFound("Không tìm thấy bài học");
            if (string.IsNullOrEmpty(baiHoc.LinkVideo))
                return BadRequest("Bài học này chưa có link video.");

            // TODO: Bật lại sau khi chạy migration thêm column CoQuiz
            // if (!baiHoc.CoQuiz)
            //     return Ok(new { message = "Bài học này không có Quiz tương tác." });

            // Nếu đã từng phân tích rồi thì KHÔNG phân tích lại (tiết kiệm token AI)
            bool daCoChapter = await _context.VideoChapters.AnyAsync(c => c.MaBaiHoc == maBaiHoc);
            if (daCoChapter)
                return Ok(new { message = "Video đã được phân tích trước đó." });

            try
            {
                // ====================================================
                // BƯỚC 1: Lấy Video ID từ link YouTube
                // ====================================================
                string videoId = LayVideoIdTuLink(baiHoc.LinkVideo);

                // ====================================================
                // BƯỚC 2: Lấy Phụ Đề từ YouTube (tiếng Việt hoặc tiếng Anh)
                //   - Phụ đề chứa timestamp thực tế của từng đoạn → Gemini sẽ dùng để phân tích chính xác
                // ====================================================
                string phuDe = string.Empty;
                if (!string.IsNullOrEmpty(videoId))
                {
                    phuDe = await GetPhuDeVideoHelper.LayPhuDeYoutube(videoId);
                }

                // ====================================================
                // BƯỚC 3: Xây dựng Prompt gửi Gemini
                //   - Nếu có phụ đề: gửi phụ đề thật (AI biết chính xác phút nào nói gì)
                //   - Nếu không có phụ đề: dùng tiêu đề bài học làm ngữ cảnh
                // ====================================================
                string nguCanhNoiDung = string.IsNullOrEmpty(phuDe)
                    ? $"Bài học có tiêu đề: '{baiHoc.TieuDe}'. Hãy ước lượng nội dung và thời gian hợp lý."
                    : $"Phụ đề video (có thời gian thực tế):\n{phuDe}";

                string prompt = $@"Bạn là chuyên gia giáo dục phân tích video học lập trình.
                        Dựa vào thông tin sau, hãy chia video thành các phần kiến thức (chapters) và tạo câu hỏi trắc nghiệm:

                        {nguCanhNoiDung}

                        Yêu cầu JSON CHÍNH XÁC (không có markdown ```json, không có text thừa):
                        {{
                          ""Chapters"": [
                            {{
                              ""ThoiGianBatDau"": 0,
                              ""ThoiGianKetThuc"": 60,
                              ""KienThucChinh"": ""Tên kiến thức ngắn gọn"",
                              ""BatBuoc"": true,
                              ""Quizzes"": [
                                {{
                                  ""CauHoi"": ""Cau hoi trac nghiem?"",
                                  ""DapAnA"": ""Dap an A"",
                                  ""DapAnB"": ""Dap an B"",
                                  ""DapAnC"": ""Dap an C"",
                                  ""DapAnD"": ""Dap an D"",
                                  ""DapAnDung"": ""A""
                                }}
                              ]
                            }}
                          ]
                        }}

                        Luu y:
                        - ThoiGianBatDau va ThoiGianKetThuc tinh bang GIAY
                        - BatBuoc = true neu day la kien thuc cot loi, false neu bo tro
                        - Tao toi da 2 cau quiz/chapter
                        - Chi tra ve JSON, khong co text nao khac";

                string rawResponse = await _geminiService.GenerateAsync(prompt);
                // Bước 1: Lấy phần text từ cấu trúc JSON của Gemini API (candidates -> content -> parts)
                rawResponse = ChuanHoaJsonTuAIHelper.LayTextChatTuAI(rawResponse);
                // Bước 2: Strip markdown ```json ... ``` và tìm đúng chuỗi JSON { }
                rawResponse = LamSachJson(rawResponse);

                var aiResult = JsonSerializer.Deserialize<VideoAnalysisResultDTO>(rawResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                Console.OutputEncoding = System.Text.Encoding.UTF8;
                Console.WriteLine("[VideoAI] Raw response: " + rawResponse);
                Console.WriteLine("[VideoAI] So chapter parse duoc: " + (aiResult?.Chapters?.Count ?? 0));

                if (aiResult?.Chapters == null || !aiResult.Chapters.Any())
                    return BadRequest("AI không phân tích được video này.");

                // ====================================================
                // BƯỚC 4: Lưu kết quả vào Database
                // ====================================================
                foreach (var chapDto in aiResult.Chapters)
                {
                    var chapter = new VideoChapterModel
                    {
                        MaBaiHoc = maBaiHoc,
                        ThoiGianBatDau = Math.Max(0, chapDto.ThoiGianBatDau),
                        ThoiGianKetThuc = Math.Max(1, chapDto.ThoiGianKetThuc),
                        KienThucChinh = chapDto.KienThucChinh ?? "Kiến thức",
                        BatBuoc = chapDto.BatBuoc,
                        VideoQuizs = new System.Collections.Generic.List<VideoQuizModel>()
                    };

                    foreach (var q in chapDto.Quizzes ?? new System.Collections.Generic.List<VideoQuizDTO>())
                    {
                        chapter.VideoQuizs.Add(new VideoQuizModel
                        {
                            CauHoi = q.CauHoi ?? "",
                            DapAnA = q.DapAnA ?? "",
                            DapAnB = q.DapAnB ?? "",
                            DapAnC = q.DapAnC,
                            DapAnD = q.DapAnD,
                            DapAnDung = q.DapAnDung ?? "A"
                        });
                    }
                    _context.VideoChapters.Add(chapter);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Phân tích video AI thành công!", soChapter = aiResult.Chapters.Count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi phân tích video: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy danh sách chapters + quiz để hiển thị tương tác khi học viên xem video.
        /// </summary>
        [HttpGet("GetVideoInteractive/{maBaiHoc}")]
        public async Task<IActionResult> GetVideoInteractive(int maBaiHoc)
        {
            var chapters = await _context.VideoChapters
                .Include(c => c.VideoQuizs)
                .Where(c => c.MaBaiHoc == maBaiHoc)
                .OrderBy(c => c.ThoiGianBatDau)
                .ToListAsync();

            return Ok(chapters);
        }

        // ============================================================
        // HELPERS PRIVATE
        // ============================================================
        private static string LayVideoIdTuLink(string link)
        {
            try
            {
                var regExp = new System.Text.RegularExpressions.Regex(
                    @"(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)");
                var match = regExp.Match(link);
                return match.Success ? match.Groups[1].Value : string.Empty;
            }
            catch { return string.Empty; }
        }

        private static string LamSachJson(string raw)
        {
            raw = raw.Trim();
            // Xóa markdown code block nếu Gemini bọc trong ```json ... ```
            if (raw.StartsWith("```"))
            {
                int newline = raw.IndexOf('\n');
                if (newline >= 0) raw = raw.Substring(newline + 1);
                int closing = raw.LastIndexOf("```");
                if (closing >= 0) raw = raw.Substring(0, closing);
                raw = raw.Trim();
            }
            // Chỉ lấy phần từ { đến } để tránh text thừa trước/sau JSON
            int start = raw.IndexOf('{');
            int end = raw.LastIndexOf('}');
            if (start >= 0 && end > start)
                return raw.Substring(start, end - start + 1);
            return raw;
        }
    }
}
