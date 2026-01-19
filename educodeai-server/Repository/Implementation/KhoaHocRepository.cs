using Microsoft.EntityFrameworkCore;
using educodeai_server.Repository.Interface;
using educodeai_server.Data;
using educodeai_server.Models;
using educodeai_server.DTOs.AI;

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
    }
}
