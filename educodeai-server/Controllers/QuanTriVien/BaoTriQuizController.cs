using educodeai_server.Data;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Controllers.QuanTriVien
{
    /// <summary>
    /// Tác vụ bảo trì chạy một lần: quy đổi dữ liệu quiz cũ (schema AI) về schema chuẩn.
    /// Chạy xong và xác nhận dữ liệu ổn thì có thể xoá controller này.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class BaoTriQuizController : ControllerBase
    {
        private readonly EduCodeAIDbContext _context;
        private readonly IRedisService _redisService;
        private readonly ILogger<BaoTriQuizController> _logger;

        public BaoTriQuizController(
            EduCodeAIDbContext context,
            IRedisService redisService,
            ILogger<BaoTriQuizController> logger)
        {
            _context = context;
            _redisService = redisService;
            _logger = logger;
        }

        /// <summary>
        /// POST /api/BaoTriQuiz/chuan-hoa-cau-hoi?dryRun=true
        /// Mặc định dryRun = true: chỉ liệt kê những quiz sẽ bị sửa, KHÔNG ghi DB.
        /// Truyền dryRun=false mới thực sự ghi.
        /// </summary>
        [HttpPost("chuan-hoa-cau-hoi")]
        public async Task<IActionResult> ChuanHoaCauHoi([FromQuery] bool dryRun = true)
        {
            var danhSachQuiz = await _context.BaiTap_Quizs
                .Include(q => q.BaiTap)
                    .ThenInclude(bt => bt.BaiHoc)
                        .ThenInclude(bh => bh.ChuongHoc)
                .ToListAsync();

            var chiTiet = new List<object>();
            var khoaHocCanTangVersion = new HashSet<int>();
            int soQuizLoiDinhDang = 0;

            foreach (var quiz in danhSachQuiz)
            {
                if (!ChuanHoaCauHoiQuizHelper.CanChuanHoa(quiz.DuLieuCauHoi)) continue;

                var duLieuMoi = ChuanHoaCauHoiQuizHelper.ChuanHoa(quiz.DuLieuCauHoi);
                if (duLieuMoi == null)
                {
                    soQuizLoiDinhDang++;
                    _logger.LogWarning(
                        "[BaoTriQuiz] Quiz {MaBaiTapQuiz} có dữ liệu không đọc được, giữ nguyên.",
                        quiz.MaBaiTapQuiz);
                    continue;
                }

                var maKhoaHoc = quiz.BaiTap?.BaiHoc?.ChuongHoc?.MaKhoaHoc;

                chiTiet.Add(new
                {
                    quiz.MaBaiTapQuiz,
                    quiz.MaBaiTap,
                    maKhoaHoc,
                    duLieuCu = quiz.DuLieuCauHoi,
                    duLieuMoi
                });

                if (!dryRun)
                {
                    quiz.DuLieuCauHoi = duLieuMoi;
                    if (maKhoaHoc.HasValue) khoaHocCanTangVersion.Add(maKhoaHoc.Value);
                }
            }

            if (!dryRun && chiTiet.Count > 0)
            {
                await _context.SaveChangesAsync();

                // Bắt buộc: không tăng version thì học viên vẫn nhận nội dung khóa học từ cache cũ.
                foreach (var maKhoaHoc in khoaHocCanTangVersion)
                {
                    await _redisService.TangVersionKhoaHocAsync(maKhoaHoc);
                }

                _logger.LogInformation(
                    "[BaoTriQuiz] Đã chuẩn hoá {SoQuiz} quiz, làm mới cache {SoKhoaHoc} khóa học.",
                    chiTiet.Count, khoaHocCanTangVersion.Count);
            }

            return Ok(new
            {
                dryRun,
                tongSoQuiz = danhSachQuiz.Count,
                soQuizCanChuanHoa = chiTiet.Count,
                soQuizLoiDinhDang,
                soKhoaHocLamMoiCache = dryRun ? 0 : khoaHocCanTangVersion.Count,
                ghiChu = dryRun
                    ? "Đây là chạy khô, chưa ghi gì vào DB. Gọi lại với dryRun=false để thực sự sửa."
                    : "Đã ghi vào DB.",
                chiTiet
            });
        }
    }
}
