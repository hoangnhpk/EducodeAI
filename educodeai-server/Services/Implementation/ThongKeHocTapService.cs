using Microsoft.EntityFrameworkCore;
using educodeai_server.Data;
using educodeai_server.Services.Interface;
using educodeai_server.DTOs.ThongKeHocTap;
using educodeai_server.Common;
using System.Globalization;
using educodeai_server.Helpers;
using System.Net;

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
                .Where(kh =>
                    kh.MaGiangVien == maGiangVien
                    && (
                        kh.TrangThai == null
                        || (
                            kh.TrangThai != "Đã xóa"
                            && kh.TrangThai != "DaXoa"
                            && kh.TrangThai != "Deleted"
                        )
                    )
                )
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

            // ThoiGianHoc lưu theo GIÂY → trả về trung bình số giây / học viên
            double tongGiayHoc = await _context.TienDoBaiHocs
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
                : tongGiayHoc / tongHocVien;

            return new ThongKeOverviewDTO
            {
                SoKhoaHocDangDay = soKhoaHocDangDay,
                TongBaiTap = tongBaiTap,
                TyLeHoanThanhTB = Math.Round(tyLeHoanThanhTB, 1),
                // Đơn vị: giây (UI format giờ/phút/giây)
                GioHocTrungBinh = Math.Round(gioHocTrungBinh)
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

        public async Task<ThuNhapTongQuanDTO> GetThuNhapTongQuanAsync(int maGiangVien)
        {
            var doanhThuQuery = _context.DoanhThuGiangViens
                .AsNoTracking()
                .Where(x => x.MaGiangVien == maGiangVien);

            var tongDoanhThu = await doanhThuQuery.SumAsync(x => (decimal?)x.TongTienDonHang) ?? 0m;
            var tongPhiNenTang = await doanhThuQuery.SumAsync(x => (decimal?)x.PhiNenTang) ?? 0m;
            var tongThucNhan = await doanhThuQuery.SumAsync(x => (decimal?)x.ThucNhanGiangVien) ?? 0m;
            var tongDonHang = await doanhThuQuery.Select(x => x.MaDonHang).Distinct().CountAsync();

            var thangNay = DateTime.UtcNow;
            var thucNhanThangNay = await doanhThuQuery
                .Where(x => x.CreatedAt.Year == thangNay.Year && x.CreatedAt.Month == thangNay.Month)
                .SumAsync(x => (decimal?)x.ThucNhanGiangVien) ?? 0m;

            return new ThuNhapTongQuanDTO
            {
                TongDoanhThu = tongDoanhThu,
                TongPhiNenTang = tongPhiNenTang,
                TongThucNhan = tongThucNhan,
                ThucNhanThangNay = thucNhanThangNay,
                TongDonHang = tongDonHang
            };
        }

        public async Task<List<ThuNhapTheoThoiGianDTO>> GetThuNhapTheoThoiGianAsync(int maGiangVien, string? nhomTheo)
        {
            string mode = (nhomTheo ?? "month").Trim().ToLowerInvariant();
            if (mode is not ("day" or "week" or "month"))
            {
                mode = "month";
            }

            var data = await _context.DoanhThuGiangViens
                .AsNoTracking()
                .Where(x => x.MaGiangVien == maGiangVien)
                .Select(x => new
                {
                    x.CreatedAt,
                    x.TongTienDonHang,
                    x.PhiNenTang,
                    x.ThucNhanGiangVien
                })
                .ToListAsync();

            var grouped = mode switch
            {
                "day" => data
                    .GroupBy(x => x.CreatedAt.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new ThuNhapTheoThoiGianDTO
                    {
                        NhanThoiGian = g.Key.ToString("dd/MM", CultureInfo.InvariantCulture),
                        TongDoanhThu = g.Sum(x => x.TongTienDonHang),
                        PhiNenTang = g.Sum(x => x.PhiNenTang),
                        ThucNhan = g.Sum(x => x.ThucNhanGiangVien)
                    })
                    .ToList(),
                "week" => data
                    .GroupBy(x => new { Year = ISOWeek.GetYear(x.CreatedAt.Date), Week = ISOWeek.GetWeekOfYear(x.CreatedAt.Date) })
                    .OrderBy(g => g.Key.Year)
                    .ThenBy(g => g.Key.Week)
                    .Select(g => new ThuNhapTheoThoiGianDTO
                    {
                        NhanThoiGian = $"T{g.Key.Week}/{g.Key.Year}",
                        TongDoanhThu = g.Sum(x => x.TongTienDonHang),
                        PhiNenTang = g.Sum(x => x.PhiNenTang),
                        ThucNhan = g.Sum(x => x.ThucNhanGiangVien)
                    })
                    .ToList(),
                _ => data
                    .GroupBy(x => new { x.CreatedAt.Year, x.CreatedAt.Month })
                    .OrderBy(g => g.Key.Year)
                    .ThenBy(g => g.Key.Month)
                    .Select(g => new ThuNhapTheoThoiGianDTO
                    {
                        NhanThoiGian = $"{g.Key.Month:00}/{g.Key.Year}",
                        TongDoanhThu = g.Sum(x => x.TongTienDonHang),
                        PhiNenTang = g.Sum(x => x.PhiNenTang),
                        ThucNhan = g.Sum(x => x.ThucNhanGiangVien)
                    })
                    .ToList()
            };

            return grouped;
        }

        public async Task<List<ThuNhapTheoKhoaHocDTO>> GetThuNhapTheoKhoaHocAsync(int maGiangVien, int top)
        {
            int topValue = Math.Clamp(top, 1, 20);

            var data = await _context.DoanhThuGiangViens
                .AsNoTracking()
                .Where(x => x.MaGiangVien == maGiangVien)
                .Select(x => new
                {
                    x.MaDonHang,
                    x.TongTienDonHang,
                    x.PhiNenTang,
                    x.ThucNhanGiangVien,
                    MaKhoaHoc = _context.ChiTietDonHangs
                        .Where(ct => ct.MaDonHang == x.MaDonHang)
                        .Join(
                            _context.KhoaHocs,
                            ct => ct.MaKhoaHoc,
                            kh => kh.MaKhoaHoc,
                            (ct, kh) => new { ct.MaKhoaHoc, kh.MaGiangVien })
                        .Where(z => z.MaGiangVien == maGiangVien)
                        .Select(z => (int?)z.MaKhoaHoc)
                        .FirstOrDefault(),
                    TenKhoaHoc = _context.ChiTietDonHangs
                        .Where(ct => ct.MaDonHang == x.MaDonHang)
                        .Join(
                            _context.KhoaHocs,
                            ct => ct.MaKhoaHoc,
                            kh => kh.MaKhoaHoc,
                            (ct, kh) => new { kh.TenKhoaHoc, kh.MaGiangVien })
                        .Where(z => z.MaGiangVien == maGiangVien)
                        .Select(z => z.TenKhoaHoc)
                        .FirstOrDefault()
                })
                .Where(x => x.MaKhoaHoc != null)
                .ToListAsync();

            return data
                .GroupBy(x => new { MaKhoaHoc = x.MaKhoaHoc!.Value, TenKhoaHoc = x.TenKhoaHoc ?? "Khóa học không xác định" })
                .Select(g => new ThuNhapTheoKhoaHocDTO
                {
                    MaKhoaHoc = g.Key.MaKhoaHoc,
                    TenKhoaHoc = g.Key.TenKhoaHoc,
                    SoDonHang = g.Select(x => x.MaDonHang).Distinct().Count(),
                    TongDoanhThu = g.Sum(x => x.TongTienDonHang),
                    PhiNenTang = g.Sum(x => x.PhiNenTang),
                    ThucNhan = g.Sum(x => x.ThucNhanGiangVien)
                })
                .OrderByDescending(x => x.ThucNhan)
                .Take(topValue)
                .ToList();
        }

        public async Task GuiCanhBaoHocVienNguyCoBoHocAsync(int maGiangVien, int maHocVien)
        {
            var duLieuHocVien = await (
                from dk in _context.DangKyKhoaHocs
                join kh in _context.KhoaHocs on dk.MaKhoaHoc equals kh.MaKhoaHoc
                join nd in _context.NguoiDungs on dk.MaNguoiDung equals nd.MaNguoiDung
                where kh.MaGiangVien == maGiangVien && dk.MaNguoiDung == maHocVien
                select new
                {
                    nd.HoTen,
                    nd.Email,
                    dk.TienDo,
                    kh.TenKhoaHoc
                }
            ).ToListAsync();

            if (duLieuHocVien.Count == 0)
            {
                throw new InvalidOperationException("Không tìm thấy học viên trong các khóa học của giảng viên.");
            }

            var email = duLieuHocVien.First().Email?.Trim();
            if (string.IsNullOrWhiteSpace(email))
            {
                throw new InvalidOperationException("Học viên chưa có email để gửi cảnh báo.");
            }

            var hoTen = duLieuHocVien.First().HoTen?.Trim();
            var tenHocVien = string.IsNullOrWhiteSpace(hoTen) ? "bạn" : hoTen;
            var tienDoTrungBinh = Math.Round(duLieuHocVien.Average(x => x.TienDo), 1);

            var dsKhoaHoc = duLieuHocVien
                .Select(x => x.TenKhoaHoc)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct()
                .Take(3)
                .ToList();

            var khoaHocHienThi = dsKhoaHoc.Count == 0
                ? "các khóa học"
                : string.Join(", ", dsKhoaHoc.Select(WebUtility.HtmlEncode));

            var subject = "EduCodeAI - Nhắc nhở tiến độ học tập";
            var body = $@"
<div style='font-family: Arial, sans-serif; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;'>
  <h2 style='color: #dc2626; margin-top: 0;'>Nhắc nhở học tập</h2>
  <p>Chào <b>{WebUtility.HtmlEncode(tenHocVien)}</b>,</p>
  <p>Giảng viên nhận thấy tiến độ học tập của bạn đang cần được cải thiện.</p>
  <ul>
    <li>Tiến độ trung bình hiện tại: <b>{tienDoTrungBinh}%</b></li>
    <li>Khóa học liên quan: <b>{khoaHocHienThi}</b></li>
  </ul>
  <p>Hãy dành thêm thời gian để tiếp tục học và hoàn thành lộ trình của bạn nhé.</p>
  <p style='font-size:12px;color:#6b7280;margin-top:16px;'>Email này được gửi tự động từ hệ thống EduCodeAI.</p>
</div>";

            var daGui = await EmailHelper.SendEmailAsync(email, subject, body);
            if (!daGui)
            {
                throw new InvalidOperationException("Gửi email thất bại. Vui lòng thử lại sau.");
            }
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
                from bn in _context.KetQuaLamBais
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

            // ===== 3. Tổng thời gian học (giây) =====
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
                    TongGiay = g.Sum(x => (double?)x.ThoiGianHoc) ?? 0
                }
            ).ToDictionaryAsync(x => x.MaNguoiDung, x => x.TongGiay);

            // ===== 4. Map ra DTO =====
            var data = hocVienPage.Select(x => new HocVienThongKeDTO
            {
                MaNguoiDung = x.MaNguoiDung,
                HoTen = x.HoTen,
                Email = x.Email,
                TienDo = Math.Round(x.TienDoTB, 1),
                SoBaiDaNop = baiDaNopDict.GetValueOrDefault(x.MaNguoiDung, 0),
                // Đơn vị: giây (UI format giờ/phút/giây)
                GioHoc = gioHocDict.GetValueOrDefault(x.MaNguoiDung, 0),
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
