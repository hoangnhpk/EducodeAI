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
            try
            {
                var result = await _service.LayDanhSachHoSoAsync(trangThai);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>Lấy chi tiết một hồ sơ theo mã.</summary>
        [HttpGet("chi-tiet/{maHoSo}")]
        public async Task<IActionResult> LayChiTietHoSo(long maHoSo)
        {
            try
            {
                var result = await _service.LayChiTietHoSoAsync(maHoSo);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>Đếm số hồ sơ đang chờ duyệt (cho badge thông báo trên menu admin).</summary>
        [HttpGet("dem-cho-duyet")]
        public async Task<IActionResult> DemChoDuyet()
        {
            try
            {
                int count = await _service.DemHoSoChoDuyetAsync();
                return Ok(new { soLuong = count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>Duyệt hồ sơ: tạo tài khoản giảng viên + gửi email.</summary>
        [HttpPut("duyet/{maHoSo}")]
        public async Task<IActionResult> DuyetHoSo(long maHoSo)
        {
            try
            {
                int maQuanTriVien = int.Parse(User.FindFirst("id")?.Value ?? "0");
                if (maQuanTriVien <= 0) return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });
                var result = await _service.DuyetHoSoAsync(maHoSo, maQuanTriVien);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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

            try
            {
                int maQuanTriVien = int.Parse(User.FindFirst("id")?.Value ?? "0");
                if (maQuanTriVien <= 0) return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });
                var result = await _service.TuChoiHoSoAsync(maHoSo, maQuanTriVien, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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

            try
            {
                int maQuanTriVien = int.Parse(User.FindFirst("id")?.Value ?? "0");
                if (maQuanTriVien <= 0) return Unauthorized(new { message = "Phiên đăng nhập không hợp lệ." });
                var result = await _service.YeuCauBoSungHoSoAsync(maHoSo, maQuanTriVien, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy ảnh CCCD private (mat=truoc|sau). Chỉ Admin.
        /// Không public static file.
        /// </summary>
        [HttpGet("anh-giay-to/{maHoSo}")]
        public async Task<IActionResult> LayAnhGiayTo(long maHoSo, [FromQuery] string mat = "truoc")
        {
            try
            {
                var file = await _service.LayAnhGiayToAsync(maHoSo, mat);
                if (file == null) return NotFound(new { message = "Không tìm thấy ảnh giấy tờ." });
                return File(file.Value.Stream, file.Value.ContentType, file.Value.FileName);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}