using Microsoft.AspNetCore.Mvc;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using educodeai_server.Helpers;

using Microsoft.EntityFrameworkCore;
using educodeai_server.Data;

namespace educodeai_server.Controllers.HocVien
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhoaHocController : ControllerBase
    {
        private readonly IKhoaHocService _service;
        private readonly EduCodeAIDbContext _context;

        public KhoaHocController(IKhoaHocService service, EduCodeAIDbContext context)
        {
            _service = service;
            _context = context;
        }

        /// <summary>
        /// Lấy danh sách tất cả khóa học, có hỗ trợ tìm kiếm theo tên hoặc lĩnh vực
        /// </summary>
        [HttpGet("all")]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            try
            {
                // Lấy dữ liệu gốc từ Service
                var allCourses = await _service.GetAllKhoaHocsAsync(maNguoiDung);

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

        [HttpGet("top-reviews")]
        public async Task<IActionResult> GetTopReviews()
        {
            try
            {
                var reviews = await _context.DanhGias
                    .Include(d => d.NguoiDung)
                    .Include(d => d.KhoaHoc)
                    .ThenInclude(k => k.GiangVien)
                    .OrderByDescending(d => d.NgayDanhGia)
                    .Take(6)
                    .Select(d => new
                    {
                        id = d.MaDanhGia,
                        name = d.NguoiDung.HoTen,
                        courseName = d.KhoaHoc.TenKhoaHoc,
                        instructorName = d.KhoaHoc.GiangVien.HoTen,
                        quote = d.NhanXet,
                        soSao = d.SoSao
                    })
                    .ToListAsync();

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy đánh giá", details = ex.Message });
            }
        }

        [HttpGet("top-instructors")]
        public async Task<IActionResult> GetTopInstructors()
        {
            try
            {
                var instructors = await _context.NguoiDungs
                    .Where(u => u.VaiTro == 1 && u.TrangThai == "Hoạt động")
                    .Select(u => new
                    {
                        id = u.MaNguoiDung,
                        name = u.HoTen,
                        avgRating = _context.DanhGias
                            .Where(d => d.KhoaHoc.MaGiangVien == u.MaNguoiDung)
                            .Average(d => (double?)d.SoSao) ?? 0,
                        totalReviews = _context.DanhGias
                            .Count(d => d.KhoaHoc.MaGiangVien == u.MaNguoiDung),
                        avatar = u.AnhDaiDien,
                        role = _context.HoSoDangKyGiangViens
                            .Where(hs => hs.MaNguoiDung == u.MaNguoiDung && hs.TrangThaiHoSo == "DaDuyet")
                            .Select(hs => hs.LinhVucGiangDay)
                            .FirstOrDefault() ?? "Giảng viên"
                    })
                    .Where(x => x.totalReviews > 0)
                    .OrderByDescending(x => x.avgRating)
                    .ThenByDescending(x => x.totalReviews)
                    .Take(4)
                    .ToListAsync();

                return Ok(instructors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách giảng viên", details = ex.Message });
            }
        }
    }
}