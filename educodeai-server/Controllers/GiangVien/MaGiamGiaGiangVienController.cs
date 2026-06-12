using educodeai_server.DTOs.MaGiamGia;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.GiangVien
{
    [ApiController]
    [Route("api/giang-vien/ma-giam-gia")]
    [Authorize(Roles = "GiangVien,Admin")]
    public class MaGiamGiaGiangVienController : ControllerBase
    {
        private readonly IMaGiamGiaService _maGiamGiaService;

        public MaGiamGiaGiangVienController(IMaGiamGiaService maGiamGiaService)
        {
            _maGiamGiaService = maGiamGiaService;
        }

        [HttpGet("danh-sach")]
        public async Task<IActionResult> LayDanhSach()
        {
            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0) return Unauthorized(new { thongBao = "Bạn cần đăng nhập." });
            var duLieu = await _maGiamGiaService.LayDanhSachChoGiangVienAsync(maGiangVien);
            return Ok(duLieu);
        }

        [HttpGet("khoa-hoc-cua-toi")]
        public async Task<IActionResult> LayKhoaHocCuaToi()
        {
            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0) return Unauthorized(new { thongBao = "Bạn cần đăng nhập." });
            var duLieu = await _maGiamGiaService.LayKhoaHocChoGiangVienAsync(maGiangVien);
            return Ok(duLieu);
        }

        [HttpPost("tao")]
        public async Task<IActionResult> Tao([FromBody] TaoMaGiamGiaDTO yeuCau)
        {
            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0) return Unauthorized(new { thongBao = "Bạn cần đăng nhập." });
            try
            {
                var duLieu = await _maGiamGiaService.TaoMaGiamGiaChoGiangVienAsync(yeuCau, maGiangVien);
                return Ok(duLieu);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }
    }
}
