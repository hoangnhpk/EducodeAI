using System.Net;
using educodeai_server.Data;
using educodeai_server.DTOs.QuaTang;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class QuaTangKhoaHocService : IQuaTangKhoaHocService
    {
        private readonly EduCodeAIDbContext _dbContext;
        private readonly ILogger<QuaTangKhoaHocService> _logger;

        public QuaTangKhoaHocService(EduCodeAIDbContext dbContext, ILogger<QuaTangKhoaHocService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<KetQuaTangKhoaHocDTO> GiangVienTangHocVienAsync(int maGiangVien, TangKhoaHocDTO yeuCau)
        {
            var khoaHoc = await _dbContext.KhoaHocs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaKhoaHoc == yeuCau.MaKhoaHoc && x.MaGiangVien == maGiangVien);

            if (khoaHoc == null)
            {
                throw new ApplicationException("Bạn chỉ có thể tặng các khóa học do bạn quản lý.");
            }

            await KiemTraGioiHanTangTheoNgayAsync(maGiangVien, yeuCau.MaKhoaHoc);
            return await XuLyTangKhoaHocAsync(maGiangVien, yeuCau, "GIANGVIEN");
        }

        public async Task<KetQuaTangKhoaHocDTO> AdminTangHocVienAsync(int maQuanTriVien, TangKhoaHocDTO yeuCau)
        {
            var khoaHocTonTai = await _dbContext.KhoaHocs
                .AsNoTracking()
                .AnyAsync(x => x.MaKhoaHoc == yeuCau.MaKhoaHoc);

            if (!khoaHocTonTai)
            {
                throw new ApplicationException("Không tìm thấy khóa học để tặng.");
            }

            return await XuLyTangKhoaHocAsync(maQuanTriVien, yeuCau, "ADMIN");
        }

        public async Task<IReadOnlyList<QuaTangKhoaHocItemDTO>> LayLichSuQuaTangCuaGiangVienAsync(int maGiangVien, int? maKhoaHoc, string? tuKhoa)
        {
            var query = _dbContext.QuaTangKhoaHocs
                .AsNoTracking()
                .Where(x => x.MaNguoiTang == maGiangVien && x.LoaiNguoiTang == "GIANGVIEN")
                .Include(x => x.KhoaHoc)
                .Include(x => x.NguoiTang)
                .Include(x => x.NguoiNhan)
                .AsQueryable();

            if (maKhoaHoc.HasValue && maKhoaHoc.Value > 0)
            {
                query = query.Where(x => x.MaKhoaHoc == maKhoaHoc.Value);
            }

            var data = await query
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            var mapped = data.Select(MapItem).ToList();
            return LocTheoTuKhoa(mapped, tuKhoa);
        }

        public async Task<IReadOnlyList<QuaTangKhoaHocItemDTO>> LayLichSuQuaTangChoAdminAsync(string? tuKhoa)
        {
            var data = await _dbContext.QuaTangKhoaHocs
                .AsNoTracking()
                .Include(x => x.KhoaHoc)
                .Include(x => x.NguoiTang)
                .Include(x => x.NguoiNhan)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            var mapped = data.Select(MapItem).ToList();
            return LocTheoTuKhoa(mapped, tuKhoa);
        }

        public async Task<IReadOnlyList<KhoaHocTangOptionDTO>> LayKhoaHocCoTheTangChoHocVienAsync(int maNguoiNhan)
        {
            var daDangKyIds = await _dbContext.DangKyKhoaHocs
                .AsNoTracking()
                .Where(x => x.MaNguoiDung == maNguoiNhan)
                .Select(x => x.MaKhoaHoc)
                .Distinct()
                .ToListAsync();

            return await _dbContext.KhoaHocs
                .AsNoTracking()
                .Where(x =>
                    (x.TrangThai == null || x.TrangThai != "Đã xóa")
                    && !daDangKyIds.Contains(x.MaKhoaHoc))
                .OrderBy(x => x.TenKhoaHoc)
                .Select(x => new KhoaHocTangOptionDTO
                {
                    MaKhoaHoc = x.MaKhoaHoc,
                    TenKhoaHoc = x.TenKhoaHoc,
                    GiaKhoaHoc = x.GiaKhoaHoc,
                    DonViTienTe = x.DonViTienTe
                })
                .ToListAsync();
        }

        public async Task<IReadOnlyList<KhoaHocTangOptionDTO>> LayKhoaHocCuaGiangVienDeTangAsync(int maGiangVien)
        {
            return await _dbContext.KhoaHocs
                .AsNoTracking()
                .Where(x => x.MaGiangVien == maGiangVien && (x.TrangThai == null || x.TrangThai != "Đã xóa"))
                .OrderBy(x => x.TenKhoaHoc)
                .Select(x => new KhoaHocTangOptionDTO
                {
                    MaKhoaHoc = x.MaKhoaHoc,
                    TenKhoaHoc = x.TenKhoaHoc,
                    GiaKhoaHoc = x.GiaKhoaHoc,
                    DonViTienTe = x.DonViTienTe
                })
                .ToListAsync();
        }

        public async Task<IReadOnlyList<HocVienTangOptionDTO>> LayHocVienCoTheNhanQuaAsync(int maGiangVien, int maKhoaHoc, string? tuKhoa)
        {
            bool khoaHocHopLe = await _dbContext.KhoaHocs
                .AsNoTracking()
                .AnyAsync(x => x.MaKhoaHoc == maKhoaHoc && x.MaGiangVien == maGiangVien);

            if (!khoaHocHopLe)
            {
                throw new ApplicationException("Khóa học không thuộc quyền quản lý của giảng viên.");
            }

            var daDangKyIds = await _dbContext.DangKyKhoaHocs
                .AsNoTracking()
                .Where(x => x.MaKhoaHoc == maKhoaHoc)
                .Select(x => x.MaNguoiDung)
                .Distinct()
                .ToListAsync();

            var query = _dbContext.NguoiDungs
                .AsNoTracking()
                .Where(x => x.VaiTro == 2 && !daDangKyIds.Contains(x.MaNguoiDung));

            if (!string.IsNullOrWhiteSpace(tuKhoa))
            {
                string key = tuKhoa.Trim().ToLowerInvariant();
                query = query.Where(x =>
                    x.MaNguoiDung.ToString().Contains(key) ||
                    (x.HoTen != null && x.HoTen.ToLower().Contains(key)) ||
                    (x.Email != null && x.Email.ToLower().Contains(key)));
            }

            return await query
                .OrderBy(x => x.HoTen)
                .Take(100)
                .Select(x => new HocVienTangOptionDTO
                {
                    MaNguoiDung = x.MaNguoiDung,
                    HoTen = string.IsNullOrWhiteSpace(x.HoTen) ? x.TaiKhoan : x.HoTen!,
                    Email = x.Email
                })
                .ToListAsync();
        }

        private async Task<KetQuaTangKhoaHocDTO> XuLyTangKhoaHocAsync(int maNguoiTang, TangKhoaHocDTO yeuCau, string loaiNguoiTang)
        {
            if (yeuCau.MaNguoiNhan == maNguoiTang)
            {
                throw new ApplicationException("Không thể tự tặng khóa học cho chính mình.");
            }

            var nguoiNhan = await _dbContext.NguoiDungs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaNguoiDung == yeuCau.MaNguoiNhan);
            if (nguoiNhan == null || nguoiNhan.VaiTro != 2)
            {
                throw new ApplicationException("Người nhận không hợp lệ hoặc không phải học viên.");
            }

            var nguoiTang = await _dbContext.NguoiDungs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiTang);
            if (nguoiTang == null)
            {
                throw new ApplicationException("Không tìm thấy người tặng.");
            }

            var khoaHoc = await _dbContext.KhoaHocs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaKhoaHoc == yeuCau.MaKhoaHoc);
            if (khoaHoc == null)
            {
                throw new ApplicationException("Không tìm thấy khóa học để tặng.");
            }

            bool daSoHuu = await _dbContext.DangKyKhoaHocs
                .AnyAsync(x => x.MaNguoiDung == yeuCau.MaNguoiNhan && x.MaKhoaHoc == yeuCau.MaKhoaHoc);
            if (daSoHuu)
            {
                throw new ApplicationException("Học viên đã sở hữu khóa học này, không thể tặng.");
            }

            var chienLuoc = _dbContext.Database.CreateExecutionStrategy();
            QuaTangKhoaHocModel quaTang = null!;
            await chienLuoc.ExecuteAsync(async () =>
            {
                await using var giaoDich = await _dbContext.Database.BeginTransactionAsync();
                try
                {
                    // Re-check trong transaction để tránh race condition tặng trùng.
                    bool daSoHuuTrongTransaction = await _dbContext.DangKyKhoaHocs
                        .AnyAsync(x => x.MaNguoiDung == yeuCau.MaNguoiNhan && x.MaKhoaHoc == yeuCau.MaKhoaHoc);
                    if (daSoHuuTrongTransaction)
                    {
                        throw new ApplicationException("Học viên đã sở hữu khóa học này, không thể tặng.");
                    }

                    quaTang = new QuaTangKhoaHocModel
                    {
                        MaKhoaHoc = yeuCau.MaKhoaHoc,
                        MaNguoiNhan = yeuCau.MaNguoiNhan,
                        MaNguoiTang = maNguoiTang,
                        LoaiNguoiTang = loaiNguoiTang,
                        TrangThai = "COMPLETED",
                        LoiNhan = string.IsNullOrWhiteSpace(yeuCau.LoiNhan) ? null : yeuCau.LoiNhan.Trim(),
                        CreatedAt = DateTime.UtcNow,
                        CompletedAt = DateTime.UtcNow
                    };

                    _dbContext.QuaTangKhoaHocs.Add(quaTang);
                    _dbContext.DangKyKhoaHocs.Add(new DangKyKhoaHocModel
                    {
                        MaNguoiDung = yeuCau.MaNguoiNhan,
                        MaKhoaHoc = yeuCau.MaKhoaHoc,
                        NgayDangKy = DateTime.UtcNow,
                        TrangThai = "DangHoc",
                        TienDo = 0
                    });

                    await _dbContext.SaveChangesAsync();
                    await giaoDich.CommitAsync();
                }
                catch
                {
                    await giaoDich.RollbackAsync();
                    throw;
                }
            });

            bool daGuiNguoiNhan = await GuiEmailChoNguoiNhanAsync(nguoiNhan, nguoiTang, khoaHoc, quaTang.LoiNhan);
            bool daGuiNguoiTang = await GuiEmailChoNguoiTangAsync(nguoiTang, nguoiNhan, khoaHoc, quaTang.LoiNhan, loaiNguoiTang);

            return new KetQuaTangKhoaHocDTO
            {
                MaQuaTang = quaTang.MaQuaTang,
                MaKhoaHoc = yeuCau.MaKhoaHoc,
                MaNguoiNhan = yeuCau.MaNguoiNhan,
                MaNguoiTang = maNguoiTang,
                LoaiNguoiTang = loaiNguoiTang,
                TrangThai = quaTang.TrangThai,
                DaGuiEmailNguoiNhan = daGuiNguoiNhan,
                DaGuiEmailNguoiTang = daGuiNguoiTang,
                ThongBao = "Tặng khóa học thành công.",
                CreatedAt = quaTang.CreatedAt
            };
        }

        private async Task KiemTraGioiHanTangTheoNgayAsync(int maGiangVien, int maKhoaHoc)
        {
            var homNayUtc = DateTime.UtcNow.Date;
            var ngayMaiUtc = homNayUtc.AddDays(1);

            int soLuongDaTang = await _dbContext.QuaTangKhoaHocs
                .AsNoTracking()
                .Where(x =>
                    x.MaNguoiTang == maGiangVien
                    && x.MaKhoaHoc == maKhoaHoc
                    && x.LoaiNguoiTang == "GIANGVIEN"
                    && x.TrangThai == "COMPLETED"
                    && x.CreatedAt >= homNayUtc
                    && x.CreatedAt < ngayMaiUtc)
                .CountAsync();

            if (soLuongDaTang >= 10)
            {
                throw new ApplicationException("Bạn đã đạt giới hạn tặng 10 lượt cho khóa học này trong hôm nay.");
            }
        }

        private static QuaTangKhoaHocItemDTO MapItem(QuaTangKhoaHocModel x)
        {
            return new QuaTangKhoaHocItemDTO
            {
                MaQuaTang = x.MaQuaTang,
                MaKhoaHoc = x.MaKhoaHoc,
                TenKhoaHoc = x.KhoaHoc?.TenKhoaHoc ?? $"Khóa học #{x.MaKhoaHoc}",
                MaNguoiTang = x.MaNguoiTang,
                TenNguoiTang = string.IsNullOrWhiteSpace(x.NguoiTang?.HoTen) ? (x.NguoiTang?.TaiKhoan ?? $"User #{x.MaNguoiTang}") : x.NguoiTang.HoTen!,
                MaNguoiNhan = x.MaNguoiNhan,
                TenNguoiNhan = string.IsNullOrWhiteSpace(x.NguoiNhan?.HoTen) ? (x.NguoiNhan?.TaiKhoan ?? $"User #{x.MaNguoiNhan}") : x.NguoiNhan.HoTen!,
                EmailNguoiNhan = x.NguoiNhan?.Email,
                LoaiNguoiTang = x.LoaiNguoiTang,
                TrangThai = x.TrangThai,
                LoiNhan = x.LoiNhan,
                CreatedAt = x.CreatedAt
            };
        }

        private static IReadOnlyList<QuaTangKhoaHocItemDTO> LocTheoTuKhoa(List<QuaTangKhoaHocItemDTO> data, string? tuKhoa)
        {
            if (string.IsNullOrWhiteSpace(tuKhoa))
            {
                return data;
            }

            string key = tuKhoa.Trim().ToLowerInvariant();
            return data.Where(x =>
                    x.MaQuaTang.ToString().Contains(key, StringComparison.OrdinalIgnoreCase) ||
                    x.MaKhoaHoc.ToString().Contains(key, StringComparison.OrdinalIgnoreCase) ||
                    x.MaNguoiNhan.ToString().Contains(key, StringComparison.OrdinalIgnoreCase) ||
                    (x.TenKhoaHoc?.ToLowerInvariant().Contains(key) ?? false) ||
                    (x.TenNguoiNhan?.ToLowerInvariant().Contains(key) ?? false) ||
                    (x.EmailNguoiNhan?.ToLowerInvariant().Contains(key) ?? false))
                .ToList();
        }

        private async Task<bool> GuiEmailChoNguoiNhanAsync(
            NguoiDungModel nguoiNhan,
            NguoiDungModel nguoiTang,
            KhoaHocModel khoaHoc,
            string? loiNhan)
        {
            string? emailNguoiNhan = nguoiNhan.Email?.Trim();
            if (string.IsNullOrWhiteSpace(emailNguoiNhan))
            {
                return false;
            }

            string tenNguoiNhan = LayTenHienThi(nguoiNhan);
            string tenNguoiTang = LayTenHienThi(nguoiTang);

            string subject = $"EduCodeAI - Bạn nhận được quà tặng khóa học \"{khoaHoc.TenKhoaHoc}\"";
            string body = $@"
<div style='font-family: Arial, sans-serif; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;'>
  <h2 style='color: #16a34a; margin-top: 0;'>Bạn nhận được khóa học quà tặng</h2>
  <p>Chào <b>{WebUtility.HtmlEncode(tenNguoiNhan)}</b>,</p>
  <p>Bạn vừa được tặng khóa học <b>{WebUtility.HtmlEncode(khoaHoc.TenKhoaHoc)}</b> từ <b>{WebUtility.HtmlEncode(tenNguoiTang)}</b>.</p>
  {(string.IsNullOrWhiteSpace(loiNhan) ? "" : $"<p>Lời nhắn: <i>{WebUtility.HtmlEncode(loiNhan)}</i></p>")}
  <p>Bạn có thể vào mục học của tôi để bắt đầu ngay.</p>
  <p style='font-size:12px;color:#6b7280;margin-top:16px;'>Email này được gửi tự động từ EduCodeAI.</p>
</div>";

            try
            {
                return await EmailHelper.SendEmailAsync(emailNguoiNhan, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gửi email người nhận thất bại. MaNguoiNhan={MaNguoiNhan}", nguoiNhan.MaNguoiDung);
                return false;
            }
        }

        private async Task<bool> GuiEmailChoNguoiTangAsync(
            NguoiDungModel nguoiTang,
            NguoiDungModel nguoiNhan,
            KhoaHocModel khoaHoc,
            string? loiNhan,
            string loaiNguoiTang)
        {
            string? emailNguoiTang = nguoiTang.Email?.Trim();
            if (string.IsNullOrWhiteSpace(emailNguoiTang))
            {
                return false;
            }

            string tenNguoiTang = LayTenHienThi(nguoiTang);
            string tenNguoiNhan = LayTenHienThi(nguoiNhan);
            string vaiTroNguoiTang = loaiNguoiTang == "ADMIN" ? "Quản trị viên" : "Giảng viên";

            string subject = $"EduCodeAI - Xác nhận đã tặng khóa học \"{khoaHoc.TenKhoaHoc}\"";
            string body = $@"
<div style='font-family: Arial, sans-serif; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;'>
  <h2 style='color: #2563eb; margin-top: 0;'>Xác nhận tặng khóa học thành công</h2>
  <p>Chào <b>{WebUtility.HtmlEncode(tenNguoiTang)}</b>,</p>
  <p>{WebUtility.HtmlEncode(vaiTroNguoiTang)} đã tặng thành công khóa học <b>{WebUtility.HtmlEncode(khoaHoc.TenKhoaHoc)}</b> cho học viên <b>{WebUtility.HtmlEncode(tenNguoiNhan)}</b>.</p>
  {(string.IsNullOrWhiteSpace(loiNhan) ? "" : $"<p>Lời nhắn đã gửi: <i>{WebUtility.HtmlEncode(loiNhan)}</i></p>")}
  <p style='font-size:12px;color:#6b7280;margin-top:16px;'>Email này được gửi tự động từ EduCodeAI.</p>
</div>";

            try
            {
                return await EmailHelper.SendEmailAsync(emailNguoiTang, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gửi email người tặng thất bại. MaNguoiTang={MaNguoiTang}", nguoiTang.MaNguoiDung);
                return false;
            }
        }

        private static string LayTenHienThi(NguoiDungModel nguoiDung)
        {
            if (!string.IsNullOrWhiteSpace(nguoiDung.HoTen))
            {
                return nguoiDung.HoTen.Trim();
            }

            return nguoiDung.TaiKhoan;
        }
    }
}
