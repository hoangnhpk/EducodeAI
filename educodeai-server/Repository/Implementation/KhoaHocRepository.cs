using Microsoft.EntityFrameworkCore;
using educodeai_server.Repository.Interface;
using educodeai_server.Data;
using educodeai_server.Models;
using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.KhoaHoc;

namespace educodeai_server.Repository.Implementation
{
    public class KhoaHocRepository : IKhoaHocRepository
    {
        private readonly EduCodeAIDbContext _context;

        public KhoaHocRepository(EduCodeAIDbContext context)
        {
            _context = context;
        }

        public async Task<List<KhoaHocAISnapshotDto>> GetKhoaHocPhuHopAsync(CreateLoTrinhAIDto dto)
        {
            var query = _context.KhoaHocs
                .Where(x => x.TrangThai == "Hoạt động");

            //if (!string.IsNullOrEmpty(dto.TrinhDoHienTai))
            //{
            //    query = query.Where(x =>
            //        x.TrinhDo!.Contains(dto.TrinhDoHienTai) ||
            //        dto.TrinhDoHienTai.Contains(x.TrinhDo));
            //}

            //if (dto.LinhVucTapTrung?.Any() == true)
            //{
            //    query = query.Where(x =>
            //        dto.LinhVucTapTrung.Any(f =>
            //            x.LinhVuc!.Contains(f) ||
            //            x.KyNangChinh!.Contains(f)
            //        ));
            //}

            return await query
                .OrderByDescending(x => x.DiemDanhGiaTB)
                .ThenByDescending(x => x.NgayTao)
                .Select(x => new KhoaHocAISnapshotDto
                {
                    MaKhoaHoc = x.MaKhoaHoc,
                    TenKhoaHoc = x.TenKhoaHoc,
                    TrinhDo = x.TrinhDo!,
                    LinhVuc = x.LinhVuc!,
                    KyNangChinh = x.KyNangChinh!,
                    ThoiLuongGio = x.ThoiLuongGio
                })
                .ToListAsync();
        }

        public async Task<List<ChuongHocDTO>> GetKhoaHocByIdAsync(int maKhoaHoc)
        {
            return await _context.ChuongHocs
                .Include(c => c.BaiHocs)
                .Where(c => c.MaKhoaHoc == maKhoaHoc)
                .OrderBy(c => c.ThuTu)
                .Select(c => new ChuongHocDTO
                {
                    Id = c.MaChuong,
                    TieuDe = c.TenChuong,
                    ThuTu = c.ThuTu,
                    DanhSachBaiHoc = c.BaiHocs
                        .OrderBy(b => b.ThuTu)
                        .Select(b => new BaiHocDTO
                        {
                            Id = b.MaBaiHoc,
                            TieuDe = b.TieuDe,
                            LoaiBaiHoc = b.LoaiBaiHoc,
                            NoiDung = b.NoiDung ?? "",
                            ThoiLuong = b.ThoiLuong,
                            ThuTu = b.ThuTu,
                            LinkVideo = b.LinkVideo
                        }).ToList()
                })
                .ToListAsync();
        }
        public async Task<List<KhoaHocModel>> GetKhoaHocsByGiangVienAsync(int maGiangVien)
        {
            return await _context.KhoaHocs
                .Include(k => k.DangKyKhoaHocs)
                .Where(k => k.MaGiangVien == maGiangVien)
                .OrderByDescending(k => k.NgayTao)
                .ToListAsync();
        }
        public async Task<KhoaHocModel?> GetKhoaHocWithDetailsAsync(int maKhoaHoc)
        {
            return await _context.KhoaHocs
                .Include(k => k.DangKyKhoaHocs)
                    .ThenInclude(d => d.NguoiDung)
                .FirstOrDefaultAsync(k => k.MaKhoaHoc == maKhoaHoc);
        }
    }
}

