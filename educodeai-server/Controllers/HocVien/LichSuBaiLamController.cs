using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using educodeai_server.Data;
using educodeai_server.DTOs.KhoaHoc;

namespace educodeai_server.Controllers.HocVien
{
    [ApiController]
    [Route("api/hoc-vien/lich-su-bai-lam")]
    public class LichSuBaiLamController : ControllerBase
    {
        private readonly EduCodeAIDbContext _context;

        public LichSuBaiLamController(EduCodeAIDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy lịch sử bài làm theo học viên
        /// </summary>
        [HttpGet("{maNguoiDung}")]
        public async Task<IActionResult> GetLichSuBaiLam(int maNguoiDung)
        {
            var data = await _context.BaiNops
                .Where(bn => bn.MaNguoiDung == maNguoiDung)

                .Include(bn => bn.NgonNgu)
                .Include(bn => bn.BaiTap)
                    .ThenInclude(bt => bt.BaiHoc)
                        .ThenInclude(bh => bh.ChuongHoc)
                            .ThenInclude(ch => ch.KhoaHoc)

                .OrderByDescending(bn => bn.NgayNop)
                .Select(bn => new LichSuBaiLamDTO
                {
                    MaBaiNop = bn.MaBaiNop,
                    TenKhoaHoc = bn.BaiTap.BaiHoc.ChuongHoc.KhoaHoc.TenKhoaHoc,
                    TenBaiHoc = bn.BaiTap.BaiHoc.TieuDe,
                    TenNgonNgu = bn.NgonNgu.TenNgonNgu,
                    LanNop = bn.LanNop,
                    TrangThai = bn.TrangThai,
                    ThoiGianChay = bn.ThoiGianChay,
                    BoNhoSuDung = bn.BoNhoSuDung,
                    NgayNop = bn.NgayNop
                })
                .ToListAsync();

            return Ok(data);
        }


    }
}
