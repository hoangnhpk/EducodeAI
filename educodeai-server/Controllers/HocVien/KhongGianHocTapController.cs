using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.HocVien
{
    [Route("api/hoc-vien/khong-gian-hoc-tap")]
    [ApiController]
    [Authorize]
    public class KhongGianHocTapController : ControllerBase
    {
        private readonly IKhongGianHocTapService _service;
        private readonly ILogger<KhongGianHocTapController> _logger;

        public KhongGianHocTapController(
            IKhongGianHocTapService service,
            ILogger<KhongGianHocTapController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> LayDanhSach()
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung <= 0)
                return Unauthorized(new { success = false, message = "Chưa đăng nhập hoặc token không hợp lệ." });

            var data = await _service.LayDanhSachTheoNguoiDungAsync(maNguoiDung);
            return Ok(new { success = true, data });
        }

        [HttpGet("skill-tree")]
        public async Task<IActionResult> LaySkillTree([FromQuery] int? maLoTrinh)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung <= 0)
                return Unauthorized(new { success = false, message = "Chưa đăng nhập hoặc token không hợp lệ." });

            try
            {
                var data = await _service.LaySkillTreeAsync(maNguoiDung, maLoTrinh);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                // Không trả ex.Message ra client: client hiển thị thẳng message này lên UI,
                // làm lộ chi tiết nội bộ (tên bảng, câu SQL, chuỗi kết nối...) cho học viên.
                _logger.LogError(ex, "Lỗi lấy skill-tree cho người dùng {MaNguoiDung}", maNguoiDung);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Không tải được bản đồ lộ trình. Vui lòng thử lại sau."
                });
            }
        }
    }
}
