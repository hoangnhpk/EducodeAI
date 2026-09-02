using educodeai_server.DTOs.GiangVienChungChi;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.GiangVien
{
    [ApiController]
    [Route("api/giang-vien/chung-chi")]
    [Authorize(Roles = "GiangVien")]
    public sealed class GiangVienChungChiController : ControllerBase
    {
        private readonly IGiangVienChungChiService _service;

        public GiangVienChungChiController(IGiangVienChungChiService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> LayDanhSach()
        {
            var maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien <= 0) return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });
            return Ok(await _service.LayDanhSachAsync(maGiangVien));
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestFormLimits(MultipartBodyLengthLimit = 60 * 1024 * 1024)]
        public async Task<IActionResult> GuiYeuCau([FromForm] GuiYeuCauChungChiRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join("; ", ModelState.Values
                    .SelectMany(value => value.Errors)
                    .Select(error => error.ErrorMessage));
                return BadRequest(new { message = "Dữ liệu chứng chỉ không hợp lệ.", errors });
            }

            var maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien <= 0) return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });
            return Ok(await _service.GuiYeuCauAsync(maGiangVien, request));
        }

        [HttpPut("dot-gui/{maDotGui:guid}/bo-sung")]
        [Consumes("multipart/form-data")]
        [RequestFormLimits(MultipartBodyLengthLimit = 60 * 1024 * 1024)]
        public async Task<IActionResult> BoSung(
            Guid maDotGui,
            [FromForm] BoSungDotChungChiRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join("; ", ModelState.Values
                    .SelectMany(value => value.Errors)
                    .Select(error => error.ErrorMessage));
                return BadRequest(new { message = "Dữ liệu bổ sung chứng chỉ không hợp lệ.", errors });
            }

            var maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien <= 0) return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });
            return Ok(await _service.BoSungAsync(maGiangVien, maDotGui, request));
        }

        [HttpPut("{maTaiLieu:long}/hien-thi")]
        public async Task<IActionResult> CapNhatHienThi(
            long maTaiLieu,
            [FromBody] CapNhatHienThiChungChiRequest request)
        {
            var maGiangVien = LayNguoiDungID.LayID(User);
            if (maGiangVien <= 0) return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });
            return Ok(await _service.CapNhatHienThiAsync(
                maGiangVien,
                maTaiLieu,
                request.HienThiCongKhai));
        }
    }
}
