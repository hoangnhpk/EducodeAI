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

            if (!string.IsNullOrEmpty(dto.TrinhDoHienTai))
            {
                query = query.Where(x =>
                    x.TrinhDo.Contains(dto.TrinhDoHienTai) ||
                    dto.TrinhDoHienTai.Contains(x.TrinhDo));
            }

            //if (dto.LinhVucTapTrung?.Any() == true)
            //{
            //    query = query.Where(x =>
            //        dto.LinhVucTapTrung.Any(f =>
            //            x.LinhVuc.Contains(f) ||
            //            x.KyNangChinh.Contains(f)
            //        ));
            //}

            return await query
                .OrderByDescending(x => x.DiemDanhGiaTB)
                .ThenByDescending(x => x.NgayTao)
                .Select(x => new KhoaHocAISnapshotDto
                {
                    MaKhoaHoc = x.MaKhoaHoc,
                    TenKhoaHoc = x.TenKhoaHoc,
                    TrinhDo = x.TrinhDo,
                    LinhVuc = x.LinhVuc,
                    KyNangChinh = x.KyNangChinh,
                    ThoiLuongGio = x.ThoiLuongGio
                })
                .ToListAsync();
        }



        public async Task<List<KhoaHocAISnapshotDto>> GetKhoaHocTheoKeywordAsync(List<string> keywords)
        {
            var query = _context.KhoaHocs
                .Where(x => x.TrangThai == "Hoạt động");

            if (keywords.Any())
            {
                query = query.Where(kh =>
                    keywords.Any(k =>
                        kh.TenKhoaHoc.ToLower().Contains(k) ||
                        kh.LinhVuc.ToLower().Contains(k) ||
                        kh.KyNangChinh.ToLower().Contains(k)
                    ));
            }

            return await query
                .OrderByDescending(x => x.DiemDanhGiaTB)
                .ThenByDescending(x => x.NgayTao)
                .Select(x => new KhoaHocAISnapshotDto
                {
                    MaKhoaHoc = x.MaKhoaHoc,
                    TenKhoaHoc = x.TenKhoaHoc,
                    TrinhDo = x.TrinhDo,
                    LinhVuc = x.LinhVuc,
                    KyNangChinh = x.KyNangChinh,
                    ThoiLuongGio = x.ThoiLuongGio
                })
                .ToListAsync();
        }


        public async Task<KhoaHoc_NoiDungKhoaHocDTO?> GetNoiDungKhoaHocAsync(int maKhoaHoc)
        {
            return await _context.KhoaHocs
                .Where(kh => kh.MaKhoaHoc == maKhoaHoc)
                .Select(kh => new KhoaHoc_NoiDungKhoaHocDTO
                {
                    MaKhoaHoc = kh.MaKhoaHoc,
                    TenKhoaHoc = kh.TenKhoaHoc,
                    Slug = SlugHelper.Generate(kh.TenKhoaHoc),

                    DanhSachChuongHoc = kh.ChuongHocs
                        .OrderBy(ch => ch.ThuTu)
                        .Select(ch => new ChuongHoc_NoiDungKhoaHocDTO
                        {
                            Id = ch.MaChuong,
                            TieuDe = ch.TenChuong,
                            ThuTu = ch.ThuTu,

                            DanhSachBaiHoc = ch.BaiHocs
                                .OrderBy(bh => bh.ThuTu)
                                .Select(bh => new BaiHoc_NoiDungKhoaHocDTO
                                {
                                    Id = bh.MaBaiHoc,
                                    TieuDe = bh.TieuDe,
                                    LoaiBaiHoc = bh.LoaiBaiHoc,
                                    NoiDung = bh.NoiDung,
                                    ThoiLuong = bh.ThoiLuong,
                                    ThuTu = bh.ThuTu,
                                    LinkVideo = bh.LinkVideo
                                })
                                .ToList()
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();
        }

    }
}
