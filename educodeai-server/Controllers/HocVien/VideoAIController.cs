using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using educodeai_server.Data;
using educodeai_server.Models;
using educodeai_server.Helpers;
using educodeai_server.Helpers;
using educodeai_server.DTOs.VideoAI;
using educodeai_server.Services.Interface;
using Microsoft.Extensions.Configuration;

namespace educodeai_server.Controllers.HocVien
{
    [ApiController]
    [Route("api/HocVien/[controller]")]
    public class VideoAIController : ControllerBase
    {
        private readonly EduCodeAIDbContext _context;
        private readonly IChatBotAIService _chatBotAIService;
        private readonly IConfiguration _cauHinh;

        public VideoAIController(EduCodeAIDbContext context, IChatBotAIService chatBotAIService, IConfiguration cauHinh)
        {
            _context = context;
            _chatBotAIService = chatBotAIService;
            _cauHinh = cauHinh;
        }

        /// <summary>
        /// Tự động lấy phụ đề YouTube → gửi Gemini phân tích → lưu chapters + quiz vào DB.
        /// Học viên gọi endpoint này lần đầu xem video để kích hoạt nội dung tương tác.
        /// </summary>
        [HttpPost("PhanTichVideo/{maBaiHoc}")]
        public async Task<IActionResult> PhanTichVideo(int maBaiHoc)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            int soVideoHocThu = _cauHinh.GetValue("HocThu:SoVideoMacDinh", 2);
            bool coQuyen = await HocThuHelper.CoQuyenTruyCapBaiHocAsync(_context, maBaiHoc, maNguoiDung, soVideoHocThu);
            if (!coQuyen)
            {
                return StatusCode(403, new { thongBao = "Bạn chưa có quyền truy cập bài học này." });
            }

            var baiHoc = await _context.BaiHocs.FirstOrDefaultAsync(b => b.MaBaiHoc == maBaiHoc);
            if (baiHoc == null) return NotFound("Không tìm thấy bài học");
            if (string.IsNullOrEmpty(baiHoc.LinkVideo))
                return BadRequest("Bài học này chưa có link video.");

            // Nếu đã từng phân tích rồi thì KHÔNG phân tích lại (tiết kiệm token AI)
            bool daCoChapter = await _context.VideoChapters.AnyAsync(c => c.MaBaiHoc == maBaiHoc);
            if (daCoChapter)
                return Ok(new { message = "Video đã được phân tích trước đó." });

            try
            {
                var aiResult = await _chatBotAIService.PhanTichVideoAsync(baiHoc.LinkVideo, baiHoc.TieuDe, baiHoc.SubtitleUrl);
                if (aiResult?.Chapters == null) return BadRequest("AI không trả về kết quả.");

                // Xóa dữ liệu cũ của bài học này trước khi lưu mới để tránh trùng lặp
                var chaptersCu = await _context.VideoChapters.Where(c => c.MaBaiHoc == maBaiHoc).ToListAsync();
                if (chaptersCu.Any())
                {
                    _context.VideoChapters.RemoveRange(chaptersCu);
                }

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
    }
}
