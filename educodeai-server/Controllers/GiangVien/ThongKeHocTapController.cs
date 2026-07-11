using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using educodeai_server.Services.Interface;

namespace educodeai_server.Controllers.GiangVien
{
    [ApiController]
    [Route("api/giang-vien/thong-ke")]
    [Authorize(Roles = "GiangVien,Admin")]
    public class ThongKeHocTapController : ControllerBase
    {
        private readonly IThongKeHocTapService _service;

        public ThongKeHocTapController(IThongKeHocTapService service)
        {
            _service = service;
        }

        // ================== OVERVIEW ==================
        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            var maGiangVienClaim = User.FindFirst("MaNguoiDung");

            if (maGiangVienClaim == null)
                return Unauthorized("Không tìm thấy MaNguoiDung trong token");

            int maGiangVien = int.Parse(maGiangVienClaim.Value);

            var result = await _service.GetOverviewAsync(maGiangVien);
            return Ok(result);
        }

        // ================== TRẠNG THÁI HỌC VIÊN ==================
        [HttpGet("trang-thai-hoc-vien")]
        public async Task<IActionResult> GetTrangThaiHocVien()
        {
            int maGiangVien = int.Parse(User.FindFirst("MaNguoiDung")!.Value);
            return Ok(await _service.GetTrangThaiHocVienAsync(maGiangVien));
        }

        // ================== HỌC VIÊN ==================
        [HttpGet("hoc-vien")]
        public async Task<IActionResult> GetHocVien(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null
        )
        {
            int maGiangVien = int.Parse(User.FindFirst("MaNguoiDung")!.Value);

            var result = await _service.GetHocVienAsync(
                maGiangVien,
                page,
                pageSize,
                search
            );

            return Ok(result);
        }

        [HttpGet("thu-nhap/tong-quan")]
        public async Task<IActionResult> GetThuNhapTongQuan()
        {
            int maGiangVien = int.Parse(User.FindFirst("MaNguoiDung")!.Value);
            return Ok(await _service.GetThuNhapTongQuanAsync(maGiangVien));
        }

        [HttpGet("thu-nhap/theo-thoi-gian")]
        public async Task<IActionResult> GetThuNhapTheoThoiGian([FromQuery] string? nhomTheo = "month")
        {
            int maGiangVien = int.Parse(User.FindFirst("MaNguoiDung")!.Value);
            return Ok(await _service.GetThuNhapTheoThoiGianAsync(maGiangVien, nhomTheo));
        }

        [HttpGet("thu-nhap/theo-khoa-hoc")]
        public async Task<IActionResult> GetThuNhapTheoKhoaHoc([FromQuery] int top = 8)
        {
            int maGiangVien = int.Parse(User.FindFirst("MaNguoiDung")!.Value);
            return Ok(await _service.GetThuNhapTheoKhoaHocAsync(maGiangVien, top));
        }

        [HttpPost("hoc-vien/{maHocVien:int}/gui-canh-bao")]
        public async Task<IActionResult> GuiCanhBaoHocVienNguyCoBoHoc(int maHocVien)
        {
            try
            {
                int maGiangVien = int.Parse(User.FindFirst("MaNguoiDung")!.Value);
                await _service.GuiCanhBaoHocVienNguyCoBoHocAsync(maGiangVien, maHocVien);
                return Ok(new { message = "Đã gửi email cảnh báo cho học viên." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
