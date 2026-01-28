using Microsoft.EntityFrameworkCore;
using educodeai_server.Data;
using educodeai_server.Services.Interface;
using educodeai_server.DTOs.ThongKeHocTap;
using educodeai_server.Common;

namespace educodeai_server.Services.Implementation
{
    public class ThongKeHocTapService : IThongKeHocTapService
    {
        private readonly EduCodeAIDbContext _context;

        public ThongKeHocTapService(EduCodeAIDbContext context)
        {
            _context = context;
        }

        // ================== OVERVIEW ==================
        public async Task<ThongKeOverviewDTO> GetOverviewAsync(int maGiangVien)
        {
            var khoaHocIds = await _context.KhoaHocs
                .Where(kh => kh.MaGiangVien == maGiangVien && kh.TrangThai == "Active")
                .Select(kh => kh.MaKhoaHoc)
                .ToListAsync();

            int soKhoaHocDangDay = khoaHocIds.Count;

            int tongBaiTap = await _context.BaiTaps
                .Where(bt =>
                    _context.BaiHocs
                        .Where(bh =>
                            _context.ChuongHocs
                                .Where(ch => khoaHocIds.Contains(ch.MaKhoaHoc))
                                .Select(ch => ch.MaChuong)
                                .Contains(bh.MaChuong)
                        )
                        .Select(bh => bh.MaBaiHoc)
                        .Contains(bt.MaBaiHoc)
                )
                .CountAsync();

            var dangKyQuery = _context.DangKyKhoaHocs
                .Where(dk => khoaHocIds.Contains(dk.MaKhoaHoc));

            double tyLeHoanThanhTB = 0;
            if (await dangKyQuery.AnyAsync())
            {
                tyLeHoanThanhTB = await dangKyQuery.AverageAsync(dk => dk.TienDo);
            }

            double tongGioHoc = await _context.TienDoBaiHocs
                .Where(td =>
                    _context.BaiHocs
                        .Where(bh =>
                            _context.ChuongHocs
                                .Where(ch => khoaHocIds.Contains(ch.MaKhoaHoc))
                                .Select(ch => ch.MaChuong)
                                .Contains(bh.MaChuong)
                        )
                        .Select(bh => bh.MaBaiHoc)
                        .Contains(td.MaBaiHoc)
                )
                .SumAsync(td => (double?)td.ThoiGianHoc) ?? 0;

            int tongHocVien = await dangKyQuery
                .Select(dk => dk.MaNguoiDung)
                .Distinct()
                .CountAsync();

            double gioHocTrungBinh = tongHocVien == 0
                ? 0
                : tongGioHoc / tongHocVien;

            return new ThongKeOverviewDTO
            {
                SoKhoaHocDangDay = soKhoaHocDangDay,
                TongBaiTap = tongBaiTap,
                TyLeHoanThanhTB = Math.Round(tyLeHoanThanhTB, 1),
                GioHocTrungBinh = Math.Round(gioHocTrungBinh, 1)
            };
        }

        // ================== TRẠNG THÁI HỌC VIÊN ==================
        public async Task<List<TrangThaiHocVienDTO>> GetTrangThaiHocVienAsync(int maGiangVien)
        {
            var khoaHocIds = await _context.KhoaHocs
                .Where(kh => kh.MaGiangVien == maGiangVien)
                .Select(kh => kh.MaKhoaHoc)
                .ToListAsync();

            return await _context.DangKyKhoaHocs
                .Where(dk => khoaHocIds.Contains(dk.MaKhoaHoc))
                .GroupBy(dk =>
                    dk.TienDo == 100 ? "Hoàn thành" :
                    dk.TienDo > 0 ? "Đang học" :
                    "Chưa học"
                )
                .Select(g => new TrangThaiHocVienDTO
                {
                    TrangThai = g.Key,
                    SoLuong = g
                        .Select(x => x.MaNguoiDung)
                        .Distinct()
                        .Count()
                })
                .ToListAsync();
        }

        // ================== TIẾN ĐỘ THEO THỜI GIAN (STUB) ==================
        public async Task<List<TienDoTheoThoiGianDTO>> GetTienDoTheoThoiGianAsync(int maGiangVien)
        {
            return new List<TienDoTheoThoiGianDTO>();
        }

        // ================== DANH SÁCH HỌC VIÊN (STUB) ==================
        public async Task<PagedResult<HocVienThongKeDTO>> GetHocVienAsync(
    int maGiangVien,
    int page,
    int pageSize,
    string? search)
        {
            var khoaHocIds = await _context.KhoaHocs
                .Where(kh => kh.MaGiangVien == maGiangVien)
                .Select(kh => kh.MaKhoaHoc)
                .ToListAsync();

            // ===== 1. Query học viên + tiến độ =====
            var baseQuery =
                from dk in _context.DangKyKhoaHocs
                join nd in _context.NguoiDungs on dk.MaNguoiDung equals nd.MaNguoiDung
                where khoaHocIds.Contains(dk.MaKhoaHoc)
                select new { dk, nd };

            if (!string.IsNullOrWhiteSpace(search))
            {
                baseQuery = baseQuery.Where(x =>
                    x.nd.HoTen.Contains(search) ||
                    x.nd.Email.Contains(search));
            }

            var hocVienQuery = baseQuery
                .GroupBy(x => new
                {
                    x.nd.MaNguoiDung,
                    x.nd.HoTen,
                    x.nd.Email
                })
                .Select(g => new
                {
                    g.Key.MaNguoiDung,
                    g.Key.HoTen,
                    g.Key.Email,
                    TienDoTB = g.Average(x => x.dk.TienDo)
                });

            int total = await hocVienQuery.CountAsync();

            var hocVienPage = await hocVienQuery
                .OrderByDescending(x => x.MaNguoiDung)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var hocVienIds = hocVienPage.Select(x => x.MaNguoiDung).ToList();

            // ===== 2. Số bài đã nộp =====
            var baiDaNopDict = await (
                from bn in _context.BaiNops
                join bt in _context.BaiTaps on bn.MaBaiTap equals bt.MaBaiTap
                join bh in _context.BaiHocs on bt.MaBaiHoc equals bh.MaBaiHoc
                join ch in _context.ChuongHocs on bh.MaChuong equals ch.MaChuong
                where hocVienIds.Contains(bn.MaNguoiDung)
                      && khoaHocIds.Contains(ch.MaKhoaHoc)
                group bn by bn.MaNguoiDung into g
                select new
                {
                    MaNguoiDung = g.Key,
                    SoBaiDaNop = g.Count()
                }
            ).ToDictionaryAsync(x => x.MaNguoiDung, x => x.SoBaiDaNop);

            // ===== 3. Tổng giờ học =====
            var gioHocDict = await (
                from td in _context.TienDoBaiHocs
                join bh in _context.BaiHocs on td.MaBaiHoc equals bh.MaBaiHoc
                join ch in _context.ChuongHocs on bh.MaChuong equals ch.MaChuong
                where hocVienIds.Contains(td.MaNguoiDung)
                      && khoaHocIds.Contains(ch.MaKhoaHoc)
                group td by td.MaNguoiDung into g
                select new
                {
                    MaNguoiDung = g.Key,
                    GioHoc = g.Sum(x => (double?)x.ThoiGianHoc) ?? 0
                }
            ).ToDictionaryAsync(x => x.MaNguoiDung, x => x.GioHoc);

            // ===== 4. Map ra DTO =====
            var data = hocVienPage.Select(x => new HocVienThongKeDTO
            {
                MaNguoiDung = x.MaNguoiDung,
                HoTen = x.HoTen,
                Email = x.Email,
                TienDo = Math.Round(x.TienDoTB, 1),
                SoBaiDaNop = baiDaNopDict.GetValueOrDefault(x.MaNguoiDung, 0),
                GioHoc = Math.Round(gioHocDict.GetValueOrDefault(x.MaNguoiDung, 0), 1),
                TrangThai =
                    x.TienDoTB == 100 ? "Hoàn thành" :
                    x.TienDoTB > 0 ? "Đang học" :
                    "Chưa học"
            }).ToList();

            return new PagedResult<HocVienThongKeDTO>
            {
                Total = total,
                Data = data
            };
        }
    }
}
