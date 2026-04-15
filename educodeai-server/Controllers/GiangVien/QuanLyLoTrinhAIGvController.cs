using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using educodeai_server.Data;
using educodeai_server.Models;
using System.Text.Json;

namespace educodeai_server.Controllers.GiangVien
{
    [ApiController]
    [Route("api/giangvien/quan-ly-lo-trinh")]
    [Authorize]
    public class QuanLyLoTrinhController : ControllerBase
    {
        private readonly EduCodeAIDbContext _context;

        public QuanLyLoTrinhController(EduCodeAIDbContext context)
        {
            _context = context;
        }

        // --- MỚI: LẤY DANH SÁCH KHÓA HỌC CÓ SẴN ĐỂ CHỌN ---
        [HttpGet("danh-sach-khoa-hoc-co-san")]
        public async Task<IActionResult> GetKhoaHocCoSan()
        {
            try
            {
                // Chỉ lấy các trường cần thiết để FE hiển thị và chọn
                var danhSach = await _context.KhoaHocs
                    .Select(x => new {
                        maKhoaHoc = x.MaKhoaHoc,
                        tenKhoaHoc = x.TenKhoaHoc,
                        hinhAnh = x.HinhAnh,
                        linhVuc = x.LinhVuc
                    })
                    .ToListAsync();
                return Ok(new { success = true, data = danhSach });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // 1. LẤY DANH SÁCH LỘ TRÌNH CỦA GIẢNG VIÊN
        [HttpGet("danh-sach")]
        public async Task<IActionResult> GetDanhSach()
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr, out int maNd)) return Unauthorized();

                var danhSach = await _context.LoTrinhAIs
                    .Where(x => x.MaNguoiDung == maNd)
                    .OrderByDescending(x => x.NgayTao)
                    .Select(x => new {
                        maLoTrinh = x.MaLoTrinh,
                        yeuCau = x.YeuCau,
                        trangThai = x.TrangThai,
                        ngayTao = x.NgayTao,
                        noiDungJSON = x.NoiDungJSON
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = danhSach });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // 2. THÊM MỚI LỘ TRÌNH (Lưu dạng Bắt buộc / Nâng cao)
        [HttpPost("them-moi")]
        public async Task<IActionResult> ThemMoi([FromBody] JsonElement data)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr, out int maNd)) return Unauthorized();

                // Logic: FE sẽ gửi một chuỗi JSON đã được stringify từ mảng các khóa học đã chọn
                // Cấu trúc mong muốn: [{"maKhoaHoc": 1, "loai": "Bắt buộc"}, {"maKhoaHoc": 2, "loai": "Nâng cao"}]

                var newLoTrinh = new LoTrinhAIModel
                {
                    MaNguoiDung = maNd,
                    YeuCau = data.TryGetProperty("YeuCau", out var yeuCau) ? yeuCau.GetString() ?? "" : "Lộ trình mới",
                    NoiDungJSON = data.TryGetProperty("NoiDungJSON", out var noiDung) ? noiDung.GetString() ?? "[]" : "[]",
                    TrangThai = "Hoạt động",
                    NgayTao = DateTime.Now
                };

                _context.LoTrinhAIs.Add(newLoTrinh);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Đã tạo lộ trình giảng dạy với các khóa học tùy chỉnh!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi khi thêm mới", error = ex.Message });
            }
        }

        // 3. CẬP NHẬT LỘ TRÌNH
        [HttpPut("cap-nhat/{id}")]
        public async Task<IActionResult> CapNhatLoTrinh(int id, [FromBody] JsonElement data)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr, out int maNd)) return Unauthorized();

                var loTrinh = await _context.LoTrinhAIs
                    .FirstOrDefaultAsync(x => x.MaLoTrinh == id && x.MaNguoiDung == maNd);

                if (loTrinh == null) return NotFound(new { success = false, message = "Không tìm thấy lộ trình." });

                if (data.TryGetProperty("YeuCau", out var yeuCau)) loTrinh.YeuCau = yeuCau.GetString() ?? "";
                if (data.TryGetProperty("TrangThai", out var trangThai)) loTrinh.TrangThai = trangThai.GetString();
                if (data.TryGetProperty("NoiDungJSON", out var noiDung)) loTrinh.NoiDungJSON = noiDung.GetString() ?? "[]";

                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Cập nhật thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        // 4. XÓA LỘ TRÌNH
        [HttpDelete("xoa/{id}")]
        public async Task<IActionResult> XoaLoTrinh(int id)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr, out int maNd)) return Unauthorized();

                var loTrinh = await _context.LoTrinhAIs
                    .FirstOrDefaultAsync(x => x.MaLoTrinh == id && x.MaNguoiDung == maNd);

                if (loTrinh == null) return NotFound(new { success = false });

                _context.LoTrinhAIs.Remove(loTrinh);
                await _context.SaveChangesAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi hệ thống khi xóa", error = ex.Message });
            }
        }
    }
}