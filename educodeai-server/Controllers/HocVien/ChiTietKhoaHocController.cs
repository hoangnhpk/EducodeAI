using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using educodeai_server.Data;
using educodeai_server.DTOs.KhoaHoc;
using System.Threading.Tasks;
using educodeai_server.Models;
using System.Linq;

namespace EduCodeAI.Controllers.HocVien
{
    [ApiController]
    [Route("api/hocvien/chitietkhoahoc")]
    public class ChiTietKhoaHocController : ControllerBase
    {
        private readonly EduCodeAIDbContext _context;

        public ChiTietKhoaHocController(EduCodeAIDbContext context)
        {
            _context = context;
        }

     
        [HttpPost]
        public async Task<IActionResult> ThemKhoaHoc([FromBody] KhoaHocDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var khoaHoc = new KhoaHocModel
            {
                TenKhoaHoc = model.TenKhoaHoc ?? "",
                HinhAnh = model.HinhAnh ?? "",
                LinhVuc = model.LinhVuc ?? "",
                DiemDanhGiaTB = model.DiemDanhGiaTB,
                ThoiLuongGio = model.ThoiLuongGio,
                TrinhDo = model.TrinhDo ?? "",
                KyNangChinh = model.KyNangChinh ?? ""
            };

            _context.KhoaHocs.Add(khoaHoc);
            await _context.SaveChangesAsync();

            return Ok("Thêm khóa học thành công");
        }

        [HttpGet]
        public async Task<IActionResult> GetAllKhoaHoc()
        {
            var dsKhoaHoc = await _context.KhoaHocs
                .Select(k => new
                {
                    k.MaKhoaHoc,
                    k.TenKhoaHoc,
                    k.HinhAnh,
                    k.LinhVuc,
                    k.DiemDanhGiaTB,
                    k.ThoiLuongGio,
                    k.TrinhDo,
                    k.KyNangChinh
                })
                .ToListAsync();

            return Ok(dsKhoaHoc);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetKhoaHocById(int id)
        {
            var khoaHoc = await _context.KhoaHocs
                .Include(k => k.ChuongHocs)
                    .ThenInclude(c => c.BaiHocs)
                .FirstOrDefaultAsync(k => k.MaKhoaHoc == id);

            if (khoaHoc == null)
            {
                return NotFound("Không tìm thấy khóa học");
            }

            return Ok(new
            {
                maKhoaHoc = khoaHoc.MaKhoaHoc,
                tenKhoaHoc = khoaHoc.TenKhoaHoc,
                moTa = khoaHoc.KyNangChinh, 

                chuongs = khoaHoc.ChuongHocs.Select(chuong => new
                {
                    maChuong = chuong.MaChuong,
                    tenChuong = chuong.TenChuong,

                    baiHocs = chuong.BaiHocs.Select(bai => new
                    {
                        maBaiHoc = bai.MaBaiHoc,
                        tenBaiHoc = bai.TieuDe,   
                        videoUrl = bai.LinkVideo,
                        thoiLuong = bai.ThoiLuong
                    }).ToList()
                }).ToList()
            });
        }
    }
}