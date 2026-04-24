using educodeai_server.Data;
using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Controllers.HocVien
{
    [ApiController]
    [Route("api/hocvien/khoa-hoc-da-mua")]
    [Authorize]
    public class KhoaHocDaMuaHocVienController : ControllerBase
    {
        private readonly EduCodeAIDbContext _context;

        public KhoaHocDaMuaHocVienController(EduCodeAIDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Danh sách khóa học học viên đã mua / đăng ký, kèm tiến độ học.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<KhoaHocDaMuaHocVienDTO>>> LayDanhSach()
        {
            int maNguoiDung = LayNguoiDungID.LayID(User);
            if (maNguoiDung == 0)
            {
                return Unauthorized(new { thongBao = "Bạn cần đăng nhập để xem khóa học của mình." });
            }

            var bangGhi = await _context.DangKyKhoaHocs
                .AsNoTracking()
                .Include(dk => dk.KhoaHoc)
                .Where(dk => dk.MaNguoiDung == maNguoiDung)
                .OrderByDescending(dk => dk.NgayDangKy)
                .ToListAsync();

            var ds = bangGhi.Select(dk => new KhoaHocDaMuaHocVienDTO
            {
                MaDangKy = dk.MaDangKy,
                MaKhoaHoc = dk.MaKhoaHoc,
                TenKhoaHoc = dk.KhoaHoc.TenKhoaHoc,
                HinhAnh = dk.KhoaHoc.HinhAnh,
                LinhVuc = dk.KhoaHoc.LinhVuc,
                ThoiLuongGio = dk.KhoaHoc.ThoiLuongGio,
                TienDo = dk.TienDo,
                TrangThai = dk.TrangThai,
                NgayDangKy = dk.NgayDangKy,
                Slug = SlugHelper.Generate(dk.KhoaHoc.TenKhoaHoc)
            }).ToList();

            return Ok(ds);
        }
    }
}
