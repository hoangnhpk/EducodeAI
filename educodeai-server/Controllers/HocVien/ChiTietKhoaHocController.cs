using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using educodeai_server.Data;
using educodeai_server.DTOs.KhoaHoc;
using System.Linq;
using System.Threading.Tasks;

namespace EduCodeAI.Controllers.HocVien
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChiTietKhoaHocController : ControllerBase
    {
        private readonly EduCodeAIDbContext _context;

        public ChiTietKhoaHocController(EduCodeAIDbContext context)
        {
            _context = context;
        }

        [HttpGet("{maKhoaHoc}")]
        public async Task<IActionResult> GetChiTietKhoaHoc(int maKhoaHoc)
        {
            var khoaHoc = await _context.KhoaHocs
    .Include(k => k.GiangVien)
    .Include(k => k.ChuongHocs)
        .ThenInclude(c => c.BaiHocs)
    .Where(k => k.MaKhoaHoc == maKhoaHoc)
    .Select(k => new ChiTietKhoaHocDTO
    {
        MaKhoaHoc = k.MaKhoaHoc,
        TenKhoaHoc = k.TenKhoaHoc,
        MoTa = k.MoTa,
        DiemDanhGiaTB = k.DiemDanhGiaTB,

        TenGiangVien = k.GiangVien.HoTen,
        AnhGiangVien = k.GiangVien.AnhDaiDien,

        ChuongHocs = k.ChuongHocs
            .OrderBy(c => c.ThuTu)
            .Select(c => new ChuongHoc_NoiDungKhoaHocDTO
            {
                Id = c.MaChuong,
                TieuDe = c.TenChuong,
                ThuTu = c.ThuTu,

                DanhSachBaiHoc = c.BaiHocs
                    .OrderBy(b => b.ThuTu)
                    .Select(b => new BaiHoc_NoiDungKhoaHocDTO
                    {
                        Id = b.MaBaiHoc,
                        TieuDe = b.TieuDe,
                        LoaiBaiHoc = b.LoaiBaiHoc,
                        ThuTu = b.ThuTu,
                        ThoiLuong = b.ThoiLuong
                    })
                    .ToList()
            })
            .ToList()
    })
    .FirstOrDefaultAsync();


            if (khoaHoc == null)
                return NotFound("Không tìm thấy khóa học");

            return Ok(khoaHoc);
        }
    }
}
