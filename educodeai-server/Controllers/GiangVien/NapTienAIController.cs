using educodeai_server.DTOs.NapTienAI;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.GiangVien
{
    [ApiController]
    [Route("api/giang-vien/nap-tien-ai")]
    [Authorize(Roles = "GiangVien,Admin")]
    public class NapTienAIController : ControllerBase
    {
        private readonly INapTienAIService _napTienAIService;

        public NapTienAIController(INapTienAIService napTienAIService)
        {
            _napTienAIService = napTienAIService;
        }

        [HttpGet("vi")]
        public async Task<IActionResult> LayThongTinVi()
        {
            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để dùng chức năng này." });
            }

            try
            {
                var duLieu = await _napTienAIService.LayThongTinViAIAsync(maGiangVien);
                return Ok(duLieu);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { thongBao = "Lỗi khi lấy thông tin ví AI.", chiTiet = ex.Message });
            }
        }

        [HttpPost("nap-tien")]
        public async Task<IActionResult> NapTien([FromBody] YeuCauNapTienAIDTO yeuCau)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { thongBao = "Dữ liệu không hợp lệ." });
            }

            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để dùng chức năng này." });
            }

            try
            {
                var ketQua = await _napTienAIService.NapTienVaoViAIAsync(maGiangVien, yeuCau);
                return Ok(ketQua);
            }
            catch (ApplicationException ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { thongBao = "Lỗi khi nạp tiền vào ví AI.", chiTiet = ex.Message });
            }
        }

        [HttpGet("lich-su")]
        public async Task<IActionResult> LayLichSu()
        {
            int maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để dùng chức năng này." });
            }

            try
            {
                var lichSu = await _napTienAIService.LayLichSuNapTienAIAsync(maGiangVien);
                return Ok(lichSu);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { thongBao = "Lỗi khi lấy lịch sử nạp tiền.", chiTiet = ex.Message });
            }
        }
    }
}
