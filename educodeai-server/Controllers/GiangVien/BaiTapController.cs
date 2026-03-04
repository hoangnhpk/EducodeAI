using System.Security.Claims;
using System.Text.Json;
using educodeai_server.DTOs.BaiTap;
using educodeai_server.Helpers;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.GiangVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaiTapController : ControllerBase
    {
        private readonly IBaiTapRepository _baiTapRepository;
        private readonly IQuizService _quizService;

        public BaiTapController(IQuizService quizService, IBaiTapRepository baiTapRepository)
        {
            _quizService = quizService;
            _baiTapRepository = baiTapRepository;
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
                int newQuizId = await _quizService.CreateQuizAsync(dto);

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
                var danhSachCauHoiJson = await _quizService.GenerateQuizByAIAsync(dto);
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

        [HttpDelete("xoa/{maBaiTap}")]
        public async Task<IActionResult> XoaBaiTap(int maBaiTap)
        {
            try
            {
                 await _baiTapRepository.XoaBaiTapAsync(maBaiTap);
                return Ok(new
                {
                    success = true,
                    message = "Bài tập đã được xóa thành công! 🗑️"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ôi không, có lỗi xảy ra khi xóa bài tập: " + ex.Message
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
                var chiTiet = await _baiTapRepository.LayChiTietBaiTapAsync(id);

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
