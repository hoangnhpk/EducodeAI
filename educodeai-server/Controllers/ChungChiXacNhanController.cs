using educodeai_server.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduCodeAI.Controllers
{
    [ApiController]
    [Route("api/chung-chi")]
    public class ChungChiXacNhanController : ControllerBase
    {
        private readonly EduCodeAIDbContext _context;

        public ChungChiXacNhanController(EduCodeAIDbContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet("xac-nhan")]
        public async Task<IActionResult> XacNhan([FromQuery] string? ma)
        {
            if (string.IsNullOrWhiteSpace(ma))
                return BadRequest(new { thongBao = "Thiếu mã chứng chỉ." });

            var chungChi = await _context.ChungChiKhoaHocs
                .AsNoTracking()
                .Include(x => x.KhoaHoc)
                .Where(x => x.MaChungChi == ma.Trim())
                .Select(x => new
                {
                    hopLe = true,
                    maChungChi = x.MaChungChi,
                    hoTen = x.HoTenHienThi ?? x.NguoiDung.HoTen,
                    tenKhoaHoc = x.KhoaHoc.TenKhoaHoc,
                    tenChungChi = x.KhoaHoc.TenChungChi,
                    ngayCap = x.NgayCap,
                    daCap = true
                })
                .FirstOrDefaultAsync();

            if (chungChi == null)
            {
                return NotFound(new
                {
                    hopLe = false,
                    thongBao = "Không tìm thấy chứng chỉ hoặc mã chứng chỉ không hợp lệ."
                });
            }

            return Ok(chungChi);
        }
    }
}
