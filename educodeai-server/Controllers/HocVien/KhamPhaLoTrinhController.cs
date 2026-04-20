using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using educodeai_server.Data; // MỚI THÊM: Gọi DbContext
using Microsoft.EntityFrameworkCore; // MỚI THÊM: Dùng cho Include, ToListAsync

namespace educodeai_server.Controllers.HocVien
{
    [Authorize]
    [ApiController]
    [Route("api/hocvien/kham-pha-lo-trinh")] // Giữ nguyên Route cũ
    public class KhamPhaLoTrinhController : ControllerBase
    {
        private readonly IKhamPhaLoTrinhService _service;
        private readonly EduCodeAIDbContext _context; // MỚI THÊM: Biến chứa Database

        // Cập nhật Constructor để nhận thêm DbContext
        public KhamPhaLoTrinhController(IKhamPhaLoTrinhService service, EduCodeAIDbContext context)
        {
            _service = service;
            _context = context;
        }

        // 1. Lấy danh sách lộ trình (Phân trang + Tìm kiếm)
        [HttpGet("danh-sach")]
        public async Task<IActionResult> GetDanhSach([FromQuery] string? tuKhoa, [FromQuery] int page = 1, [FromQuery] int pageSize = 8)
        {
            try
            {
                var data = await _service.LayDanhSachAsync(tuKhoa ?? "", page, pageSize);
                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // 2. Lấy chi tiết lộ trình (Bóc tách JSON cho Modal)
        [HttpGet("chi-tiet/{id}")]
        public async Task<IActionResult> GetChiTiet(int id)
        {
            try
            {
                var data = await _service.LayChiTietLoTrinhAsync(id);
                if (data == null)
                    return NotFound(new { success = false, message = "Không tìm thấy lộ trình này sếp ơi!" });

                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // 3. Lưu lộ trình vào tài khoản học viên
        [HttpPost("luu/{id}")]
        public async Task<IActionResult> LuuLoTrinh(int id)
        {
            try
            {
                // Lấy ID người dùng từ Token đăng nhập
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int maHocVien))
                {
                    return Unauthorized(new { success = false, message = "Sếp chưa đăng nhập hoặc Token hết hạn rồi!" });
                }

                var result = await _service.LuuLoTrinhVaoTaiKhoanAsync(id, maHocVien);

                if (result)
                    return Ok(new { success = true, message = "Đã lưu lộ trình vào tài khoản của sếp thành công!" });

                return BadRequest(new { success = false, message = "Lưu thất bại, có thể lộ trình này sếp đã lưu rồi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // =========================================================
        // 4. MỚI THÊM: API LẤY DANH SÁCH LỘ TRÌNH ĐÃ LƯU
        // =========================================================
        // =========================================================
        // 4. API LẤY DANH SÁCH LỘ TRÌNH ĐÃ LƯU (KHÔNG CẦN BẢNG MỚI)
        // =========================================================
        [HttpGet("danh-sach-da-luu")]
        public async Task<IActionResult> GetDanhSachDaLuu()
        {
            try
            {
                // Bước 1: Lấy Mã người dùng từ Token (Thay vì mã học viên)
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int maNguoiDung))
                {
                    return Unauthorized(new { success = false, message = "Sếp chưa đăng nhập!" });
                }

                // Bước 2: Truy vấn thẳng vào bảng LoTrinhAIs 
                // Điều kiện: Của chính người dùng này VÀ Trạng thái là "Đã lưu"
                var danhSachDaLuu = await _context.LoTrinhAIs
                    .Where(x => x.MaNguoiDung == maNguoiDung && x.TrangThai == "Đã lưu")
                    .Select(x => new
                    {
                        maLoTrinh = x.MaLoTrinh,
                        tieuDe = x.YeuCau, // Trong ảnh Supabase sếp dùng cột YeuCau
                        ngayTao = x.NgayTao,
                        noiDungJSON = x.NoiDungJSON,
                        tenGiangVien = "Hệ thống AI" // Có thể fix cứng hoặc join để lấy tên
                    })
                    .OrderByDescending(x => x.ngayTao)
                    .ToListAsync();

                return Ok(new { success = true, data = danhSachDaLuu });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }

        }
        [HttpDelete("xoa-da-luu/{id}")]
        public async Task<IActionResult> XoaLoTrinhDaLuu(int id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int maNguoiDung)) return Unauthorized();

            // Tìm lộ trình đã lưu của người dùng này
            var loTrinh = await _context.LoTrinhAIs
                .FirstOrDefaultAsync(x => x.MaLoTrinh == id && x.MaNguoiDung == maNguoiDung && x.TrangThai == "Đã lưu");

            if (loTrinh == null) return NotFound(new { success = false, message = "Không tìm thấy lộ trình." });

            _context.LoTrinhAIs.Remove(loTrinh);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
    }
}
