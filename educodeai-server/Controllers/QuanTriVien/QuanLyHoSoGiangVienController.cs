using educodeai_server.DTOs.QuanLyHoSoGiangVien;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace educodeai_server.Controllers.QuanTriVien
{
    [Route("api/QuanTriVien/quan-ly-ho-so-giang-vien")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class QuanLyHoSoGiangVienController : ControllerBase
    {
        private readonly IQuanLyHoSoGiangVienService _service;

        public QuanLyHoSoGiangVienController(IQuanLyHoSoGiangVienService service)
        {
            _service = service;
        }

        /// <summary>Lấy danh sách hồ sơ, lọc theo trạng thái (ChoDuyet, CanBoSung, DaDuyet, TuChoi).</summary>
        [HttpGet("ds-ho-so")]
        public async Task<IActionResult> LayDanhSachHoSo([FromQuery] string? trangThai)
        {
            var result = await _service.LayDanhSachHoSoAsync(trangThai);
            return Ok(result);
        }

        /// <summary>Lấy chi tiết một hồ sơ theo mã.</summary>
        [HttpGet("chi-tiet/{maHoSo}")]
        public async Task<IActionResult> LayChiTietHoSo(long maHoSo)
        {
            var result = await _service.LayChiTietHoSoAsync(maHoSo);
            return Ok(result);
        }

        /// <summary>Đếm số hồ sơ đang chờ duyệt (cho badge thông báo trên menu admin).</summary>
        [HttpGet("dem-cho-duyet")]
        public async Task<IActionResult> DemChoDuyet()
        {
            int count = await _service.DemHoSoChoDuyetAsync();
            return Ok(new { soLuong = count });
        }

        /// <summary>Duyệt hồ sơ: tạo tài khoản giảng viên + gửi email.</summary>
        [HttpPut("duyet/{maHoSo}")]
        public async Task<IActionResult> DuyetHoSo(long maHoSo)
        {
            int maQuanTriVien = int.Parse(User.FindFirst("id")?.Value ?? "0");
            if (maQuanTriVien <= 0) return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });
            var result = await _service.DuyetHoSoAsync(maHoSo, maQuanTriVien);
            return Ok(result);
        }

        /// <summary>Từ chối hồ sơ kèm lý do.</summary>
        [HttpPut("tu-choi/{maHoSo}")]
        public async Task<IActionResult> TuChoiHoSo(long maHoSo, [FromBody] TuChoiHoSoRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)));
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors });
            }

            int maQuanTriVien = int.Parse(User.FindFirst("id")?.Value ?? "0");
            if (maQuanTriVien <= 0) return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });
            var result = await _service.TuChoiHoSoAsync(maHoSo, maQuanTriVien, request);
            return Ok(result);
        }

        /// <summary>Yêu cầu giảng viên bổ sung hồ sơ.</summary>
        [HttpPut("yeu-cau-bo-sung/{maHoSo}")]
        public async Task<IActionResult> YeuCauBoSungHoSo(long maHoSo, [FromBody] YeuCauBoSungHoSoRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = string.Join("; ", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)));
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors });
            }

            int maQuanTriVien = int.Parse(User.FindFirst("id")?.Value ?? "0");
            if (maQuanTriVien <= 0) return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });
            var result = await _service.YeuCauBoSungHoSoAsync(maHoSo, maQuanTriVien, request);
            return Ok(result);
        }

    }
}
