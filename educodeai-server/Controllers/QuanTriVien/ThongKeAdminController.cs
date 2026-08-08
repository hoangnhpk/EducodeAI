using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers.QuanTriVien
{
    [Route("api/admin/thong-ke")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class ThongKeAdminController : ControllerBase
    {
        private readonly IThongKeAdminService _service;
        private readonly ILogger<ThongKeAdminController> _logger;

        public ThongKeAdminController(IThongKeAdminService service, ILogger<ThongKeAdminController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet("tong-quan")]
        public async Task<IActionResult> LayTongQuan()
        {
            try
            {
                var data = await _service.LayTongQuanAsync();
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ThongKeAdmin] LayTongQuan that bai.");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi server khi lấy thống kê tổng quan."                });
            }
        }

        [HttpGet("dang-ky-12-thang")]
        public async Task<IActionResult> LayDangKy12Thang()
        {
            try
            {
                var data = await _service.LayDangKyTheo12ThangAsync();
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ThongKeAdmin] LayDangKy12Thang that bai.");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Lỗi server khi lấy dữ liệu biểu đồ đăng ký."                });
            }
        }

        // from/to format: yyyy-MM (ví dụ: 2026-01). "to" là tháng cuối cùng được tính (inclusive).
        [HttpGet("dang-ky-theo-thang")]
        public async Task<IActionResult> LayDangKyTheoThang([FromQuery] string? from = null, [FromQuery] string? to = null)
        {
            try
            {
                DateTime ParseMonthOrDefault(string? v, DateTime fallback)
                {
                    if (string.IsNullOrWhiteSpace(v)) return fallback;
                    if (DateTime.TryParseExact(v.Trim(), "yyyy-MM", null, System.Globalization.DateTimeStyles.AssumeUniversal, out var dt))
                    {
                        return new DateTime(dt.Year, dt.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                    }
                    return fallback;
                }

                var now = DateTime.UtcNow;
                var defaultFrom = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-11);
                var defaultTo = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

                var fromMonth = ParseMonthOrDefault(from, defaultFrom);
                var toMonth = ParseMonthOrDefault(to, defaultTo);

                // endExclusive = first day of (toMonth + 1)
                var toExclusive = new DateTime(toMonth.Year, toMonth.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1);

                var data = await _service.LayDangKyTheoKhoangThangAsync(fromMonth, toExclusive);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ThongKeAdmin] LayDangKyTheoThang that bai.");
                return StatusCode(500, new { success = false, message = "Lỗi server khi lấy dữ liệu biểu đồ đăng ký." });
            }
        }

        [HttpGet("top-khoa-hoc")]
        public async Task<IActionResult> LayTopKhoaHoc([FromQuery] string? from = null, [FromQuery] string? to = null, [FromQuery] int top = 5)
        {
            try
            {
                DateTime ParseMonthOrDefault(string? v, DateTime fallback)
                {
                    if (string.IsNullOrWhiteSpace(v)) return fallback;
                    if (DateTime.TryParseExact(v.Trim(), "yyyy-MM", null, System.Globalization.DateTimeStyles.AssumeUniversal, out var dt))
                    {
                        return new DateTime(dt.Year, dt.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                    }
                    return fallback;
                }

                var now = DateTime.UtcNow;
                var defaultFrom = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-11);
                var defaultTo = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

                var fromMonth = ParseMonthOrDefault(from, defaultFrom);
                var toMonth = ParseMonthOrDefault(to, defaultTo);
                var toExclusive = new DateTime(toMonth.Year, toMonth.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1);

                var data = await _service.LayTopKhoaHocDangKyAsync(fromMonth, toExclusive, top);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ThongKeAdmin] LayTopKhoaHoc that bai.");
                return StatusCode(500, new { success = false, message = "Lỗi server khi lấy top khóa học." });
            }
        }

        [HttpGet("top-giang-vien")]
        public async Task<IActionResult> LayTopGiangVien([FromQuery] string? from = null, [FromQuery] string? to = null, [FromQuery] int top = 5)
        {
            try
            {
                DateTime ParseMonthOrDefault(string? v, DateTime fallback)
                {
                    if (string.IsNullOrWhiteSpace(v)) return fallback;
                    if (DateTime.TryParseExact(v.Trim(), "yyyy-MM", null, System.Globalization.DateTimeStyles.AssumeUniversal, out var dt))
                    {
                        return new DateTime(dt.Year, dt.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                    }
                    return fallback;
                }

                var now = DateTime.UtcNow;
                var defaultFrom = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-11);
                var defaultTo = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

                var fromMonth = ParseMonthOrDefault(from, defaultFrom);
                var toMonth = ParseMonthOrDefault(to, defaultTo);
                var toExclusive = new DateTime(toMonth.Year, toMonth.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1);

                var data = await _service.LayTopGiangVienDangKyAsync(fromMonth, toExclusive, top);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ThongKeAdmin] LayTopGiangVien that bai.");
                return StatusCode(500, new { success = false, message = "Lỗi server khi lấy top giảng viên." });
            }
        }

        [HttpGet("hoat-dong")]
        public async Task<IActionResult> LayHoatDong([FromQuery] string? from = null, [FromQuery] string? to = null)
        {
            try
            {
                DateTime ParseMonthOrDefault(string? v, DateTime fallback)
                {
                    if (string.IsNullOrWhiteSpace(v)) return fallback;
                    if (DateTime.TryParseExact(v.Trim(), "yyyy-MM", null, System.Globalization.DateTimeStyles.AssumeUniversal, out var dt))
                    {
                        return new DateTime(dt.Year, dt.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                    }
                    return fallback;
                }

                var now = DateTime.UtcNow;
                var defaultFrom = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-11);
                var defaultTo = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

                var fromMonth = ParseMonthOrDefault(from, defaultFrom);
                var toMonth = ParseMonthOrDefault(to, defaultTo);
                var toExclusive = new DateTime(toMonth.Year, toMonth.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1);

                var data = await _service.LayHoatDongHeThongAsync(fromMonth, toExclusive);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ThongKeAdmin] LayHoatDong that bai.");
                return StatusCode(500, new { success = false, message = "Lỗi server khi lấy thống kê hoạt động." });
            }
        }

        [HttpGet("chat-luong-khoa-hoc")]
        public async Task<IActionResult> LayChatLuongKhoaHoc([FromQuery] string? from = null, [FromQuery] string? to = null, [FromQuery] int top = 10)
        {
            try
            {
                DateTime ParseMonthOrDefault(string? v, DateTime fallback)
                {
                    if (string.IsNullOrWhiteSpace(v)) return fallback;
                    if (DateTime.TryParseExact(v.Trim(), "yyyy-MM", null, System.Globalization.DateTimeStyles.AssumeUniversal, out var dt))
                    {
                        return new DateTime(dt.Year, dt.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                    }
                    return fallback;
                }

                var now = DateTime.UtcNow;
                var defaultFrom = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-11);
                var defaultTo = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

                var fromMonth = ParseMonthOrDefault(from, defaultFrom);
                var toMonth = ParseMonthOrDefault(to, defaultTo);
                var toExclusive = new DateTime(toMonth.Year, toMonth.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1);

                var data = await _service.LayChatLuongKhoaHocAsync(fromMonth, toExclusive, top);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ThongKeAdmin] LayChatLuongKhoaHoc that bai.");
                return StatusCode(500, new { success = false, message = "Lỗi server khi lấy thống kê chất lượng khóa học." });
            }
        }

        [HttpGet("chi-tiet/hoc-vien")]
        public async Task<IActionResult> LayChiTietHocVien([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
        {
            try
            {
                var data = await _service.LayDanhSachHocVienAsync(page, pageSize, search);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ThongKeAdmin] LayChiTietHocVien that bai.");
                return StatusCode(500, new { success = false, message = "Lỗi server khi lấy chi tiết học viên." });
            }
        }

        [HttpGet("chi-tiet/giang-vien")]
        public async Task<IActionResult> LayChiTietGiangVien([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
        {
            try
            {
                var data = await _service.LayDanhSachGiangVienAsync(page, pageSize, search);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ThongKeAdmin] LayChiTietGiangVien that bai.");
                return StatusCode(500, new { success = false, message = "Lỗi server khi lấy chi tiết giảng viên." });
            }
        }

        [HttpGet("chi-tiet/khoa-hoc")]
        public async Task<IActionResult> LayChiTietKhoaHoc([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
        {
            try
            {
                var data = await _service.LayDanhSachKhoaHocAsync(page, pageSize, search);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ThongKeAdmin] LayChiTietKhoaHoc that bai.");
                return StatusCode(500, new { success = false, message = "Lỗi server khi lấy chi tiết khóa học." });
            }
        }

        [HttpGet("chi-tiet/dang-ky")]
        public async Task<IActionResult> LayChiTietDangKy([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
        {
            try
            {
                var data = await _service.LayDanhSachDangKyAsync(page, pageSize, search);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ThongKeAdmin] LayChiTietDangKy that bai.");
                return StatusCode(500, new { success = false, message = "Lỗi server khi lấy chi tiết lượt đăng ký." });
            }
        }

        [HttpGet("doanh-thu/tong-quan")]
        public async Task<IActionResult> LayDoanhThuTongQuan()
        {
            try
            {
                var data = await _service.LayDoanhThuTongQuanAsync();
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ThongKeAdmin] LayDoanhThuTongQuan that bai.");
                return StatusCode(500, new { success = false, message = "Lỗi server khi lấy thống kê doanh thu." });
            }
        }

        [HttpGet("doanh-thu/theo-thoi-gian")]
        public async Task<IActionResult> LayDoanhThuTheoThoiGian(
            [FromQuery] string? nhomTheo = "month",
            [FromQuery] string? from = null,
            [FromQuery] string? to = null)
        {
            try
            {
                DateTime? ParseDateOrNull(string? v)
                {
                    if (string.IsNullOrWhiteSpace(v)) return null;
                    if (DateTime.TryParseExact(v.Trim(), "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.AssumeUniversal, out var dt))
                    {
                        return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
                    }
                    return null;
                }

                var fromUtc = ParseDateOrNull(from);
                var toUtc = ParseDateOrNull(to);

                var data = await _service.LayDoanhThuTheoThoiGianAsync(nhomTheo, fromUtc, toUtc);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[ThongKeAdmin] LayDoanhThuTheoThoiGian that bai.");
                return StatusCode(500, new { success = false, message = "Lỗi server khi lấy biểu đồ doanh thu." });
            }
        }
    }
}
