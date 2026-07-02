using educodeai_server.DTOs.MaGiamGia;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.QuanTriVien
{
    [ApiController]
    [Route("api/quan-tri-vien/ma-giam-gia")]
    [Authorize(Roles = "Admin")]
    public class MaGiamGiaAdminController : ControllerBase
    {
        private readonly IMaGiamGiaService _maGiamGiaService;

        public MaGiamGiaAdminController(IMaGiamGiaService maGiamGiaService)
        {
            _maGiamGiaService = maGiamGiaService;
        }

        [HttpGet("danh-sach")]
        public async Task<IActionResult> LayDanhSach()
        {
            var duLieu = await _maGiamGiaService.LayDanhSachChoAdminAsync();
            return Ok(duLieu);
        }

        [HttpGet("khoa-hoc")]
        public async Task<IActionResult> LayKhoaHocApDung()
        {
            var duLieu = await _maGiamGiaService.LayKhoaHocChoAdminAsync();
            return Ok(duLieu);
        }

        [HttpPost("tao")]
        public async Task<IActionResult> Tao([FromBody] TaoMaGiamGiaDTO yeuCau)
        {
            int maAdmin = LayNguoiDungID.LayID(User);
            if (maAdmin == 0) return Unauthorized(new { thongBao = "Bạn cần đăng nhập admin." });
            try
            {
                var duLieu = await _maGiamGiaService.TaoMaGiamGiaChoAdminAsync(yeuCau, maAdmin);
                return Ok(duLieu);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }
    }
}
