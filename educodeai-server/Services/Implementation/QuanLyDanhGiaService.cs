using educodeai_server.Data;
using educodeai_server.DTOs.QuanTriVien;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class QuanLyDanhGiaService : IQuanLyDanhGiaService
    {
        private readonly EduCodeAIDbContext _context;

        public QuanLyDanhGiaService(EduCodeAIDbContext context)
        {
            _context = context;
        }

        public async Task<ThongKeDanhGiaAdminDTO> LayThongKeAsync()
        {
            var danhSach = await _context.DanhGias
                .AsNoTracking()
                .Select(x => new { x.SoSao, TrangThai = x.TrangThai ?? "ChoDuyet" })
                .ToListAsync();

            var tongDanhGia = danhSach.Count;

            return new ThongKeDanhGiaAdminDTO
            {
                TongDanhGia = tongDanhGia,
                ChoDuyet = danhSach.Count(x => x.TrangThai == "ChoDuyet"),
                DaDuyet = danhSach.Count(x => x.TrangThai == "DaDuyet"),
                TuChoi = danhSach.Count(x => x.TrangThai == "TuChoi"),
                DanhGiaTrungBinh = tongDanhGia > 0 ? Math.Round(danhSach.Average(x => x.SoSao), 1) : 0,
                PhanBoSao = new PhanBoSaoDTO
                {
                    Star1 = danhSach.Count(x => x.SoSao == 1),
                    Star2 = danhSach.Count(x => x.SoSao == 2),
                    Star3 = danhSach.Count(x => x.SoSao == 3),
                    Star4 = danhSach.Count(x => x.SoSao == 4),
                    Star5 = danhSach.Count(x => x.SoSao == 5)
                }
            };
        }

        public async Task<PagedResultDTO<DanhGiaAdminItemDTO>> LayDanhSachAsync(DanhGiaAdminFilterDTO filter)
        {
            var page = filter.Page <= 0 ? 1 : filter.Page;
            var pageSize = filter.PageSize <= 0 ? 10 : Math.Min(filter.PageSize, 100);

            var query = _context.DanhGias
                .AsNoTracking()
                .Include(x => x.NguoiDung)
                .Include(x => x.KhoaHoc)
                    .ThenInclude(x => x.GiangVien)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.TrangThai) && filter.TrangThai != "TatCa")
            {
                query = query.Where(x => (x.TrangThai ?? "ChoDuyet") == filter.TrangThai);
            }

            if (filter.SoSao.HasValue && filter.SoSao.Value >= 1 && filter.SoSao.Value <= 5)
            {
                query = query.Where(x => x.SoSao == filter.SoSao.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var keyword = filter.Search.Trim().ToLower();
                query = query.Where(x =>
                    (x.NhanXet ?? string.Empty).ToLower().Contains(keyword) ||
                    (x.NguoiDung.HoTen ?? string.Empty).ToLower().Contains(keyword) ||
                    (x.NguoiDung.Email ?? string.Empty).ToLower().Contains(keyword) ||
                    x.KhoaHoc.TenKhoaHoc.ToLower().Contains(keyword));
            }

            var total = await query.CountAsync();

            var data = await query
                .OrderByDescending(x => x.NgayDanhGia)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new DanhGiaAdminItemDTO
                {
                    Id = x.MaDanhGia,
                    MaNguoiDung = x.MaNguoiDung,
                    MaKhoaHoc = x.MaKhoaHoc,
                    NguoiDung = new DanhGiaAdminNguoiDungDTO
                    {
                        Id = x.MaNguoiDung,
                        Ten = x.NguoiDung.HoTen ?? "Hoc vien",
                        Email = x.NguoiDung.Email,
                        Avatar = x.NguoiDung.AnhDaiDien
                    },
                    KhoaHoc = new DanhGiaAdminKhoaHocDTO
                    {
                        Id = x.MaKhoaHoc,
                        TenKhoaHoc = x.KhoaHoc.TenKhoaHoc,
                        GiangVien = x.KhoaHoc.GiangVien.HoTen
                    },
                    SoSao = x.SoSao,
                    NoiDung = x.NhanXet ?? string.Empty,
                    NgayTao = x.NgayDanhGia,
                    TrangThai = x.TrangThai ?? "ChoDuyet"
                })
                .ToListAsync();

            return new PagedResultDTO<DanhGiaAdminItemDTO>
            {
                Data = data,
                Total = total,
                Page = page,
                PageSize = pageSize,
                TotalPages = Math.Max(1, (int)Math.Ceiling((double)total / pageSize))
            };
        }

        public async Task<bool> CapNhatTrangThaiAsync(int id, string trangThai)
        {
            var danhGia = await _context.DanhGias.FindAsync(id);
            if (danhGia == null)
            {
                return false;
            }

            danhGia.TrangThai = trangThai;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> XoaAsync(int id)
        {
            var danhGia = await _context.DanhGias.FindAsync(id);
            if (danhGia == null)
            {
                return false;
            }

            _context.DanhGias.Remove(danhGia);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
