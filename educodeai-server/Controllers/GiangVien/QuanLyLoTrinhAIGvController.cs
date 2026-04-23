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
                    .Select(x => new
                    {
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
        // 1. LẤY TẤT CẢ DANH SÁCH LỘ TRÌNH (GIẢNG VIÊN ĐƯỢC XEM HẾT)
        [HttpGet("danh-sach")]
        public async Task<IActionResult> GetDanhSach()
        {
            try
            {
                // Vẫn check login nhưng không lọc theo UserID nữa để hiện tất cả
                var danhSach = await _context.LoTrinhAIs
                    .OrderByDescending(x => x.NgayTao)
                    .Select(x => new
                    {
                        maLoTrinh = x.MaLoTrinh,
                        yeuCau = x.YeuCau,
                        trangThai = x.TrangThai,
                        ngayTao = x.NgayTao,
                        noiDungJSON = x.NoiDungJSON,
                        // Thêm thông tin người tạo để Gv biết lộ trình này của ai
                        tenNguoiTao = _context.NguoiDungs
                                        .Where(n => n.MaNguoiDung == x.MaNguoiDung)
                                        .Select(n => n.HoTen)
                                        .FirstOrDefault() ?? "Hệ thống AI"
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
        // 2. THÊM MỚI LỘ TRÌNH (Đóng gói chuẩn cấu trúc AI)
        [HttpPost("them-moi")]
        public async Task<IActionResult> ThemMoi([FromBody] JsonElement data)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr, out int maNd)) return Unauthorized();

                string yeuCauStr = data.TryGetProperty("YeuCau", out var yeuCau) ? yeuCau.GetString() ?? "" : "Lộ trình mới";
                string noiDungRaw = data.TryGetProperty("NoiDungJSON", out var noiDung) ? noiDung.GetString() ?? "[]" : "[]";

                // 👉 ĐÓNG GÓI CHUẨN AI: Biến mảng FE gửi lên thành Object { tenLoTrinh, loTrinh }
                var rawCourses = JsonSerializer.Deserialize<JsonElement>(noiDungRaw);
                var aiFormat = new
                {
                    tenLoTrinh = yeuCauStr,
                    loTrinh = rawCourses // Đây là mảng các chặng học
                };

                var newLoTrinh = new LoTrinhAIModel
                {
                    MaNguoiDung = maNd,
                    YeuCau = yeuCauStr,
                    NoiDungJSON = JsonSerializer.Serialize(aiFormat), // Lưu chuỗi JSON đã đóng gói
                    TrangThai = "Hoạt động",
                    NgayTao = DateTime.Now
                };

                _context.LoTrinhAIs.Add(newLoTrinh);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Đã tạo lộ trình chuẩn cấu trúc AI!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi khi thêm mới", error = ex.Message });
            }
        }

        // 3. CẬP NHẬT LỘ TRÌNH (Đóng gói chuẩn cấu trúc AI)
        [HttpPut("cap-nhat/{id}")]
        public async Task<IActionResult> CapNhatLoTrinh(int id, [FromBody] JsonElement data)
        {
            try
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr, out int maNd)) return Unauthorized();

                var loTrinh = await _context.LoTrinhAIs.FirstOrDefaultAsync(x => x.MaLoTrinh == id);
                if (loTrinh == null) return NotFound(new { success = false, message = "Không tìm thấy lộ trình." });

                string yeuCauStr = data.TryGetProperty("YeuCau", out var yeuCau) ? yeuCau.GetString() ?? loTrinh.YeuCau : loTrinh.YeuCau;
                string noiDungRaw = data.TryGetProperty("NoiDungJSON", out var noiDung) ? noiDung.GetString() ?? "[]" : "[]";

                // 👉 ĐÓNG GÓI CHUẨN AI: Tương tự như thêm mới
                var rawCourses = JsonSerializer.Deserialize<JsonElement>(noiDungRaw);
                var aiFormat = new
                {
                    tenLoTrinh = yeuCauStr,
                    loTrinh = rawCourses
                };

                loTrinh.YeuCau = yeuCauStr;
                loTrinh.TrangThai = data.TryGetProperty("TrangThai", out var trangThai) ? trangThai.GetString() : loTrinh.TrangThai;
                loTrinh.NoiDungJSON = JsonSerializer.Serialize(aiFormat);

                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Cập nhật lộ trình chuẩn AI thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi Server", error = ex.Message });
            }
        }

        // 4. XÓA LỘ TRÌNH
        // 4. XÓA LỘ TRÌNH (Cho phép Giảng viên xóa bất kỳ lộ trình nào)
        [HttpDelete("xoa/{id}")]
        public async Task<IActionResult> XoaLoTrinh(int id)
        {
            try
            {
                // Vẫn giữ check login để bảo mật
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdStr, out int maNd)) return Unauthorized();

                // TÌM LỘ TRÌNH: Bỏ điều kiện x.MaNguoiDung == maNd để có thể xóa toàn quyền
                var loTrinh = await _context.LoTrinhAIs
                    .FirstOrDefaultAsync(x => x.MaLoTrinh == id);

                if (loTrinh == null) return NotFound(new { success = false, message = "Không tìm thấy lộ trình." });

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
