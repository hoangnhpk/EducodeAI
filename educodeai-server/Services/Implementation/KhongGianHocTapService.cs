using educodeai_server.Data;
using educodeai_server.DTOs;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class KhongGianHocTapService : IKhongGianHocTapService
    {
        private readonly EduCodeAIDbContext _context;

        public KhongGianHocTapService(EduCodeAIDbContext context)
        {
            _context = context;
        }

        public async Task<List<KhongGianHocTapItemDTO>> LayDanhSachTheoNguoiDungAsync(int maNguoiDung)
        {
            var dangKyList = await _context.DangKyKhoaHocs
                .AsNoTracking()
                .Include(dk => dk.KhoaHoc)
                .Where(dk => dk.MaNguoiDung == maNguoiDung)
                .OrderByDescending(dk => dk.NgayDangKy)
                .ToListAsync();

            var result = new List<KhongGianHocTapItemDTO>();

            foreach (var dk in dangKyList)
            {
                var kh = dk.KhoaHoc;
                if (kh == null) continue;

                int maKhoa = dk.MaKhoaHoc;

                int tongSoBai = await _context.BaiHocs
                    .AsNoTracking()
                    .Where(b => b.ChuongHoc.MaKhoaHoc == maKhoa)
                    .CountAsync();

                int soBaiDaHoc = await _context.TienDoBaiHocs
                    .AsNoTracking()
                    .Where(t => t.MaNguoiDung == maNguoiDung
                             && t.DaXem
                             && t.BaiHoc.ChuongHoc.MaKhoaHoc == maKhoa)
                    .CountAsync();

                int phanTram = tongSoBai > 0
                    ? (int)Math.Round((double)soBaiDaHoc / tongSoBai * 100)
                    : 0;

                result.Add(new KhongGianHocTapItemDTO
                {
                    MaKhoaHoc = maKhoa,
                    TenKhoaHoc = kh.TenKhoaHoc,
                    HinhAnh = kh.HinhAnh,
                    TongSoBaiHoc = tongSoBai,
                    SoBaiDaHoc = soBaiDaHoc,
                    PhanTramTienDo = phanTram,
                    Slug = SlugHelper.Generate(kh.TenKhoaHoc),
                    NgayDangKy = dk.NgayDangKy,
                    TrangThaiDangKy = dk.TrangThai
                });
            }

            return result;
        }
    }
}
