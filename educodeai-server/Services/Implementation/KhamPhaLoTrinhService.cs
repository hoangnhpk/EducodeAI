using educodeai_server.Data;
using educodeai_server.DTOs.HocVien;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace educodeai_server.Services.Implementation
{
    public class KhamPhaLoTrinhService : IKhamPhaLoTrinhService
    {
        private readonly EduCodeAIDbContext _context;

        public KhamPhaLoTrinhService(EduCodeAIDbContext context)
        {
            _context = context;
        }

        // 1. Hàm lấy danh sách + Tìm kiếm (Tên phải là LayDanhSachAsync mới khớp Interface)
        public async Task<PagedResultDto<LoTrinhKhamPhaDto>> LayDanhSachAsync(string tuKhoa, int pageIndex, int pageSize)
        {
            var query = _context.LoTrinhAIs.Where(x => x.TrangThai == "Hoạt động");

            if (!string.IsNullOrWhiteSpace(tuKhoa))
            {
                query = query.Where(x => x.YeuCau != null && x.YeuCau.Contains(tuKhoa));
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(x => x.NgayTao)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new LoTrinhKhamPhaDto
                {
                    MaLoTrinh = x.MaLoTrinh,
                    TieuDe = x.YeuCau,
                    NgayTao = x.NgayTao,
                    MaGiangVien = x.MaNguoiDung,
                    NoiDungJSON = x.NoiDungJSON ?? "[]"
                }).ToListAsync();

            return new PagedResultDto<LoTrinhKhamPhaDto>
            {
                Items = items,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        // 2. Hàm lấy chi tiết để hiện Modal
        public async Task<LoTrinhChiTietDto?> LayChiTietLoTrinhAsync(int maLoTrinh)
        {
            var item = await _context.LoTrinhAIs
                .Include(x => x.NguoiDung)
                .FirstOrDefaultAsync(x => x.MaLoTrinh == maLoTrinh && x.TrangThai == "Hoạt động");

            if (item == null) return null;

            var danhSachChang = new List<ChangHocDto>();
            try
            {
                if (!string.IsNullOrEmpty(item.NoiDungJSON))
                    danhSachChang = JsonConvert.DeserializeObject<List<ChangHocDto>>(item.NoiDungJSON) ?? new List<ChangHocDto>();
            }
            catch { /* Parse lỗi thì thôi, trả list rỗng */ }

            return new LoTrinhChiTietDto
            {
                MaLoTrinh = item.MaLoTrinh,
                TieuDe = item.YeuCau,
                TenGiangVien = item.NguoiDung?.HoTen ?? "Hệ thống AI",
                NgayTao = item.NgayTao,
                CacChangHoc = danhSachChang
            };
        }

        // 3. Hàm lưu lộ trình
        public async Task<bool> LuuLoTrinhVaoTaiKhoanAsync(int maLoTrinhGoc, int maHocVien)
        {
            var loTrinhGoc = await _context.LoTrinhAIs.FirstOrDefaultAsync(x => x.MaLoTrinh == maLoTrinhGoc);
            if (loTrinhGoc == null) return false;

            var entity = new LoTrinhAIModel
            {
                MaNguoiDung = maHocVien,
                YeuCau = loTrinhGoc.YeuCau,
                NoiDungJSON = loTrinhGoc.NoiDungJSON,
                TrangThai = "Đã lưu",
                NgayTao = DateTime.Now
            };

            _context.LoTrinhAIs.Add(entity);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}