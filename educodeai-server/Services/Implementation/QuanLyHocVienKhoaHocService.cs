using educodeai_server.Data;
using educodeai_server.DTOs;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using educodeai_server.Workers;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services
{
    public class QuanLyHocVienKhoaHocService : IQuanLyHocVienKhoaHocService
    {
        private const int MaxBulkEmail = 30;

        private readonly EduCodeAIDbContext _context;
        private readonly LopHocEmailQueue _emailQueue;

        public QuanLyHocVienKhoaHocService(EduCodeAIDbContext context, LopHocEmailQueue emailQueue)
        {
            _context = context;
            _emailQueue = emailQueue;
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

            List<ChiTietHocVienTrongKhoaDTO> result;

            if (maKhoaHoc.HasValue && maKhoaHoc.Value > 0)
            {
                query = query.Where(dk => dk.MaKhoaHoc == maKhoaHoc.Value);
                result = await query
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

                await GanTienDoVaTagAsync(result, maKhoaHoc.Value);
            }
            else
            {
                result = await query
                    .GroupBy(dk => new { dk.NguoiDung.MaNguoiDung, dk.NguoiDung.HoTen, dk.NguoiDung.Email, dk.NguoiDung.AnhDaiDien })
                    .Select(g => new ChiTietHocVienTrongKhoaDTO
                    {
                        MaNguoiDung = g.Key.MaNguoiDung,
                        HoTen = g.Key.HoTen ?? "Chưa cập nhật",
                        Email = g.Key.Email ?? "",
                        AnhDaiDien = g.Key.AnhDaiDien,
                        NgayDangKy = g.Min(x => x.NgayDangKy),
                        TenKhoaHoc = "",
                        TrangThai = g.OrderByDescending(x => x.NgayDangKy).FirstOrDefault()!.TrangThai ?? "Đang học"
                    })
                    .OrderByDescending(x => x.NgayDangKy)
                    .ToListAsync();
            }

            return result;
        }

        private async Task GanTienDoVaTagAsync(List<ChiTietHocVienTrongKhoaDTO> hocViens, int maKhoaHoc)
        {
            if (hocViens.Count == 0) return;

            var maBaiHocIds = await _context.BaiHocs
                .Where(b => b.ChuongHoc.MaKhoaHoc == maKhoaHoc)
                .Select(b => b.MaBaiHoc)
                .ToListAsync();

            var tongSoBai = maBaiHocIds.Count;
            var hocVienIds = hocViens.Select(h => h.MaNguoiDung).ToList();
            var utcNow = DateTime.UtcNow;

            Dictionary<int, (int SoBaiDaXem, DateTime? NgayHocCuoi)> tienDoDict;

            if (maBaiHocIds.Count == 0)
            {
                tienDoDict = new Dictionary<int, (int, DateTime?)>();
            }
            else
            {
                tienDoDict = await _context.TienDoBaiHocs
                    .Where(t => maBaiHocIds.Contains(t.MaBaiHoc) && hocVienIds.Contains(t.MaNguoiDung))
                    .GroupBy(t => t.MaNguoiDung)
                    .Select(g => new
                    {
                        MaNguoiDung = g.Key,
                        SoBaiDaXem = g.Count(x => x.DaXem),
                        NgayHocCuoi = g.Max(x => (DateTime?)x.NgayCapNhat)
                    })
                    .ToDictionaryAsync(x => x.MaNguoiDung, x => (x.SoBaiDaXem, x.NgayHocCuoi));
            }

            foreach (var hv in hocViens)
            {
                tienDoDict.TryGetValue(hv.MaNguoiDung, out var td);
                var soBaiDaXem = td.SoBaiDaXem;
                var ngayHocCuoi = td.NgayHocCuoi;

                hv.SoBaiDaHoc = soBaiDaXem;
                hv.TongSoBai = tongSoBai;
                hv.PhanTramTienDo = tongSoBai == 0
                    ? 0
                    : Math.Min(100, (int)Math.Round(soBaiDaXem * 100.0 / tongSoBai));
                hv.NgayHocCuoi = ngayHocCuoi;

                var (tag, tagLabel) = HocVienTagHelper.ResolveTag(
                    hv.PhanTramTienDo, hv.NgayDangKy, ngayHocCuoi, utcNow);
                hv.Tag = tag;
                hv.TagLabel = tagLabel;
            }
        }

        public async Task<TienDoKhoaHocHocVienDTO?> LayTienDoChiTietAsync(int maGiangVien, int maKhoaHoc, int maNguoiDung)
        {
            var khoaThuocGiangVien = await _context.KhoaHocs
                .AnyAsync(k => k.MaKhoaHoc == maKhoaHoc && k.MaGiangVien == maGiangVien);
            if (!khoaThuocGiangVien)
                return null;

            // TienDoBaiHocs.ThoiGianHoc lưu theo GIÂY (client gửi currentTime của player video),
            // nên phải quy đổi sang phút trước khi trả về cho UI.
            int tongThoiGianGiay = await _context.TienDoBaiHocs
                .AsNoTracking()
                .Where(t => t.MaNguoiDung == maNguoiDung && t.BaiHoc.ChuongHoc.MaKhoaHoc == maKhoaHoc)
                .SumAsync(t => (int?)t.ThoiGianHoc) ?? 0;

            int tongThoiGianPhut = tongThoiGianGiay / 60;

            var tatCaBaiHoc = await _context.BaiHocs
                .AsNoTracking()
                .Include(b => b.ChuongHoc)
                .Where(b => b.ChuongHoc.MaKhoaHoc == maKhoaHoc)
                .OrderBy(b => b.ChuongHoc.ThuTu)
                .ThenBy(b => b.ThuTu)
                .ToListAsync();

            // Chỉ lấy bài đã xem của đúng khóa học này thay vì toàn bộ tiến độ mọi khóa.
            var baiDaHocIDs = (await _context.TienDoBaiHocs
                .AsNoTracking()
                .Where(t => t.MaNguoiDung == maNguoiDung
                         && t.DaXem
                         && t.BaiHoc.ChuongHoc.MaKhoaHoc == maKhoaHoc)
                .Select(t => t.MaBaiHoc)
                .ToListAsync())
                .ToHashSet();

            // Gom theo MaChuong, không gom theo tên: hai chương trùng tên sẽ bị nhập làm một.
            var tienDoTheoChuong = tatCaBaiHoc
                .GroupBy(b => b.ChuongHoc?.MaChuong ?? 0)
                .Select(g => new ChuongHocTienDoDTO
                {
                    MaChuong = g.Key,
                    TenChuong = g.First().ChuongHoc?.TenChuong ?? "Chương bổ sung",
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

        public async Task<GuiMailHangLoatResultDTO> GuiMailHangLoatAsync(int maGiangVien, GuiMailHangLoatDTO dto)
        {
            if (dto.MaKhoaHoc <= 0)
                return Fail("Vui lòng chọn khóa học cụ thể.");

            if (dto.DanhSachMaNguoiDung == null || dto.DanhSachMaNguoiDung.Count == 0)
                return Fail("Chưa chọn học viên nào.");

            if (dto.DanhSachMaNguoiDung.Count > MaxBulkEmail)
                return Fail($"Chỉ được gửi tối đa {MaxBulkEmail} email mỗi lần.");

            if (string.IsNullOrWhiteSpace(dto.TieuDe) || string.IsNullOrWhiteSpace(dto.NoiDungHtml))
                return Fail("Tiêu đề và nội dung email không được để trống.");

            var khoaHoc = await _context.KhoaHocs
                .FirstOrDefaultAsync(k => k.MaKhoaHoc == dto.MaKhoaHoc && k.MaGiangVien == maGiangVien);

            if (khoaHoc == null)
                return Fail("Khóa học không thuộc quyền quản lý của bạn.");

            var maHocVienHopLe = await _context.DangKyKhoaHocs
                .Where(dk => dk.MaKhoaHoc == dto.MaKhoaHoc && dto.DanhSachMaNguoiDung.Contains(dk.MaNguoiDung))
                .Select(dk => dk.MaNguoiDung)
                .Distinct()
                .ToListAsync();

            if (maHocVienHopLe.Count == 0)
                return Fail("Không có học viên hợp lệ trong danh sách đã chọn.");

            var hocViens = await LayDanhSachHocVienAsync(maGiangVien, dto.MaKhoaHoc, null);
            var mapHocVien = hocViens
                .Where(h => maHocVienHopLe.Contains(h.MaNguoiDung))
                .ToList();

            var nguoiNhan = mapHocVien
                .Where(h => !string.IsNullOrWhiteSpace(h.Email))
                .Select(h => new LopHocEmailRecipient(h.Email, h.HoTen, h.PhanTramTienDo))
                .ToList();

            if (nguoiNhan.Count == 0)
                return Fail("Các học viên đã chọn không có email hợp lệ.");

            var job = new LopHocEmailJob(
                maGiangVien,
                khoaHoc.TenKhoaHoc,
                nguoiNhan,
                dto.TieuDe.Trim(),
                dto.NoiDungHtml);

            await _emailQueue.EnqueueAsync(job);

            return new GuiMailHangLoatResultDTO
            {
                Success = true,
                Message = $"Đã xếp hàng gửi {nguoiNhan.Count} email.",
                SoLuongDaXepHang = nguoiNhan.Count
            };
        }

        private static GuiMailHangLoatResultDTO Fail(string message) =>
            new() { Success = false, Message = message };
    }
}
