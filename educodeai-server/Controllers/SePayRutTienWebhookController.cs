using educodeai_server.DTOs.ThanhToan;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers
{
    /// <summary>
    /// Webhook SePay riêng cho <b>tiền ra</b> (chuyển khoản từ TK merchant MB → giảng viên).
    /// Tách biệt URL với webhook <b>tiền vào</b> (thanh toán khóa học).
    /// </summary>
    [ApiController]
    [Route("api/sepay/webhook")]
    public class SePayRutTienWebhookController : ControllerBase
    {
        private readonly IRutTienGiangVienService _rutTienGiangVienService;

        public SePayRutTienWebhookController(IRutTienGiangVienService rutTienGiangVienService)
        {
            _rutTienGiangVienService = rutTienGiangVienService;
        }

        /// <summary>
        /// SePay gọi khi có giao dịch chiều <c>out</c> khớp TK đã liên kết; nội dung khớp mã CK đã gán cho yêu cầu (hoặc định dạng cũ <c>RUT{ma}</c>).
        /// </summary>
        [AllowAnonymous]
        [XacThucWebhookSePay]
        [HttpPost("rut-tien-giang-vien")]
        public async Task<IActionResult> NhanWebhookTienRa([FromBody] ThongBaoWebhookSePayDTO duLieuWebhook)
        {
            try
            {
                bool thanhCong = await _rutTienGiangVienService.XuLyWebhookRutTienAsync(duLieuWebhook);
                return Ok(new { thanhCong });
            }
            catch (Exception ex)
            {
                return BadRequest(new { thongBao = ex.Message });
            }
        }
    }
}
