using Microsoft.AspNetCore.Mvc;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using educodeai_server.Helpers;

namespace educodeai_server.Controllers.HocVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhoaHocController : ControllerBase
    {
        private readonly IKhoaHocService _service;

        public KhoaHocController(IKhoaHocService service)
        {
            _service = service;
        }

        /// <summary>
        /// Lấy danh sách tất cả khóa học, có hỗ trợ tìm kiếm theo tên hoặc lĩnh vực
        /// </summary>
        [HttpGet("all")]
        public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int? maGiangVien)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            try
            {
                // Lấy dữ liệu gốc từ Service
                var allCourses = await _service.GetAllKhoaHocsAsync(maNguoiDung);

                // Nếu có filter theo giảng viên
                if (maGiangVien.HasValue && maGiangVien.Value > 0)
                {
                    allCourses = allCourses.Where(x => x.MaGiangVien == maGiangVien.Value).ToList();
                }

                // Nếu người dùng có nhập từ khóa (search không trống)
                if (!string.IsNullOrWhiteSpace(search))
                {
                    var searchLower = search.ToLower().Trim();

                    // Thực hiện lọc dữ liệu dựa trên TenKhoaHoc hoặc LinhVuc
                    allCourses = allCourses.Where(x =>
                        (x.TenKhoaHoc != null && x.TenKhoaHoc.ToLower().Contains(searchLower)) ||
                        (x.LinhVuc != null && x.LinhVuc.ToLower().Contains(searchLower))
                    ).ToList();
                }

                // Trả về danh sách (nếu search trống thì trả về toàn bộ)
                return Ok(allCourses);
            }
            catch (Exception ex)
            {
                // Ghi log ra console để debug khi cần
                Console.WriteLine($"Lỗi tại KhoaHocController - GetAll: {ex.Message}");

                return StatusCode(500, new
                {
                    message = "Lỗi server nội bộ",
                    details = ex.Message
                });
            }
        }
    }
}