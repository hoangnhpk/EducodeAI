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

        public KhongGianHocTapController(IKhongGianHocTapService service)
        {
            _service = service;
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
    }
}
