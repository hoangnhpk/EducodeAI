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

        // 1. LẤY DANH SÁCH LỘ TRÌNH AI
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
                        // Ép tên thuộc tính về chữ thường đầu để React đọc được ngay
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

        // 2. CẬP NHẬT LỘ TRÌNH AI (SỬA YÊU CẦU HOẶC NỘI DUNG)
        [HttpPut("cap-nhat/{id}")]
        public async Task<IActionResult> CapNhatLoTrinh(int id, [FromBody] JsonElement data)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr, out int maNd)) return Unauthorized();

                var loTrinh = await _context.LoTrinhAIs
                    .FirstOrDefaultAsync(x => x.MaLoTrinh == id && x.MaNguoiDung == maNd);

                if (loTrinh == null) return NotFound(new { success = false, message = "Không tìm thấy lộ trình AI." });

                // Cập nhật các trường khớp 100% với Model sếp gửi
                if (data.TryGetProperty("YeuCau", out var yeuCau)) loTrinh.YeuCau = yeuCau.GetString() ?? "";
                if (data.TryGetProperty("TrangThai", out var trangThai)) loTrinh.TrangThai = trangThai.GetString();
                // Nếu sếp muốn sửa cả JSON nội dung thì thêm dòng dưới
                if (data.TryGetProperty("NoiDungJSON", out var noiDung)) loTrinh.NoiDungJSON = noiDung.GetString() ?? "";

                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Đã cập nhật lộ trình AI thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPost("them-moi")]
        public async Task<IActionResult> ThemMoi([FromBody] JsonElement data)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr, out int maNd)) return Unauthorized();

                var newLoTrinh = new LoTrinhAIModel
                {
                    MaNguoiDung = maNd,
                    YeuCau = data.TryGetProperty("YeuCau", out var yeuCau) ? yeuCau.GetString() ?? "" : "",
                    // Nội dung JSON lúc này sẽ chứa các khóa học với trạng thái: Bắt buộc/Tự chọn
                    NoiDungJSON = data.TryGetProperty("NoiDungJSON", out var noiDung) ? noiDung.GetString() ?? "[]" : "[]",
                    TrangThai = "Hoạt động",
                    NgayTao = DateTime.Now
                };

                _context.LoTrinhAIs.Add(newLoTrinh);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Đã tạo lộ trình giảng dạy mới!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi khi thêm mới", error = ex.Message });
            }
        }
        // 3. XÓA LỘ TRÌNH AI
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