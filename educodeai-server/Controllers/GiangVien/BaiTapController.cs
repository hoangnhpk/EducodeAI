using System.Security.Claims;
using System.Text.Json;
using educodeai_server.DTOs.BaiTap;
using educodeai_server.Data;
using educodeai_server.Helpers;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Controllers.GiangVien
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BaiTapController : ControllerBase
    {
        private readonly IBaiTapRepository _baiTapRepository;
        private readonly IQuizService _quizService;
        private readonly EduCodeAIDbContext _context;
        private readonly IRedisService _redisService;
        private readonly ILogger<BaiTapController> _logger;

        public BaiTapController(IQuizService quizService, IBaiTapRepository baiTapRepository, EduCodeAIDbContext context, IRedisService redisService, ILogger<BaiTapController> logger)
        {
            _quizService = quizService;
            _baiTapRepository = baiTapRepository;
            _context = context;
            _redisService = redisService;
            _logger = logger;
        }

        [HttpGet("ds-bai-tap")]
        public async Task<IActionResult> GetDanhSachBaiTap()
        {
            try
            {
                int userId = LayNguoiDungID.LayID(User);
                var danhSachBaiTap = await _baiTapRepository.LayDanhSachBaiTapCuaGiangVienAsync(userId);
                return Ok(danhSachBaiTap);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ôi không, có lỗi xảy ra: " + ex.Message
                });
            }
        }

        [HttpPost("xuat-ban")]
        public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizDTO dto)
        {
            try
            {
                int maGiangVien = LayNguoiDungID.LayID(User);
                if (maGiangVien <= 0) return Unauthorized(new { success = false, message = "Vui l?ng ??ng nh?p." });

                int newQuizId = await _quizService.CreateQuizAsync(dto, maGiangVien);

                return Ok(new
                {
                    success = true,
                    message = "Trộm vía! Lên sóng quiz thành công rực rỡ luôn nha! 🎉",
                    maBaiTapQuiz = newQuizId
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Khoan dừng khoảng chừng là 2 giây! " + ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Toang rồi bu em ạ, server đang khóc thét: " + ex.Message
                });
            }
        }

        [HttpPost("tao-bang-ai")]
        public async Task<IActionResult> TaoQuizBangAI([FromBody] GenerateQuizAIDTO dto)
        {
            try
            {
                int maGiangVien = LayNguoiDungID.LayID(User);
                if (maGiangVien <= 0) return Unauthorized(new { success = false, message = "Vui l?ng ??ng nh?p." });

                var danhSachCauHoiJson = await _quizService.GenerateQuizByAIAsync(dto, maGiangVien);
                var danhSachCauHoi = JsonSerializer.Deserialize<object>(danhSachCauHoiJson);

                return Ok(new
                {
                    success = true,
                    message = "AI đã nặn xong câu hỏi rồi nè! Mlem mlem! ✨",
                    data = danhSachCauHoi
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "AI đang hờn dỗi: " + ex.Message });
            }
        }


        [HttpPut("quiz/{maBaiTap}")]
        public async Task<IActionResult> CapNhatQuiz(int maBaiTap, [FromBody] CreateQuizDTO dto)
        {
            try
            {
                int maGiangVien = LayNguoiDungID.LayID(User);
                if (maGiangVien <= 0) return Unauthorized(new { success = false, message = "Vui l?ng ??ng nh?p." });

                var daCapNhat = await _quizService.CapNhatQuizAsync(maBaiTap, dto, maGiangVien);
                if (!daCapNhat)
                {
                    return NotFound(new { success = false, message = "Kh?ng t?m th?y quiz ho?c b?n kh?ng c? quy?n c?p nh?t." });
                }

                return Ok(new { success = true, message = "C?p nh?t quiz th?nh c?ng." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "L?i h? th?ng: " + ex.Message });
            }
        }

        [HttpDelete("xoa/{maBaiTap}")]
        public async Task<IActionResult> XoaBaiTap(int maBaiTap)
        {
            try
            {
                 int maGiangVien = LayNguoiDungID.LayID(User);
                 if (maGiangVien <= 0) return Unauthorized(new { success = false, message = "Vui l?ng ??ng nh?p." });
                 var maKhoaHoc = await _context.BaiTaps
                    .Where(bt => bt.MaBaiTap == maBaiTap)
                    .Select(bt => (int?)bt.BaiHoc.ChuongHoc.MaKhoaHoc)
                    .FirstOrDefaultAsync();
                 var daXoa = await _baiTapRepository.XoaBaiTapAsync(maBaiTap, maGiangVien);
                 if (!daXoa) return NotFound(new { success = false, message = "Kh?ng t?m th?y b?i t?p ho?c b?n kh?ng c? quy?n x?a." });
                if (maKhoaHoc.HasValue)
                {
                    await _redisService.TangVersionKhoaHocAsync(maKhoaHoc.Value);
                }
                return Ok(new
                {
                    success = true,
                    message = "Bài tập đã được xóa thành công! 🗑️"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Không thể xóa bài tập {MaBaiTap}", maBaiTap);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Không thể xóa bài tập lúc này. Vui lòng thử lại sau."
                });
            }
        }

        [HttpGet("khoa-hoc")]
        public async Task<IActionResult> GetDanhSachKhoaHocTheoGiangVien()
        {
            try
            {
                int userId = LayNguoiDungID.LayID(User);
                var danhSachBaiTap = await _baiTapRepository.GetKhoaHocModelsByGiangVienAsync(userId);
                return Ok(danhSachBaiTap);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ôi không, có lỗi xảy ra: " + ex.Message
                });
            }
        }

        [HttpGet("chuong-hoc/{maKhoaHoc}")]
        public async Task<IActionResult> GetBaiTapTheoChuongHoc(int maKhoaHoc)
        {
            try
            {
                var danhSachBaiTap = await _baiTapRepository.GetChuongHocModelsByKhoaHocAsync(maKhoaHoc);
                return Ok(danhSachBaiTap);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ôi không, có lỗi xảy ra: " + ex.Message
                });
            }

        }

        [HttpGet("bai-hoc/{maChuong}")]
        public async Task<IActionResult> GetBaiTapTheoBaiHoc(int maChuong)
        {
            try
            {
                var danhSachBaiTap = await _baiTapRepository.GetBaiHocModelsByChuongHocAsync(maChuong);
                return Ok(danhSachBaiTap);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ôi không, có lỗi xảy ra: " + ex.Message
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetChiTietBaiTap(int id)
        {
            try
            {
                // Gọi xuống tầng Repository để moi móc dữ liệu
                int maGiangVien = LayNguoiDungID.LayID(User);
                if (maGiangVien <= 0) return Unauthorized(new { success = false, message = "Vui l?ng ??ng nh?p." });

                var chiTiet = await _baiTapRepository.LayChiTietBaiTapAsync(id, maGiangVien);

                if (chiTiet == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Ối dồi ôi, không tìm thấy bài tập này sếp ơi! 🥺"
                    });
                }

                // Trả data về cho FE lụm
                return Ok(new
                {
                    success = true,
                    message = "Lấy chi tiết thành công rực rỡ! ✨",
                    data = chiTiet
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Server đang hờn dỗi: " + ex.Message
                });
            }
        }
    }
}
