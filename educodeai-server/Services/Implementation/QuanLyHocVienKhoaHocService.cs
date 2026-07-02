using educodeai_server.Data;
using educodeai_server.DTOs;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace educodeai_server.Services
{
    public class QuanLyHocVienKhoaHocService : IQuanLyHocVienKhoaHocService
    {
        private readonly EduCodeAIDbContext _context;

        public QuanLyHocVienKhoaHocService(EduCodeAIDbContext context)
        {
            _context = context;
        }

        public async Task<List<KhoaHocCuaGiangVienDTO>> LayDanhSachKhoaHocAsync(int maGiangVien)
        {
            return await _context.KhoaHocs
                .Where(k => k.MaGiangVien == maGiangVien)
                .Select(k => new KhoaHocCuaGiangVienDTO
                {
                    MaKhoaHoc = k.MaKhoaHoc,
                    TenKhoaHoc = k.TenKhoaHoc,
                    HinhAnh = k.HinhAnh,
                    SoLuongHocVien = _context.DangKyKhoaHocs.Count(dk => dk.MaKhoaHoc == k.MaKhoaHoc)
                })
                .ToListAsync();
        }

        public async Task<List<ChiTietHocVienTrongKhoaDTO>> LayDanhSachHocVienAsync(int maGiangVien, int? maKhoaHoc, string? search)
        {
            var query = _context.DangKyKhoaHocs
                .Include(dk => dk.NguoiDung)
                .Include(dk => dk.KhoaHoc)
                .Where(dk => dk.KhoaHoc.MaGiangVien == maGiangVien);

            if (!string.IsNullOrEmpty(search))
            {
                string searchLower = search.ToLower();
                query = query.Where(dk =>
                    (dk.NguoiDung.HoTen != null && dk.NguoiDung.HoTen.ToLower().Contains(searchLower)) ||
                    (dk.NguoiDung.Email != null && dk.NguoiDung.Email.ToLower().Contains(searchLower))
                );
            }

            if (maKhoaHoc.HasValue && maKhoaHoc.Value > 0)
            {
                query = query.Where(dk => dk.MaKhoaHoc == maKhoaHoc.Value);
                return await query
                    .Select(dk => new ChiTietHocVienTrongKhoaDTO
                    {
                        MaNguoiDung = dk.NguoiDung.MaNguoiDung,
                        HoTen = dk.NguoiDung.HoTen ?? "Chưa cập nhật",
                        Email = dk.NguoiDung.Email ?? "",
                        AnhDaiDien = dk.NguoiDung.AnhDaiDien,
                        NgayDangKy = dk.NgayDangKy,
                        TenKhoaHoc = dk.KhoaHoc.TenKhoaHoc,
                        TrangThai = dk.TrangThai ?? "Đang học"
                    })
                    .OrderByDescending(x => x.NgayDangKy)
                    .ToListAsync();
            }
            else
            {
                return await query
                    .GroupBy(dk => new { dk.NguoiDung.MaNguoiDung, dk.NguoiDung.HoTen, dk.NguoiDung.Email, dk.NguoiDung.AnhDaiDien })
                    .Select(g => new ChiTietHocVienTrongKhoaDTO
                    {
                        MaNguoiDung = g.Key.MaNguoiDung,
                        HoTen = g.Key.HoTen ?? "Chưa cập nhật",
                        Email = g.Key.Email ?? "",
                        AnhDaiDien = g.Key.AnhDaiDien,
                        NgayDangKy = g.Min(x => x.NgayDangKy),
                        TenKhoaHoc = "",
                        TrangThai = g.OrderByDescending(x => x.NgayDangKy).FirstOrDefault().TrangThai ?? "Đang học"
                    })
                    .OrderByDescending(x => x.NgayDangKy)
                    .ToListAsync();
            }
        }

        public async Task<TienDoKhoaHocHocVienDTO> LayTienDoChiTietAsync(int maKhoaHoc, int maNguoiDung)
        {
            int tongThoiGianPhut = 0;
            try
            {
                tongThoiGianPhut = await _context.TienDoBaiHocs
                    .Include(t => t.BaiHoc)
                    .ThenInclude(b => b.ChuongHoc)
                    .Where(t => t.MaNguoiDung == maNguoiDung && t.BaiHoc.ChuongHoc.MaKhoaHoc == maKhoaHoc)
                    .SumAsync(t => t.ThoiGianHoc);
            }
            catch { /* Bỏ qua nếu lỗi */ }

            var tatCaBaiHoc = await _context.BaiHocs
                .Include(b => b.ChuongHoc)
                .Where(b => b.ChuongHoc.MaKhoaHoc == maKhoaHoc)
                .ToListAsync();

            var baiDaHocIDs = await _context.TienDoBaiHocs
                .Where(t => t.MaNguoiDung == maNguoiDung)
                .Select(t => t.MaBaiHoc)
                .ToListAsync();

            var tienDoTheoChuong = tatCaBaiHoc
                .GroupBy(b => b.ChuongHoc?.TenChuong ?? "Chương bổ sung")
                .Select(g => new ChuongHocTienDoDTO
                {
                    MaChuong = g.First().ChuongHoc?.MaChuong ?? 0,
                    TenChuong = g.Key,
                    DanhSachBaiHoc = g.Select(b => new BaiHocTienDoDTO
                    {
                        MaBaiHoc = b.MaBaiHoc,
                        TenBaiHoc = b.TieuDe ?? "Bài học",
                        DaHoanThanh = baiDaHocIDs.Contains(b.MaBaiHoc)
                    }).ToList()
                })
                .ToList();

            return new TienDoKhoaHocHocVienDTO
            {
                TongThoiGianHocPhut = tongThoiGianPhut,
                DanhSachChuong = tienDoTheoChuong
            };
        }

        public async Task<IEnumerable<object>> LayCacKhoaHocCuaHocVienAsync(int maNguoiDung, int maGiangVien)
        {
            return await _context.DangKyKhoaHocs
                .Include(dk => dk.KhoaHoc)
                .Where(dk => dk.MaNguoiDung == maNguoiDung && dk.KhoaHoc.MaGiangVien == maGiangVien)
                .Select(dk => new
                {
                    MaKhoaHoc = dk.MaKhoaHoc,
                    TenKhoaHoc = dk.KhoaHoc.TenKhoaHoc,
                    NgayDangKy = dk.NgayDangKy,
                    TrangThai = dk.TrangThai ?? "Đang học"
                })
                .OrderByDescending(x => x.NgayDangKy)
                .ToListAsync();
        }
    }
}