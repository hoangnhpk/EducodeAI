using educodeai_server.Data;
using educodeai_server.DTOs.ThongKeAdmin;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace educodeai_server.Services.Implementation
{
    public class ThongKeAdminService : IThongKeAdminService
    {
        private readonly EduCodeAIDbContext _context;

        public ThongKeAdminService(EduCodeAIDbContext context)
        {
            _context = context;
        }

        private static int ClampPage(int page) => page < 1 ? 1 : page;
        private static int ClampPageSize(int pageSize) => pageSize is < 1 ? 10 : (pageSize > 100 ? 100 : pageSize);
        private static string NormalizeSearch(string? search) => (search ?? string.Empty).Trim();

        public async Task<ThongKeTongQuanDTO> LayTongQuanAsync()
        {
            // VaiTro: 0 Admin, 1 GiangVien, 2 HocVien
            // Note: DbContext is not thread-safe; do not run parallel queries on one instance.
            var tongHocVien = await _context.NguoiDungs.AsNoTracking().CountAsync(u => u.VaiTro == 2);
            var tongGiangVien = await _context.NguoiDungs.AsNoTracking().CountAsync(u => u.VaiTro == 1);
            var tongKhoaHoc = await _context.KhoaHocs.AsNoTracking().CountAsync();
            var tongLuotDangKy = await _context.DangKyKhoaHocs.AsNoTracking().CountAsync();

            return new ThongKeTongQuanDTO
            {
                TongHocVien = tongHocVien,
                TongGiangVien = tongGiangVien,
                TongKhoaHoc = tongKhoaHoc,
                TongLuotDangKy = tongLuotDangKy,
            };
        }

        public async Task<List<DangKyTheoThangDTO>> LayDangKyTheo12ThangAsync()
        {
            var now = DateTime.UtcNow;
            var start = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-11);

            var endExclusive = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1);
            return await LayDangKyTheoKhoangThangAsync(start, endExclusive);
        }

        public async Task<List<DangKyTheoThangDTO>> LayDangKyTheoKhoangThangAsync(DateTime fromUtc, DateTime toUtcExclusive)
        {
            // Normalize: first day of month
            var start = new DateTime(fromUtc.Year, fromUtc.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endExclusive = new DateTime(toUtcExclusive.Year, toUtcExclusive.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            if (endExclusive <= start) endExclusive = start.AddMonths(1);

            var raw = await _context.DangKyKhoaHocs
                .AsNoTracking()
                .Where(dk => dk.NgayDangKy >= start && dk.NgayDangKy < endExclusive)
                .GroupBy(dk => new { dk.NgayDangKy.Year, dk.NgayDangKy.Month })
                .Select(g => new
                {
                    Nam = g.Key.Year,
                    Thang = g.Key.Month,
                    SoLuotDangKy = g.Count(),
                })
                .ToListAsync();

            var map = raw.ToDictionary(x => (x.Nam, x.Thang), x => x.SoLuotDangKy);

            int months = ((endExclusive.Year - start.Year) * 12) + (endExclusive.Month - start.Month);
            if (months < 1) months = 1;
            if (months > 60) months = 60; // guard

            var result = new List<DangKyTheoThangDTO>(months);
            for (int i = 0; i < months; i++)
            {
                var dt = start.AddMonths(i);
                int so = map.TryGetValue((dt.Year, dt.Month), out var v) ? v : 0;

                result.Add(new DangKyTheoThangDTO
                {
                    Nam = dt.Year,
                    Thang = dt.Month,
                    Nhan = $"{dt.Month:D2}/{dt.Year}",
                    SoLuotDangKy = so,
                    TongTien = 0,
                });
            }

            return result;
        }

        public async Task<List<TopKhoaHocDangKyDTO>> LayTopKhoaHocDangKyAsync(DateTime fromUtc, DateTime toUtcExclusive, int top = 5)
        {
            if (top < 1) top = 5;
            if (top > 50) top = 50;

            var start = new DateTime(fromUtc.Year, fromUtc.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endExclusive = new DateTime(toUtcExclusive.Year, toUtcExclusive.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            if (endExclusive <= start) endExclusive = start.AddMonths(1);

            var rows = await _context.DangKyKhoaHocs
                .AsNoTracking()
                .Where(dk => dk.NgayDangKy >= start && dk.NgayDangKy < endExclusive)
                .GroupBy(dk => new { dk.MaKhoaHoc, dk.KhoaHoc.TenKhoaHoc })
                .Select(g => new TopKhoaHocDangKyDTO
                {
                    MaKhoaHoc = g.Key.MaKhoaHoc,
                    TenKhoaHoc = g.Key.TenKhoaHoc ?? "",
                    SoLuotDangKy = g.Count()
                })
                .OrderByDescending(x => x.SoLuotDangKy)
                .ThenBy(x => x.TenKhoaHoc)
                .Take(top)
                .ToListAsync();

            return rows;
        }

        public async Task<List<TopGiangVienDangKyDTO>> LayTopGiangVienDangKyAsync(DateTime fromUtc, DateTime toUtcExclusive, int top = 5)
        {
            if (top < 1) top = 5;
            if (top > 50) top = 50;

            var start = new DateTime(fromUtc.Year, fromUtc.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endExclusive = new DateTime(toUtcExclusive.Year, toUtcExclusive.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            if (endExclusive <= start) endExclusive = start.AddMonths(1);

            var rows = await _context.DangKyKhoaHocs
                .AsNoTracking()
                .Where(dk => dk.NgayDangKy >= start && dk.NgayDangKy < endExclusive)
                .GroupBy(dk => new
                {
                    dk.KhoaHoc.MaGiangVien,
                    TenGiangVien = dk.KhoaHoc.GiangVien.HoTen,
                    Email = dk.KhoaHoc.GiangVien.Email
                })
                .Select(g => new TopGiangVienDangKyDTO
                {
                    MaGiangVien = g.Key.MaGiangVien,
                    TenGiangVien = g.Key.TenGiangVien ?? "",
                    Email = g.Key.Email ?? "",
                    SoLuotDangKy = g.Count()
                })
                .OrderByDescending(x => x.SoLuotDangKy)
                .ThenBy(x => x.TenGiangVien)
                .Take(top)
                .ToListAsync();

            return rows;
        }

        private static DateTime StartOfDayUtc(DateTime dtUtc) => new DateTime(dtUtc.Year, dtUtc.Month, dtUtc.Day, 0, 0, 0, DateTimeKind.Utc);

        private static DateTime ClampToMonthStartUtc(DateTime dtUtc) => new DateTime(dtUtc.Year, dtUtc.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        private static double Clamp01(double v) => v < 0 ? 0 : (v > 1 ? 1 : v);

        public async Task<HoatDongHeThongDTO> LayHoatDongHeThongAsync(DateTime fromUtc, DateTime toUtcExclusive)
        {
            var startMonth = ClampToMonthStartUtc(fromUtc);
            var endMonthExclusive = ClampToMonthStartUtc(toUtcExclusive);
            if (endMonthExclusive <= startMonth) endMonthExclusive = startMonth.AddMonths(1);

            // Mốc tính: ngày cuối của "đến tháng" (UTC)
            var asOfUtc = StartOfDayUtc(endMonthExclusive.AddDays(-1));

            async Task<int> CountDistinctHocThatAsync(int windowDays)
            {
                var fromDay = asOfUtc.AddDays(-(windowDays - 1));
                var toDayExclusive = asOfUtc.AddDays(1);

                return await _context.TienDoBaiHocs
                    .AsNoTracking()
                    .Where(t => t.NgayCapNhat >= fromDay && t.NgayCapNhat < toDayExclusive)
                    .Select(t => t.MaNguoiDung)
                    .Distinct()
                    .CountAsync();
            }

            async Task<int> CountDistinctDangNhapAsync(int windowDays)
            {
                var fromDay = asOfUtc.AddDays(-(windowDays - 1));
                var toDayExclusive = asOfUtc.AddDays(1);

                var fromNguoiDung = await _context.NguoiDungs
                    .AsNoTracking()
                    .Where(u => u.NgayDangNhapCuoi != null && u.NgayDangNhapCuoi >= fromDay && u.NgayDangNhapCuoi < toDayExclusive)
                    .Select(u => u.MaNguoiDung)
                    .Distinct()
                    .ToListAsync();

                var fromSessions = await _context.PhienDangNhaps
                    .AsNoTracking()
                    .Where(p => p.ThoiGianHoatDongCuoi >= fromDay && p.ThoiGianHoatDongCuoi < toDayExclusive)
                    .Select(p => p.MaNguoiDung)
                    .Distinct()
                    .ToListAsync();

                var set = new HashSet<int>(fromNguoiDung);
                foreach (var id in fromSessions) set.Add(id);
                return set.Count;
            }

            // Sequential awaits (DbContext not thread-safe)
            var hocDau = await CountDistinctHocThatAsync(1);
            var hocWau = await CountDistinctHocThatAsync(7);
            var hocMau = await CountDistinctHocThatAsync(30);

            var loginDau = await CountDistinctDangNhapAsync(1);
            var loginWau = await CountDistinctDangNhapAsync(7);
            var loginMau = await CountDistinctDangNhapAsync(30);

            return new HoatDongHeThongDTO
            {
                AsOfUtc = asOfUtc,
                HocThat = new HoatDongChiSoDTO { DAU = hocDau, WAU = hocWau, MAU = hocMau },
                DangNhap = new HoatDongChiSoDTO { DAU = loginDau, WAU = loginWau, MAU = loginMau }
            };
        }

        public async Task<List<ChatLuongKhoaHocItemDTO>> LayChatLuongKhoaHocAsync(DateTime fromUtc, DateTime toUtcExclusive, int top = 10)
        {
            if (top < 1) top = 10;
            if (top > 50) top = 50;

            var start = ClampToMonthStartUtc(fromUtc);
            var endExclusive = ClampToMonthStartUtc(toUtcExclusive);
            if (endExclusive <= start) endExclusive = start.AddMonths(1);

            // 1) Đăng ký + tiến độ trong khoảng
            var regAgg = await _context.DangKyKhoaHocs
                .AsNoTracking()
                .Where(dk => dk.NgayDangKy >= start && dk.NgayDangKy < endExclusive)
                .GroupBy(dk => dk.MaKhoaHoc)
                .Select(g => new
                {
                    MaKhoaHoc = g.Key,
                    SoDangKy = g.Count(),
                    TienDoTB = g.Average(x => (double)x.TienDo),
                    SoHoanThanh = g.Count(x => (x.TrangThai ?? "") == "HoanThanh" || x.TienDo >= 100)
                })
                .ToListAsync();

            var regMap = regAgg.ToDictionary(x => x.MaKhoaHoc, x => x);

            // 2) Đánh giá trong khoảng
            var ratingAgg = await _context.DanhGias
                .AsNoTracking()
                .Where(dg => dg.NgayDanhGia >= start && dg.NgayDanhGia < endExclusive)
                .GroupBy(dg => dg.MaKhoaHoc)
                .Select(g => new
                {
                    MaKhoaHoc = g.Key,
                    SoDanhGia = g.Count(),
                    DiemTB = g.Average(x => (double)x.SoSao)
                })
                .ToListAsync();

            var ratingMap = ratingAgg.ToDictionary(x => x.MaKhoaHoc, x => x);

            // 3) Bình luận theo khóa học trong khoảng (BinhLuan -> BaiHoc -> ChuongHoc -> KhoaHoc)
            var commentAgg = await _context.BinhLuans
                .AsNoTracking()
                .Include(bl => bl.BaiHoc)
                .ThenInclude(bh => bh.ChuongHoc)
                .Where(bl => bl.NgayTao >= start && bl.NgayTao < endExclusive)
                .GroupBy(bl => bl.BaiHoc.ChuongHoc.MaKhoaHoc)
                .Select(g => new
                {
                    MaKhoaHoc = g.Key,
                    SoBinhLuan = g.Count()
                })
                .ToListAsync();

            var commentMap = commentAgg.ToDictionary(x => x.MaKhoaHoc, x => x.SoBinhLuan);

            // 4) Ghép với thông tin khóa học
            var khoaHocIds = regAgg.Select(x => x.MaKhoaHoc)
                .Concat(ratingAgg.Select(x => x.MaKhoaHoc))
                .Concat(commentAgg.Select(x => x.MaKhoaHoc))
                .Distinct()
                .ToList();

            if (khoaHocIds.Count == 0) return new List<ChatLuongKhoaHocItemDTO>();

            var khoaHocs = await _context.KhoaHocs
                .AsNoTracking()
                .Include(k => k.GiangVien)
                .Where(k => khoaHocIds.Contains(k.MaKhoaHoc))
                .Select(k => new
                {
                    k.MaKhoaHoc,
                    k.TenKhoaHoc,
                    k.MaGiangVien,
                    TenGiangVien = k.GiangVien.HoTen,
                })
                .ToListAsync();

            double CalcScore(double ratingAvg, int ratingCount, double completionRate01, int comments, int regs)
            {
                var ratingNorm = ratingCount <= 0 ? 0 : Clamp01(ratingAvg / 5.0);
                var completionNorm = Clamp01(completionRate01);
                var engagementNorm = Clamp01(regs <= 0 ? 0 : (comments / (double)regs) / 2.0); // 2 bình luận/đăng ký là "đầy"
                return (ratingNorm * 0.45) + (completionNorm * 0.45) + (engagementNorm * 0.10);
            }

            var items = new List<ChatLuongKhoaHocItemDTO>(khoaHocs.Count);
            foreach (var k in khoaHocs)
            {
                regMap.TryGetValue(k.MaKhoaHoc, out var r);
                ratingMap.TryGetValue(k.MaKhoaHoc, out var dg);
                commentMap.TryGetValue(k.MaKhoaHoc, out var soBl);

                var soDangKy = r?.SoDangKy ?? 0;
                var tienDoTb = r?.TienDoTB ?? 0;
                var soHoanThanh = r?.SoHoanThanh ?? 0;
                var tyLeHoanThanh = soDangKy <= 0 ? 0 : (soHoanThanh / (double)soDangKy);

                var soDanhGia = dg?.SoDanhGia ?? 0;
                var diemTb = dg?.DiemTB ?? 0;

                var score = CalcScore(diemTb, soDanhGia, tyLeHoanThanh, soBl, soDangKy);

                items.Add(new ChatLuongKhoaHocItemDTO
                {
                    MaKhoaHoc = k.MaKhoaHoc,
                    TenKhoaHoc = k.TenKhoaHoc ?? "",
                    MaGiangVien = k.MaGiangVien,
                    TenGiangVien = k.TenGiangVien ?? "",
                    SoDangKy = soDangKy,
                    TienDoTrungBinh = tienDoTb,
                    TyLeHoanThanh = tyLeHoanThanh,
                    SoDanhGia = soDanhGia,
                    DiemDanhGiaTrungBinh = diemTb,
                    SoBinhLuan = soBl,
                    DiemChatLuong = score
                });
            }

            // Trả về nhiều hơn để frontend có thể lấy top tốt/xấu
            return items
                .OrderByDescending(x => x.DiemChatLuong)
                .ThenByDescending(x => x.SoDangKy)
                .Take(Math.Min(items.Count, top * 2))
                .ToList();
        }

        public async Task<PagedResultDTO<HocVienItemDTO>> LayDanhSachHocVienAsync(int page, int pageSize, string? search)
        {
            page = ClampPage(page);
            pageSize = ClampPageSize(pageSize);
            var q = NormalizeSearch(search);

            var query = _context.NguoiDungs
                .AsNoTracking()
                .Where(u => u.VaiTro == 2);

            if (!string.IsNullOrEmpty(q))
            {
                query = query.Where(u =>
                    (u.TaiKhoan ?? "").ToLower().Contains(q.ToLower()) ||
                    (u.HoTen ?? "").ToLower().Contains(q.ToLower()) ||
                    (u.Email ?? "").ToLower().Contains(q.ToLower()));
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
            if (totalPages == 0) totalPages = 1;
            if (page > totalPages) page = totalPages;

            var items = await query
                .OrderByDescending(u => u.NgayThamGia)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new HocVienItemDTO
                {
                    MaNguoiDung = u.MaNguoiDung,
                    TaiKhoan = u.TaiKhoan ?? "",
                    HoTen = u.HoTen ?? "",
                    Email = u.Email ?? "",
                    TrangThai = u.TrangThai ?? "",
                    NgayThamGia = u.NgayThamGia
                })
                .ToListAsync();

            return new PagedResultDTO<HocVienItemDTO>
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = totalPages,
                Items = items
            };
        }

        public async Task<PagedResultDTO<GiangVienItemDTO>> LayDanhSachGiangVienAsync(int page, int pageSize, string? search)
        {
            page = ClampPage(page);
            pageSize = ClampPageSize(pageSize);
            var q = NormalizeSearch(search);

            var query = _context.NguoiDungs
                .AsNoTracking()
                .Where(u => u.VaiTro == 1);

            if (!string.IsNullOrEmpty(q))
            {
                query = query.Where(u =>
                    (u.TaiKhoan ?? "").ToLower().Contains(q.ToLower()) ||
                    (u.HoTen ?? "").ToLower().Contains(q.ToLower()) ||
                    (u.Email ?? "").ToLower().Contains(q.ToLower()));
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
            if (totalPages == 0) totalPages = 1;
            if (page > totalPages) page = totalPages;

            var items = await query
                .OrderByDescending(u => u.NgayThamGia)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new GiangVienItemDTO
                {
                    MaNguoiDung = u.MaNguoiDung,
                    TaiKhoan = u.TaiKhoan ?? "",
                    HoTen = u.HoTen ?? "",
                    Email = u.Email ?? "",
                    TrangThai = u.TrangThai ?? "",
                    NgayThamGia = u.NgayThamGia
                })
                .ToListAsync();

            return new PagedResultDTO<GiangVienItemDTO>
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = totalPages,
                Items = items
            };
        }

        public async Task<PagedResultDTO<KhoaHocItemDTO>> LayDanhSachKhoaHocAsync(int page, int pageSize, string? search)
        {
            page = ClampPage(page);
            pageSize = ClampPageSize(pageSize);
            var q = NormalizeSearch(search);

            IQueryable<educodeai_server.Models.KhoaHocModel> query = _context.KhoaHocs
                .AsNoTracking()
                .Include(k => k.GiangVien);

            if (!string.IsNullOrEmpty(q))
            {
                query = query.Where(k =>
                    (k.TenKhoaHoc ?? "").ToLower().Contains(q.ToLower()) ||
                    (k.LinhVuc ?? "").ToLower().Contains(q.ToLower()) ||
                    (k.TrinhDo ?? "").ToLower().Contains(q.ToLower()) ||
                    (k.GiangVien.HoTen ?? "").ToLower().Contains(q.ToLower()) ||
                    (k.GiangVien.Email ?? "").ToLower().Contains(q.ToLower()));
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
            if (totalPages == 0) totalPages = 1;
            if (page > totalPages) page = totalPages;

            var items = await query
                .OrderByDescending(k => k.NgayTao)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(k => new KhoaHocItemDTO
                {
                    MaKhoaHoc = k.MaKhoaHoc,
                    TenKhoaHoc = k.TenKhoaHoc ?? "",
                    LinhVuc = k.LinhVuc ?? "",
                    TrinhDo = k.TrinhDo ?? "",
                    TrangThai = k.TrangThai ?? "",
                    ThoiLuongGio = k.ThoiLuongGio,
                    NgayTao = k.NgayTao,
                    MaGiangVien = k.MaGiangVien,
                    TenGiangVien = k.GiangVien.HoTen ?? ""
                })
                .ToListAsync();

            return new PagedResultDTO<KhoaHocItemDTO>
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = totalPages,
                Items = items
            };
        }

        public async Task<PagedResultDTO<DangKyItemDTO>> LayDanhSachDangKyAsync(int page, int pageSize, string? search)
        {
            page = ClampPage(page);
            pageSize = ClampPageSize(pageSize);
            var q = NormalizeSearch(search);

            IQueryable<educodeai_server.Models.DangKyKhoaHocModel> query = _context.DangKyKhoaHocs
                .AsNoTracking()
                .Include(dk => dk.KhoaHoc)
                .Include(dk => dk.NguoiDung);

            if (!string.IsNullOrEmpty(q))
            {
                query = query.Where(dk =>
                    (dk.KhoaHoc.TenKhoaHoc ?? "").ToLower().Contains(q.ToLower()) ||
                    (dk.NguoiDung.HoTen ?? "").ToLower().Contains(q.ToLower()) ||
                    (dk.NguoiDung.Email ?? "").ToLower().Contains(q.ToLower()) ||
                    (dk.NguoiDung.TaiKhoan ?? "").ToLower().Contains(q.ToLower()));
            }

            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
            if (totalPages == 0) totalPages = 1;
            if (page > totalPages) page = totalPages;

            var items = await query
                .OrderByDescending(dk => dk.NgayDangKy)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(dk => new DangKyItemDTO
                {
                    MaDangKy = dk.MaDangKy,
                    NgayDangKy = dk.NgayDangKy,
                    MaKhoaHoc = dk.MaKhoaHoc,
                    TenKhoaHoc = dk.KhoaHoc.TenKhoaHoc ?? "",
                    MaHocVien = dk.MaNguoiDung,
                    TenHocVien = dk.NguoiDung.HoTen ?? "",
                    EmailHocVien = dk.NguoiDung.Email ?? ""
                })
                .ToListAsync();

            return new PagedResultDTO<DangKyItemDTO>
            {
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = totalPages,
                Items = items
            };
        }

        public async Task<DoanhThuTongQuanDTO> LayDoanhThuTongQuanAsync()
        {
            var query = _context.DoanhThuGiangViens.AsNoTracking();

            var tongDoanhThu = await query.SumAsync(x => (decimal?)x.TongTienDonHang) ?? 0m;
            var tongPhiNenTang = await query.SumAsync(x => (decimal?)x.PhiNenTang) ?? 0m;
            var tongThucNhanGV = await query.SumAsync(x => (decimal?)x.ThucNhanGiangVien) ?? 0m;
            var tongDonHang = await query.Select(x => x.MaDonHang).Distinct().CountAsync();

            var thangNay = DateTime.UtcNow;
            var doanhThuThangNay = await query
                .Where(x => x.CreatedAt.Year == thangNay.Year && x.CreatedAt.Month == thangNay.Month)
                .SumAsync(x => (decimal?)x.TongTienDonHang) ?? 0m;

            return new DoanhThuTongQuanDTO
            {
                TongDoanhThu = tongDoanhThu,
                TongPhiNenTang = tongPhiNenTang,
                TongThucNhanGV = tongThucNhanGV,
                DoanhThuThangNay = doanhThuThangNay,
                TongDonHang = tongDonHang
            };
        }

        public async Task<List<DoanhThuTheoThoiGianDTO>> LayDoanhThuTheoThoiGianAsync(
            string? nhomTheo,
            DateTime? fromUtc,
            DateTime? toUtcExclusive)
        {
            string mode = (nhomTheo ?? "month").Trim().ToLowerInvariant();
            if (mode is not ("day" or "week" or "month" or "year"))
            {
                mode = "month";
            }

            var now = DateTime.UtcNow;
            var today = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);

            DateTime start;
            DateTime endExclusive;

            if (fromUtc.HasValue && toUtcExclusive.HasValue)
            {
                start = StartOfDayUtc(fromUtc.Value);
                endExclusive = StartOfDayUtc(toUtcExclusive.Value).AddDays(1);
                if (endExclusive <= start) endExclusive = start.AddDays(1);
            }
            else
            {
                endExclusive = today.AddDays(1);
                start = mode switch
                {
                    "day" => today.AddDays(-29),
                    "week" => today.AddDays(-(12 * 7 - 1)),
                    "year" => new DateTime(today.Year - 4, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    _ => new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-11)
                };
            }

            var data = await _context.DoanhThuGiangViens
                .AsNoTracking()
                .Where(x => x.CreatedAt >= start && x.CreatedAt < endExclusive)
                .Select(x => new
                {
                    x.CreatedAt,
                    x.TongTienDonHang,
                    x.PhiNenTang,
                    x.ThucNhanGiangVien
                })
                .ToListAsync();

            var map = mode switch
            {
                "day" => data
                    .GroupBy(x => x.CreatedAt.Date)
                    .ToDictionary(
                        g => g.Key.ToString("yyyy-MM-dd"),
                        g => new DoanhThuTheoThoiGianDTO
                        {
                            Nhan = g.Key.ToString("dd/MM", CultureInfo.InvariantCulture),
                            TongDoanhThu = g.Sum(x => x.TongTienDonHang),
                            PhiNenTang = g.Sum(x => x.PhiNenTang),
                            ThucNhanGV = g.Sum(x => x.ThucNhanGiangVien)
                        }),
                "week" => data
                    .GroupBy(x => new { Year = ISOWeek.GetYear(x.CreatedAt.Date), Week = ISOWeek.GetWeekOfYear(x.CreatedAt.Date) })
                    .ToDictionary(
                        g => $"{g.Key.Year}-W{g.Key.Week:D2}",
                        g => new DoanhThuTheoThoiGianDTO
                        {
                            Nhan = $"T{g.Key.Week}/{g.Key.Year}",
                            TongDoanhThu = g.Sum(x => x.TongTienDonHang),
                            PhiNenTang = g.Sum(x => x.PhiNenTang),
                            ThucNhanGV = g.Sum(x => x.ThucNhanGiangVien)
                        }),
                "year" => data
                    .GroupBy(x => x.CreatedAt.Year)
                    .ToDictionary(
                        g => g.Key.ToString(),
                        g => new DoanhThuTheoThoiGianDTO
                        {
                            Nhan = g.Key.ToString(),
                            TongDoanhThu = g.Sum(x => x.TongTienDonHang),
                            PhiNenTang = g.Sum(x => x.PhiNenTang),
                            ThucNhanGV = g.Sum(x => x.ThucNhanGiangVien)
                        }),
                _ => data
                    .GroupBy(x => new { x.CreatedAt.Year, x.CreatedAt.Month })
                    .ToDictionary(
                        g => $"{g.Key.Year}-{g.Key.Month:D2}",
                        g => new DoanhThuTheoThoiGianDTO
                        {
                            Nhan = $"{g.Key.Month:D2}/{g.Key.Year}",
                            TongDoanhThu = g.Sum(x => x.TongTienDonHang),
                            PhiNenTang = g.Sum(x => x.PhiNenTang),
                            ThucNhanGV = g.Sum(x => x.ThucNhanGiangVien)
                        })
            };

            var result = new List<DoanhThuTheoThoiGianDTO>();

            if (mode == "day")
            {
                for (var dt = start; dt < endExclusive; dt = dt.AddDays(1))
                {
                    var key = dt.ToString("yyyy-MM-dd");
                    result.Add(map.TryGetValue(key, out var v) ? v : new DoanhThuTheoThoiGianDTO
                    {
                        Nhan = dt.ToString("dd/MM", CultureInfo.InvariantCulture)
                    });
                }
            }
            else if (mode == "week")
            {
                // Căn con trỏ về thứ Hai của tuần ISO chứa `start`. Nếu bước 7 ngày từ một
                // ngày lệch tuần, tuần cuối cùng (tuần chứa hôm nay) sẽ bị bỏ sót khỏi biểu đồ.
                var cursor = start.AddDays(-(((int)start.DayOfWeek + 6) % 7));
                while (cursor < endExclusive)
                {
                    var year = ISOWeek.GetYear(cursor);
                    var week = ISOWeek.GetWeekOfYear(cursor);
                    var key = $"{year}-W{week:D2}";
                    result.Add(map.TryGetValue(key, out var v) ? v : new DoanhThuTheoThoiGianDTO
                    {
                        Nhan = $"T{week}/{year}"
                    });
                    cursor = cursor.AddDays(7);
                }
            }
            else if (mode == "year")
            {
                // endExclusive là mốc loại trừ nên phải lấy năm của ngày cuối cùng được tính,
                // dùng endExclusive.Year sẽ làm mất năm hiện tại khỏi biểu đồ.
                var namCuoi = endExclusive.AddDays(-1).Year;
                for (int y = start.Year; y <= namCuoi; y++)
                {
                    var key = y.ToString();
                    result.Add(map.TryGetValue(key, out var v) ? v : new DoanhThuTheoThoiGianDTO
                    {
                        Nhan = key
                    });
                }
            }
            else
            {
                var cursor = new DateTime(start.Year, start.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var endMonth = new DateTime(endExclusive.AddDays(-1).Year, endExclusive.AddDays(-1).Month, 1, 0, 0, 0, DateTimeKind.Utc);
                while (cursor <= endMonth)
                {
                    var key = $"{cursor.Year}-{cursor.Month:D2}";
                    result.Add(map.TryGetValue(key, out var v) ? v : new DoanhThuTheoThoiGianDTO
                    {
                        Nhan = $"{cursor.Month:D2}/{cursor.Year}"
                    });
                    cursor = cursor.AddMonths(1);
                }
            }

            return result;
        }
    }
}

