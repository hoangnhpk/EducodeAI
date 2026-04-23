using educodeai_server.Data;
using educodeai_server.DTOs.ThanhToan;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace educodeai_server.Services.Implementation
{
    public class ThanhToanKhoaHocService : IThanhToanKhoaHocService
    {
        private const string CongThanhToanHoTro = "SEPAY_SUPPORT";
        private const string LoaiHoTroMuaKhoaHoc = "COURSE_PURCHASE";
        private const string TrangThaiHoTroChoXuLy = "SUPPORT_PENDING";
        private const string TrangThaiHoTroChapThuan = "SUPPORT_APPROVED";
        private const string TrangThaiHoTroTuChoi = "SUPPORT_REJECTED";

        private readonly EduCodeAIDbContext _dbContext;
        private readonly IConfiguration _cauHinh;
        private readonly IThanhToanEmailService _thanhToanEmailService;
        private readonly ILogger<ThanhToanKhoaHocService> _logger;

        public ThanhToanKhoaHocService(
            EduCodeAIDbContext dbContext,
            IConfiguration cauHinh,
            IThanhToanEmailService thanhToanEmailService,
            ILogger<ThanhToanKhoaHocService> logger)
        {
            _dbContext = dbContext;
            _cauHinh = cauHinh;
            _thanhToanEmailService = thanhToanEmailService;
            _logger = logger;
        }

        public async Task<ThongTinMuaKhoaHocDTO?> LayThongTinMuaKhoaHocAsync(int maKhoaHoc, int maNguoiDung)
        {
            var khoaHoc = await _dbContext.KhoaHocs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaKhoaHoc == maKhoaHoc && x.TrangThai == "Hoạt động");

            if (khoaHoc == null)
            {
                return null;
            }

            var daMua = maNguoiDung > 0 && await _dbContext.DangKyKhoaHocs
                .AnyAsync(x => x.MaKhoaHoc == maKhoaHoc && x.MaNguoiDung == maNguoiDung);

            return new ThongTinMuaKhoaHocDTO
            {
                MaKhoaHoc = khoaHoc.MaKhoaHoc,
                TenKhoaHoc = khoaHoc.TenKhoaHoc,
                MoTa = khoaHoc.MoTa,
                HinhAnh = khoaHoc.HinhAnh,
                GiaKhoaHoc = khoaHoc.GiaKhoaHoc,
                DonViTienTe = khoaHoc.DonViTienTe,
                DaMua = daMua,
                ChoPhepMua = khoaHoc.ChoPhepMua
            };
        }

        public async Task<KetQuaMuaKhoaHocDTO> MuaKhoaHocAsync(YeuCauMuaKhoaHocDTO yeuCau, int maNguoiDung)
        {
            var khoaHoc = await _dbContext.KhoaHocs
                .FirstOrDefaultAsync(x => x.MaKhoaHoc == yeuCau.MaKhoaHoc && x.TrangThai == "Hoạt động");

            if (khoaHoc == null)
            {
                return new KetQuaMuaKhoaHocDTO
                {
                    ThanhCong = false,
                    ThongBao = "Khóa học không tồn tại hoặc đã ngừng hoạt động.",
                    MaKhoaHoc = yeuCau.MaKhoaHoc,
                    DaMua = false
                };
            }

            if (!khoaHoc.ChoPhepMua)
            {
                return new KetQuaMuaKhoaHocDTO
                {
                    ThanhCong = false,
                    ThongBao = "Khóa học hiện chưa mở bán.",
                    MaKhoaHoc = yeuCau.MaKhoaHoc,
                    DaMua = false
                };
            }

            var daMua = await _dbContext.DangKyKhoaHocs
                .AnyAsync(x => x.MaKhoaHoc == yeuCau.MaKhoaHoc && x.MaNguoiDung == maNguoiDung);

            if (daMua)
            {
                return new KetQuaMuaKhoaHocDTO
                {
                    ThanhCong = true,
                    ThongBao = "Bạn đã mua khóa học này rồi.",
                    MaKhoaHoc = yeuCau.MaKhoaHoc,
                    DaMua = true
                };
            }

            var chienLuoc = _dbContext.Database.CreateExecutionStrategy();
            return await chienLuoc.ExecuteAsync(async () =>
            {
                await using var giaoDich = await _dbContext.Database.BeginTransactionAsync();

                try
                {
                    var thoiGianHienTai = DateTime.UtcNow;
                    var tongTien = khoaHoc.GiaKhoaHoc;
                    var soTienNenTang = Math.Round(tongTien * 0.2m, 2);
                    var soTienGiangVienNhan = tongTien - soTienNenTang;

                    var donHang = new DonHangKhoaHocModel
                    {
                        MaNguoiDung = maNguoiDung,
                        TongTien = tongTien,
                        LoaiTien = khoaHoc.DonViTienTe,
                        TrangThaiDonHang = "PAID",
                        IdempotencyKey = $"mua-{maNguoiDung}-{khoaHoc.MaKhoaHoc}-{Guid.NewGuid():N}",
                        CreatedAt = thoiGianHienTai,
                        UpdatedAt = thoiGianHienTai,
                        ExpiredAt = thoiGianHienTai.AddMinutes(30)
                    };

                    _dbContext.DonHangKhoaHocs.Add(donHang);
                    await _dbContext.SaveChangesAsync();

                    _dbContext.ChiTietDonHangs.Add(new ChiTietDonHangModel
                    {
                        MaDonHang = donHang.MaDonHang,
                        MaKhoaHoc = khoaHoc.MaKhoaHoc,
                        DonGia = tongTien,
                        GiamGia = 0,
                        ThanhTien = tongTien
                    });

                    _dbContext.GiaoDichThanhToans.Add(new GiaoDichThanhToanModel
                    {
                        MaDonHang = donHang.MaDonHang,
                        CongThanhToan = "MOCK",
                        MaThamChieuNgoai = $"GD-{donHang.MaDonHang}-{Guid.NewGuid():N}".ToUpperInvariant(),
                        SoTien = tongTien,
                        TrangThai = "SUCCESS",
                        RawWebhook = "{\"mo_ta\":\"thanh_toan_noi_bo\"}",
                        PaidAt = thoiGianHienTai,
                        CreatedAt = thoiGianHienTai,
                        UpdatedAt = thoiGianHienTai
                    });

                    _dbContext.DoanhThuGiangViens.Add(new DoanhThuGiangVienModel
                    {
                        MaGiangVien = khoaHoc.MaGiangVien,
                        MaDonHang = donHang.MaDonHang,
                        TongTienDonHang = tongTien,
                        PhiNenTang = soTienNenTang,
                        ThucNhanGiangVien = soTienGiangVienNhan,
                        TrangThaiDoiSoat = "PENDING",
                        CreatedAt = thoiGianHienTai
                    });

                    _dbContext.DangKyKhoaHocs.Add(new DangKyKhoaHocModel
                    {
                        MaNguoiDung = maNguoiDung,
                        MaKhoaHoc = khoaHoc.MaKhoaHoc,
                        NgayDangKy = thoiGianHienTai,
                        TrangThai = "DangHoc",
                        TienDo = 0
                    });

                    await _dbContext.SaveChangesAsync();
                    await giaoDich.CommitAsync();

                    return new KetQuaMuaKhoaHocDTO
                    {
                        ThanhCong = true,
                        ThongBao = "Mua khóa học thành công.",
                        MaDonHang = donHang.MaDonHang,
                        MaKhoaHoc = khoaHoc.MaKhoaHoc,
                        DaMua = true
                    };
                }
                catch
                {
                    await giaoDich.RollbackAsync();
                    throw;
                }
            });
        }

        public async Task<ThongTinMaQRThanhToanDTO> TaoMaQrThanhToanAsync(YeuCauTaoMaQRDTO yeuCau, int maNguoiDung)
        {
            var khoaHoc = await _dbContext.KhoaHocs
                .FirstOrDefaultAsync(x => x.MaKhoaHoc == yeuCau.MaKhoaHoc && x.TrangThai == "Hoạt động");

            if (khoaHoc == null)
            {
                throw new ApplicationException("Khóa học không tồn tại hoặc đã ngừng hoạt động.");
            }

            if (!khoaHoc.ChoPhepMua)
            {
                throw new ApplicationException("Khóa học hiện chưa mở bán.");
            }

            var daMua = await _dbContext.DangKyKhoaHocs
                .AnyAsync(x => x.MaKhoaHoc == yeuCau.MaKhoaHoc && x.MaNguoiDung == maNguoiDung);

            if (daMua)
            {
                throw new ApplicationException("Bạn đã sở hữu khóa học này.");
            }

            var thoiGianHienTai = DateTime.UtcNow;

            var donHangCho = await _dbContext.DonHangKhoaHocs
                .Include(x => x.ChiTietDonHangs)
                .Where(x => x.MaNguoiDung == maNguoiDung
                            && x.TrangThaiDonHang == "PENDING"
                            && x.ExpiredAt != null
                            && x.ExpiredAt > thoiGianHienTai
                            && x.ChiTietDonHangs.Any(ct => ct.MaKhoaHoc == yeuCau.MaKhoaHoc))
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();

            DonHangKhoaHocModel? donHang = donHangCho;
            if (donHangCho != null)
            {
                donHang = donHangCho;
            }
            else
            {
                var chienLuoc = _dbContext.Database.CreateExecutionStrategy();
                await chienLuoc.ExecuteAsync(async () =>
                {
                    await using var giaoDich = await _dbContext.Database.BeginTransactionAsync();
                    try
                    {
                        donHang = new DonHangKhoaHocModel
                        {
                            MaNguoiDung = maNguoiDung,
                            TongTien = khoaHoc.GiaKhoaHoc,
                            LoaiTien = khoaHoc.DonViTienTe,
                            TrangThaiDonHang = "PENDING",
                            IdempotencyKey = $"qr-{maNguoiDung}-{khoaHoc.MaKhoaHoc}-{Guid.NewGuid():N}",
                            CreatedAt = thoiGianHienTai,
                            UpdatedAt = thoiGianHienTai,
                            ExpiredAt = thoiGianHienTai.AddMinutes(30)
                        };

                        _dbContext.DonHangKhoaHocs.Add(donHang);
                        await _dbContext.SaveChangesAsync();

                        _dbContext.ChiTietDonHangs.Add(new ChiTietDonHangModel
                        {
                            MaDonHang = donHang.MaDonHang,
                            MaKhoaHoc = khoaHoc.MaKhoaHoc,
                            DonGia = khoaHoc.GiaKhoaHoc,
                            GiamGia = 0,
                            ThanhTien = khoaHoc.GiaKhoaHoc
                        });

                        _dbContext.GiaoDichThanhToans.Add(new GiaoDichThanhToanModel
                        {
                            MaDonHang = donHang.MaDonHang,
                            CongThanhToan = "SEPAY",
                            MaThamChieuNgoai = $"GD-EDU-{donHang.MaDonHang}-{Guid.NewGuid():N}".ToUpperInvariant(),
                            SoTien = khoaHoc.GiaKhoaHoc,
                            TrangThai = "INITIATED",
                            RawWebhook = null,
                            PaidAt = null,
                            CreatedAt = thoiGianHienTai,
                            UpdatedAt = thoiGianHienTai
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
            }

            if (donHang == null)
            {
                throw new ApplicationException("Không thể khởi tạo đơn hàng thanh toán.");
            }

            string noiDungChuyenKhoan = TaoNoiDungChuyenKhoan(donHang.MaDonHang);
            string duongDanQr = TaoDuongDanAnhQr(donHang.TongTien, noiDungChuyenKhoan);

            return new ThongTinMaQRThanhToanDTO
            {
                MaDonHang = donHang.MaDonHang,
                MaKhoaHoc = khoaHoc.MaKhoaHoc,
                SoTienCanThanhToan = donHang.TongTien,
                DonViTienTe = donHang.LoaiTien,
                NoiDungChuyenKhoan = noiDungChuyenKhoan,
                DuongDanAnhQr = duongDanQr,
                HetHanLuc = donHang.ExpiredAt
            };
        }

        public async Task<TrangThaiThanhToanDTO> KiemTraTrangThaiThanhToanAsync(int maDonHang, int maNguoiDung)
        {
            var donHang = await _dbContext.DonHangKhoaHocs
                .Include(x => x.ChiTietDonHangs)
                .FirstOrDefaultAsync(x => x.MaDonHang == maDonHang && x.MaNguoiDung == maNguoiDung);

            if (donHang == null)
            {
                throw new ApplicationException("Không tìm thấy đơn hàng thanh toán.");
            }

            var danhSachMaKhoaHoc = donHang.ChiTietDonHangs.Select(x => x.MaKhoaHoc).Distinct().ToList();
            bool daMoKhoa = await _dbContext.DangKyKhoaHocs
                .AnyAsync(x => x.MaNguoiDung == maNguoiDung && danhSachMaKhoaHoc.Contains(x.MaKhoaHoc));

            return new TrangThaiThanhToanDTO
            {
                MaDonHang = donHang.MaDonHang,
                TrangThaiDonHang = donHang.TrangThaiDonHang,
                DaMoKhoaHoc = daMoKhoa,
                ThongBao = daMoKhoa
                    ? "Thanh toán thành công, khóa học đã được mở."
                    : "Chưa nhận được xác nhận thanh toán."
            };
        }

        public async Task<HoTroThanhToanChiTietDTO> TaoYeuCauHoTroThanhToanAsync(int maDonHang, int maNguoiDung, YeuCauHoTroThanhToanDTO yeuCau)
        {
            var donHang = await _dbContext.DonHangKhoaHocs
                .Include(x => x.GiaoDichThanhToans)
                .FirstOrDefaultAsync(x => x.MaDonHang == maDonHang && x.MaNguoiDung == maNguoiDung);

            if (donHang == null)
            {
                throw new ApplicationException("Không tìm thấy đơn hàng để gửi yêu cầu hỗ trợ.");
            }

            if (string.Equals(donHang.TrangThaiDonHang, "PAID", StringComparison.OrdinalIgnoreCase))
            {
                throw new ApplicationException("Đơn hàng đã thanh toán thành công, không cần gửi yêu cầu hỗ trợ.");
            }

            string thongTinLienLac = yeuCau.ThongTinLienLac.Trim();
            string? noiDungHocVien = string.IsNullOrWhiteSpace(yeuCau.NoiDungHocVien) ? null : yeuCau.NoiDungHocVien.Trim();

            var hoTroDangMo = donHang.GiaoDichThanhToans
                .Where(x => string.Equals(x.CongThanhToan, CongThanhToanHoTro, StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefault(x => string.Equals(x.TrangThai, TrangThaiHoTroChoXuLy, StringComparison.OrdinalIgnoreCase));

            if (hoTroDangMo != null)
            {
                hoTroDangMo.RawWebhook = TaoRawYeuCauHoTro(thongTinLienLac, noiDungHocVien, null, null);
                hoTroDangMo.UpdatedAt = DateTime.UtcNow;
                await _dbContext.SaveChangesAsync();
                return await LayChiTietYeuCauHoTroChoAdminAsync(hoTroDangMo.MaGiaoDich);
            }

            var banGhiHoTro = new GiaoDichThanhToanModel
            {
                MaDonHang = donHang.MaDonHang,
                CongThanhToan = CongThanhToanHoTro,
                MaThamChieuNgoai = $"SUP-{donHang.MaDonHang}-{Guid.NewGuid():N}".ToUpperInvariant(),
                SoTien = donHang.TongTien,
                TrangThai = TrangThaiHoTroChoXuLy,
                RawWebhook = TaoRawYeuCauHoTro(thongTinLienLac, noiDungHocVien, null, null),
                PaidAt = null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _dbContext.GiaoDichThanhToans.Add(banGhiHoTro);
            await _dbContext.SaveChangesAsync();
            return await LayChiTietYeuCauHoTroChoAdminAsync(banGhiHoTro.MaGiaoDich);
        }

        public async Task<IReadOnlyList<HoTroThanhToanDanhSachItemDTO>> LayDanhSachYeuCauHoTroChoAdminAsync(string? trangThai, string? tuKhoa)
        {
            IQueryable<GiaoDichThanhToanModel> query = _dbContext.GiaoDichThanhToans
                .AsNoTracking()
                .Where(x => x.CongThanhToan == CongThanhToanHoTro)
                .Include(x => x.DonHang)
                    .ThenInclude(d => d.NguoiDung)
                .Include(x => x.DonHang)
                    .ThenInclude(d => d.ChiTietDonHangs)
                    .ThenInclude(ct => ct.KhoaHoc);

            string? trangThaiLoc = string.IsNullOrWhiteSpace(trangThai) ? null : trangThai.Trim().ToUpperInvariant();
            if (trangThaiLoc != null)
            {
                query = query.Where(x => x.TrangThai == trangThaiLoc);
            }

            var danhSach = (await query.ToListAsync())
                .Select(MapHoTroDanhSachItem)
                .OrderByDescending(x => x.CreatedAt)
                .ToList();

            if (string.IsNullOrWhiteSpace(tuKhoa))
            {
                return danhSach;
            }

            string tuKhoaLoc = tuKhoa.Trim().ToLowerInvariant();
            return danhSach.Where(x =>
                    x.MaDonHang.ToString().Contains(tuKhoaLoc, StringComparison.OrdinalIgnoreCase) ||
                    x.MaGiaoDichHoTro.ToString().Contains(tuKhoaLoc, StringComparison.OrdinalIgnoreCase) ||
                    (x.TenHocVien?.ToLowerInvariant().Contains(tuKhoaLoc) ?? false) ||
                    (x.EmailHocVien?.ToLowerInvariant().Contains(tuKhoaLoc) ?? false) ||
                    (x.KhoaHocDaiDien?.ToLowerInvariant().Contains(tuKhoaLoc) ?? false) ||
                    (x.NoiDungChuyenKhoan?.ToLowerInvariant().Contains(tuKhoaLoc) ?? false) ||
                    (x.ThongTinLienLac?.ToLowerInvariant().Contains(tuKhoaLoc) ?? false))
                .ToList();
        }

        public async Task<HoTroThanhToanChiTietDTO> LayChiTietYeuCauHoTroChoAdminAsync(int maGiaoDichHoTro)
        {
            var duLieu = await _dbContext.GiaoDichThanhToans
                .AsNoTracking()
                .Where(x => x.MaGiaoDich == maGiaoDichHoTro && x.CongThanhToan == CongThanhToanHoTro)
                .Include(x => x.DonHang)
                    .ThenInclude(d => d.NguoiDung)
                .Include(x => x.DonHang)
                    .ThenInclude(d => d.ChiTietDonHangs)
                    .ThenInclude(ct => ct.KhoaHoc)
                .FirstOrDefaultAsync();

            if (duLieu == null)
            {
                throw new ApplicationException("Không tìm thấy yêu cầu hỗ trợ thanh toán.");
            }

            return MapHoTroChiTiet(duLieu);
        }

        public async Task<HoTroThanhToanChiTietDTO> ChapThuanYeuCauHoTroAsync(int maGiaoDichHoTro, int maQuanTriVien, XuLyYeuCauHoTroThanhToanDTO yeuCau)
        {
            return await ChapThuanHoTroMuaKhoaHocAsync(maGiaoDichHoTro, maQuanTriVien, yeuCau);
        }

        public async Task<HoTroThanhToanChiTietDTO> TuChoiYeuCauHoTroAsync(int maGiaoDichHoTro, int maQuanTriVien, XuLyYeuCauHoTroThanhToanDTO yeuCau)
        {
            return await TuChoiHoTroMuaKhoaHocAsync(maGiaoDichHoTro, maQuanTriVien, yeuCau);
        }

        private async Task<HoTroThanhToanChiTietDTO> ChapThuanHoTroMuaKhoaHocAsync(int maGiaoDichHoTro, int maQuanTriVien, XuLyYeuCauHoTroThanhToanDTO yeuCau)
        {
            string? ghiChuAdmin = string.IsNullOrWhiteSpace(yeuCau.GhiChuAdmin) ? null : yeuCau.GhiChuAdmin.Trim();
            int maDonHang = 0;
            bool daMoKhoaMoi = false;

            var chienLuoc = _dbContext.Database.CreateExecutionStrategy();
            await chienLuoc.ExecuteAsync(async () =>
            {
                await using var giaoDich = await _dbContext.Database.BeginTransactionAsync();
                try
                {
                    var hoTro = await _dbContext.GiaoDichThanhToans
                        .Include(x => x.DonHang)
                            .ThenInclude(d => d.ChiTietDonHangs)
                        .FirstOrDefaultAsync(x => x.MaGiaoDich == maGiaoDichHoTro && x.CongThanhToan == CongThanhToanHoTro);

                    if (hoTro == null)
                    {
                        throw new ApplicationException("Không tìm thấy yêu cầu hỗ trợ thanh toán.");
                    }

                    if (string.Equals(hoTro.TrangThai, TrangThaiHoTroTuChoi, StringComparison.OrdinalIgnoreCase))
                    {
                        throw new ApplicationException("Yêu cầu này đã bị từ chối trước đó.");
                    }

                    var donHang = hoTro.DonHang;
                    maDonHang = donHang.MaDonHang;
                    var thoiGianHienTai = DateTime.UtcNow;

                    if (!string.Equals(hoTro.TrangThai, TrangThaiHoTroChapThuan, StringComparison.OrdinalIgnoreCase))
                    {
                        if (!string.Equals(donHang.TrangThaiDonHang, "PAID", StringComparison.OrdinalIgnoreCase))
                        {
                            donHang.TrangThaiDonHang = "PAID";
                            donHang.UpdatedAt = thoiGianHienTai;

                            var giaoDichThanhToan = await _dbContext.GiaoDichThanhToans
                                .Where(x => x.MaDonHang == donHang.MaDonHang && x.CongThanhToan != CongThanhToanHoTro)
                                .OrderByDescending(x => x.CreatedAt)
                                .FirstOrDefaultAsync();

                            if (giaoDichThanhToan == null)
                            {
                                _dbContext.GiaoDichThanhToans.Add(new GiaoDichThanhToanModel
                                {
                                    MaDonHang = donHang.MaDonHang,
                                    CongThanhToan = "MANUAL_ADMIN_SUPPORT",
                                    MaThamChieuNgoai = $"MANUAL-{donHang.MaDonHang}-{Guid.NewGuid():N}".ToUpperInvariant(),
                                    SoTien = donHang.TongTien,
                                    TrangThai = "SUCCESS",
                                    RawWebhook = "{\"source\":\"admin_support_approve\"}",
                                    PaidAt = thoiGianHienTai,
                                    CreatedAt = thoiGianHienTai,
                                    UpdatedAt = thoiGianHienTai
                                });
                            }
                            else
                            {
                                giaoDichThanhToan.TrangThai = "SUCCESS";
                                giaoDichThanhToan.SoTien = donHang.TongTien;
                                giaoDichThanhToan.PaidAt ??= thoiGianHienTai;
                                giaoDichThanhToan.UpdatedAt = thoiGianHienTai;
                            }

                            foreach (var chiTiet in donHang.ChiTietDonHangs)
                            {
                                bool daDangKy = await _dbContext.DangKyKhoaHocs
                                    .AnyAsync(x => x.MaNguoiDung == donHang.MaNguoiDung && x.MaKhoaHoc == chiTiet.MaKhoaHoc);

                                if (!daDangKy)
                                {
                                    _dbContext.DangKyKhoaHocs.Add(new DangKyKhoaHocModel
                                    {
                                        MaNguoiDung = donHang.MaNguoiDung,
                                        MaKhoaHoc = chiTiet.MaKhoaHoc,
                                        NgayDangKy = thoiGianHienTai,
                                        TrangThai = "DangHoc",
                                        TienDo = 0
                                    });
                                    daMoKhoaMoi = true;
                                }
                            }

                            bool daCoDoanhThu = await _dbContext.DoanhThuGiangViens
                                .AnyAsync(x => x.MaDonHang == donHang.MaDonHang);

                            if (!daCoDoanhThu)
                            {
                                var khoaHocDauTien = await _dbContext.KhoaHocs
                                    .AsNoTracking()
                                    .FirstOrDefaultAsync(x => x.MaKhoaHoc == donHang.ChiTietDonHangs.First().MaKhoaHoc);

                                if (khoaHocDauTien != null)
                                {
                                    var soTienNenTang = Math.Round(donHang.TongTien * 0.2m, 2);
                                    _dbContext.DoanhThuGiangViens.Add(new DoanhThuGiangVienModel
                                    {
                                        MaGiangVien = khoaHocDauTien.MaGiangVien,
                                        MaDonHang = donHang.MaDonHang,
                                        TongTienDonHang = donHang.TongTien,
                                        PhiNenTang = soTienNenTang,
                                        ThucNhanGiangVien = donHang.TongTien - soTienNenTang,
                                        TrangThaiDoiSoat = "PENDING",
                                        CreatedAt = thoiGianHienTai
                                    });
                                }
                            }
                        }

                        hoTro.TrangThai = TrangThaiHoTroChapThuan;
                        hoTro.RawWebhook = TaoRawYeuCauHoTro(
                            LayThongTinLienLacTuRaw(hoTro.RawWebhook),
                            LayNoiDungHocVienTuRaw(hoTro.RawWebhook),
                            ghiChuAdmin,
                            maQuanTriVien);
                        hoTro.UpdatedAt = thoiGianHienTai;
                    }

                    await _dbContext.SaveChangesAsync();
                    await giaoDich.CommitAsync();
                }
                catch
                {
                    await giaoDich.RollbackAsync();
                    throw;
                }
            });

            if (daMoKhoaMoi || maDonHang > 0)
            {
                try
                {
                    await _thanhToanEmailService.GuiThongBaoThanhToanThanhCongHocVienAsync(maDonHang);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Không gửi được email thanh toán sau khi admin chấp thuận hỗ trợ cho đơn {MaDonHang}", maDonHang);
                }
            }

            return await LayChiTietYeuCauHoTroChoAdminAsync(maGiaoDichHoTro);
        }

        private async Task<HoTroThanhToanChiTietDTO> TuChoiHoTroMuaKhoaHocAsync(int maGiaoDichHoTro, int maQuanTriVien, XuLyYeuCauHoTroThanhToanDTO yeuCau)
        {
            var hoTro = await _dbContext.GiaoDichThanhToans
                .FirstOrDefaultAsync(x => x.MaGiaoDich == maGiaoDichHoTro && x.CongThanhToan == CongThanhToanHoTro);

            if (hoTro == null)
            {
                throw new ApplicationException("Không tìm thấy yêu cầu hỗ trợ thanh toán.");
            }

            if (string.Equals(hoTro.TrangThai, TrangThaiHoTroChapThuan, StringComparison.OrdinalIgnoreCase))
            {
                throw new ApplicationException("Yêu cầu đã được chấp thuận trước đó.");
            }

            if (string.Equals(hoTro.TrangThai, TrangThaiHoTroTuChoi, StringComparison.OrdinalIgnoreCase))
            {
                throw new ApplicationException("Yêu cầu đã bị từ chối trước đó.");
            }

            hoTro.TrangThai = TrangThaiHoTroTuChoi;
            hoTro.RawWebhook = TaoRawYeuCauHoTro(
                LayThongTinLienLacTuRaw(hoTro.RawWebhook),
                LayNoiDungHocVienTuRaw(hoTro.RawWebhook),
                string.IsNullOrWhiteSpace(yeuCau.GhiChuAdmin) ? null : yeuCau.GhiChuAdmin.Trim(),
                maQuanTriVien);
            hoTro.UpdatedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();

            return await LayChiTietYeuCauHoTroChoAdminAsync(maGiaoDichHoTro);
        }

        public async Task<bool> XuLyThongBaoSePayAsync(ThongBaoWebhookSePayDTO duLieuWebhook)
        {
            if (!string.Equals(duLieuWebhook.transferType, "in", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            var ketQuaTimMa = Regex.Match(duLieuWebhook.content?.ToUpperInvariant() ?? string.Empty, @"EDU(\d+)");
            if (!ketQuaTimMa.Success || !int.TryParse(ketQuaTimMa.Groups[1].Value, out var maDonHang))
            {
                return false;
            }

            var donHang = await _dbContext.DonHangKhoaHocs
                .Include(x => x.ChiTietDonHangs)
                .FirstOrDefaultAsync(x => x.MaDonHang == maDonHang);

            if (donHang == null)
            {
                return false;
            }

            if (donHang.TrangThaiDonHang == "PAID")
            {
                return true;
            }

            if (duLieuWebhook.transferAmount + 1000 < donHang.TongTien)
            {
                return false;
            }

            var chienLuoc = _dbContext.Database.CreateExecutionStrategy();
            return await chienLuoc.ExecuteAsync(async () =>
            {
                await using var giaoDich = await _dbContext.Database.BeginTransactionAsync();
                try
                {
                    var thoiGianHienTai = DateTime.UtcNow;
                    donHang.TrangThaiDonHang = "PAID";
                    donHang.UpdatedAt = thoiGianHienTai;

                    var giaoDichThanhToan = await _dbContext.GiaoDichThanhToans
                        .Where(x => x.MaDonHang == donHang.MaDonHang)
                        .OrderByDescending(x => x.CreatedAt)
                        .FirstOrDefaultAsync();

                    if (giaoDichThanhToan == null)
                    {
                        giaoDichThanhToan = new GiaoDichThanhToanModel
                        {
                            MaDonHang = donHang.MaDonHang,
                            CongThanhToan = "SEPAY",
                            MaThamChieuNgoai = $"SEPAY-{duLieuWebhook.id}",
                            SoTien = duLieuWebhook.transferAmount,
                            TrangThai = "SUCCESS",
                            RawWebhook = JsonSerializer.Serialize(duLieuWebhook),
                            PaidAt = thoiGianHienTai,
                            CreatedAt = thoiGianHienTai,
                            UpdatedAt = thoiGianHienTai
                        };
                        _dbContext.GiaoDichThanhToans.Add(giaoDichThanhToan);
                    }
                    else
                    {
                        giaoDichThanhToan.TrangThai = "SUCCESS";
                        giaoDichThanhToan.SoTien = duLieuWebhook.transferAmount;
                        giaoDichThanhToan.RawWebhook = JsonSerializer.Serialize(duLieuWebhook);
                        giaoDichThanhToan.PaidAt = thoiGianHienTai;
                        giaoDichThanhToan.UpdatedAt = thoiGianHienTai;
                    }

                    foreach (var chiTiet in donHang.ChiTietDonHangs)
                    {
                        bool daDangKy = await _dbContext.DangKyKhoaHocs
                            .AnyAsync(x => x.MaNguoiDung == donHang.MaNguoiDung && x.MaKhoaHoc == chiTiet.MaKhoaHoc);

                        if (!daDangKy)
                        {
                            _dbContext.DangKyKhoaHocs.Add(new DangKyKhoaHocModel
                            {
                                MaNguoiDung = donHang.MaNguoiDung,
                                MaKhoaHoc = chiTiet.MaKhoaHoc,
                                NgayDangKy = thoiGianHienTai,
                                TrangThai = "DangHoc",
                                TienDo = 0
                            });
                        }
                    }

                    bool daCoDoanhThu = await _dbContext.DoanhThuGiangViens
                        .AnyAsync(x => x.MaDonHang == donHang.MaDonHang);

                    if (!daCoDoanhThu)
                    {
                        var khoaHocDauTien = await _dbContext.KhoaHocs
                            .AsNoTracking()
                            .FirstOrDefaultAsync(x => x.MaKhoaHoc == donHang.ChiTietDonHangs.First().MaKhoaHoc);

                        if (khoaHocDauTien != null)
                        {
                            var soTienNenTang = Math.Round(donHang.TongTien * 0.2m, 2);
                            _dbContext.DoanhThuGiangViens.Add(new DoanhThuGiangVienModel
                            {
                                MaGiangVien = khoaHocDauTien.MaGiangVien,
                                MaDonHang = donHang.MaDonHang,
                                TongTienDonHang = donHang.TongTien,
                                PhiNenTang = soTienNenTang,
                                ThucNhanGiangVien = donHang.TongTien - soTienNenTang,
                                TrangThaiDoiSoat = "PENDING",
                                CreatedAt = thoiGianHienTai
                            });
                        }
                    }

                    await _dbContext.SaveChangesAsync();
                    await giaoDich.CommitAsync();

                    try
                    {
                        await _thanhToanEmailService.GuiThongBaoThanhToanThanhCongHocVienAsync(donHang.MaDonHang);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Không gửi được email thanh toán cho đơn {MaDonHang}", donHang.MaDonHang);
                    }

                    return true;
                }
                catch
                {
                    await giaoDich.RollbackAsync();
                    throw;
                }
            });
        }

        private static string TaoRawYeuCauHoTro(string? thongTinLienLac, string? noiDungHocVien, string? ghiChuAdmin, int? maQuanTriVien)
        {
            var payload = new
            {
                thongTinLienLac,
                noiDungHocVien,
                ghiChuAdmin,
                maQuanTriVien,
                xuLyLuc = DateTime.UtcNow
            };

            return JsonSerializer.Serialize(payload);
        }

        private static string? LayThongTinLienLacTuRaw(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            try
            {
                using var doc = JsonDocument.Parse(raw);
                return doc.RootElement.TryGetProperty("thongTinLienLac", out var p) ? p.GetString() : null;
            }
            catch
            {
                return null;
            }
        }

        private static string? LayNoiDungHocVienTuRaw(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            try
            {
                using var doc = JsonDocument.Parse(raw);
                return doc.RootElement.TryGetProperty("noiDungHocVien", out var p) ? p.GetString() : null;
            }
            catch
            {
                return null;
            }
        }

        private static string? LayGhiChuAdminTuRaw(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            try
            {
                using var doc = JsonDocument.Parse(raw);
                return doc.RootElement.TryGetProperty("ghiChuAdmin", out var p) ? p.GetString() : null;
            }
            catch
            {
                return null;
            }
        }

        private static int? LayMaQuanTriVienTuRaw(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            try
            {
                using var doc = JsonDocument.Parse(raw);
                if (!doc.RootElement.TryGetProperty("maQuanTriVien", out var p)) return null;
                return p.ValueKind == JsonValueKind.Number && p.TryGetInt32(out int value) ? value : null;
            }
            catch
            {
                return null;
            }
        }

        private static DateTime? LayXuLyLucTuRaw(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            try
            {
                using var doc = JsonDocument.Parse(raw);
                if (!doc.RootElement.TryGetProperty("xuLyLuc", out var p)) return null;
                if (p.ValueKind == JsonValueKind.String && DateTime.TryParse(p.GetString(), out var value))
                {
                    return value;
                }

                return null;
            }
            catch
            {
                return null;
            }
        }

        private static HoTroThanhToanDanhSachItemDTO MapHoTroDanhSachItem(GiaoDichThanhToanModel x)
        {
            return new HoTroThanhToanDanhSachItemDTO
            {
                MaGiaoDichHoTro = x.MaGiaoDich,
                LoaiHoTro = LoaiHoTroMuaKhoaHoc,
                MaDonHang = x.MaDonHang,
                MaYeuCauRutTien = null,
                NoiDungChuyenKhoan = $"EDU{x.MaDonHang}",
                MaNguoiDung = x.DonHang.MaNguoiDung,
                TenHocVien = x.DonHang.NguoiDung.HoTen ?? x.DonHang.NguoiDung.TaiKhoan,
                EmailHocVien = x.DonHang.NguoiDung.Email,
                SoTienDonHang = x.DonHang.TongTien,
                LoaiTien = x.DonHang.LoaiTien,
                TrangThaiHoTro = x.TrangThai,
                TrangThaiDonHang = x.DonHang.TrangThaiDonHang,
                ThongTinLienLac = LayThongTinLienLacTuRaw(x.RawWebhook) ?? string.Empty,
                NoiDungHocVien = LayNoiDungHocVienTuRaw(x.RawWebhook),
                GhiChuAdmin = LayGhiChuAdminTuRaw(x.RawWebhook),
                KhoaHocDaiDien = x.DonHang.ChiTietDonHangs
                    .OrderBy(ct => ct.MaChiTiet)
                    .Select(ct => ct.KhoaHoc?.TenKhoaHoc)
                    .FirstOrDefault(),
                CreatedAt = x.CreatedAt,
                XuLyLuc = LayXuLyLucTuRaw(x.RawWebhook)
            };
        }

        private static HoTroThanhToanChiTietDTO MapHoTroChiTiet(GiaoDichThanhToanModel hoTro)
        {
            return new HoTroThanhToanChiTietDTO
            {
                MaGiaoDichHoTro = hoTro.MaGiaoDich,
                LoaiHoTro = LoaiHoTroMuaKhoaHoc,
                MaDonHang = hoTro.MaDonHang,
                MaYeuCauRutTien = null,
                NoiDungChuyenKhoan = $"EDU{hoTro.MaDonHang}",
                MaNguoiDung = hoTro.DonHang.MaNguoiDung,
                TenHocVien = hoTro.DonHang.NguoiDung.HoTen ?? hoTro.DonHang.NguoiDung.TaiKhoan,
                EmailHocVien = hoTro.DonHang.NguoiDung.Email,
                SoTienDonHang = hoTro.DonHang.TongTien,
                LoaiTien = hoTro.DonHang.LoaiTien,
                TrangThaiHoTro = hoTro.TrangThai,
                TrangThaiDonHang = hoTro.DonHang.TrangThaiDonHang,
                ThongTinLienLac = LayThongTinLienLacTuRaw(hoTro.RawWebhook) ?? string.Empty,
                NoiDungHocVien = LayNoiDungHocVienTuRaw(hoTro.RawWebhook),
                GhiChuAdmin = LayGhiChuAdminTuRaw(hoTro.RawWebhook),
                MaQuanTriVienXuLy = LayMaQuanTriVienTuRaw(hoTro.RawWebhook),
                CreatedAt = hoTro.CreatedAt,
                XuLyLuc = LayXuLyLucTuRaw(hoTro.RawWebhook),
                DanhSachKhoaHoc = hoTro.DonHang.ChiTietDonHangs
                    .OrderBy(x => x.MaChiTiet)
                    .Select(x => new HoTroThanhToanKhoaHocItemDTO
                    {
                        MaKhoaHoc = x.MaKhoaHoc,
                        TenKhoaHoc = x.KhoaHoc?.TenKhoaHoc ?? $"Khóa học #{x.MaKhoaHoc}"
                    })
                    .ToList()
            };
        }

        private string TaoNoiDungChuyenKhoan(int maDonHang)
        {
            return $"EDU{maDonHang}";
        }

        private string TaoDuongDanAnhQr(decimal soTien, string noiDungChuyenKhoan)
        {
            string maNganHang = _cauHinh["ThanhToanSePay:MaNganHang"] ?? "MB";
            string soTaiKhoan = _cauHinh["ThanhToanSePay:SoTaiKhoan"] ?? "68836102061995";
            string tenTaiKhoan = _cauHinh["ThanhToanSePay:TenTaiKhoan"] ?? "HOANG";

            return $"https://img.vietqr.io/image/{maNganHang}-{soTaiKhoan}-compact2.png?amount={soTien:0}&addInfo={noiDungChuyenKhoan}&accountName={Uri.EscapeDataString(tenTaiKhoan)}";
        }
    }
}
