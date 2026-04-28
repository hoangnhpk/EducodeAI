using educodeai_server.Data;
using educodeai_server.DTOs.ThanhToan;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Net;

namespace educodeai_server.Services.Implementation
{
    public class ThanhToanKhoaHocService : IThanhToanKhoaHocService
    {
        private const string CongThanhToanHoTro = "SEPAY_SUPPORT";
        private const string LoaiHoTroMuaKhoaHoc = "COURSE_PURCHASE";
        private const string TrangThaiHoTroChoXuLy = "SUPPORT_PENDING";
        private const string TrangThaiHoTroChapThuan = "SUPPORT_APPROVED";
        private const string TrangThaiHoTroTuChoi = "SUPPORT_REJECTED";
        private const string LoaiDonHangMuaKhoaHoc = "COURSE_PURCHASE";
        private const string LoaiDonHangGiftCode = "GIFT_CODE";
        private const string TrangThaiGiftChoThanhToan = "PENDING_PAYMENT";
        private const string TrangThaiGiftSanSang = "ACTIVE";
        private const string TrangThaiGiftDaDung = "REDEEMED";
        private const string LoaiGiamGiaPhanTram = "PERCENT";
        private const string LoaiGiamGiaSoTien = "FIXED";
        private const decimal TyLePhiNenTangMacDinh = 0.2m; // 20%

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
                    var soTienNenTang = TinhPhiNenTang(tongTien);
                    var soTienGiangVienNhan = TinhTienThucNhanGiangVien(tongTien);

                    var donHang = new DonHangKhoaHocModel
                    {
                        MaNguoiDung = maNguoiDung,
                        TongTien = tongTien,
                        TongTienGoc = tongTien,
                        SoTienGiam = 0,
                        LoaiTien = khoaHoc.DonViTienTe,
                        TrangThaiDonHang = "PAID",
                        LoaiDonHang = LoaiDonHangMuaKhoaHoc,
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
            string? maVoucherChuan = string.IsNullOrWhiteSpace(yeuCau.MaVoucher) ? null : yeuCau.MaVoucher.Trim().ToUpperInvariant();
            var thongTinGiamGia = await TinhGiamGiaHopLeAsync(maVoucherChuan, maNguoiDung, yeuCau.MaKhoaHoc, khoaHoc.GiaKhoaHoc, false);

            var donHangCho = await _dbContext.DonHangKhoaHocs
                .Include(x => x.ChiTietDonHangs)
                .Where(x => x.MaNguoiDung == maNguoiDung
                            && x.LoaiDonHang == LoaiDonHangMuaKhoaHoc
                            && x.TrangThaiDonHang == "PENDING"
                            && x.ExpiredAt != null
                            && x.ExpiredAt > thoiGianHienTai
                            && x.CodeVoucher == maVoucherChuan
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
                            TongTien = thongTinGiamGia.TongTienSauGiam,
                            TongTienGoc = khoaHoc.GiaKhoaHoc,
                            SoTienGiam = thongTinGiamGia.SoTienGiam,
                            LoaiTien = khoaHoc.DonViTienTe,
                            TrangThaiDonHang = "PENDING",
                            LoaiDonHang = LoaiDonHangMuaKhoaHoc,
                            MaVoucher = thongTinGiamGia.Voucher?.MaVoucher,
                            CodeVoucher = maVoucherChuan,
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
                            GiamGia = thongTinGiamGia.SoTienGiam,
                            ThanhTien = thongTinGiamGia.TongTienSauGiam
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

        public async Task<ThongTinMaQuaTangDTO> TaoMaQuaTangAsync(YeuCauTaoMaQuaTangDTO yeuCau, int maNguoiDung)
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

            var thoiGianHienTai = DateTime.UtcNow;
            string? maVoucherChuan = string.IsNullOrWhiteSpace(yeuCau.MaVoucher) ? null : yeuCau.MaVoucher.Trim().ToUpperInvariant();
            var thongTinGiamGia = await TinhGiamGiaHopLeAsync(maVoucherChuan, maNguoiDung, yeuCau.MaKhoaHoc, khoaHoc.GiaKhoaHoc, true);
            var donHang = await _dbContext.DonHangKhoaHocs
                .Include(x => x.ChiTietDonHangs)
                .Include(x => x.MaQuaTangHocViens)
                .Where(x => x.MaNguoiDung == maNguoiDung
                            && x.LoaiDonHang == LoaiDonHangGiftCode
                            && x.TrangThaiDonHang == "PENDING"
                            && x.ExpiredAt != null
                            && x.ExpiredAt > thoiGianHienTai
                            && x.CodeVoucher == maVoucherChuan
                            && x.ChiTietDonHangs.Any(ct => ct.MaKhoaHoc == yeuCau.MaKhoaHoc))
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();

            if (donHang == null)
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
                            TongTien = thongTinGiamGia.TongTienSauGiam,
                            TongTienGoc = khoaHoc.GiaKhoaHoc,
                            SoTienGiam = thongTinGiamGia.SoTienGiam,
                            LoaiTien = khoaHoc.DonViTienTe,
                            TrangThaiDonHang = "PENDING",
                            LoaiDonHang = LoaiDonHangGiftCode,
                            MaVoucher = thongTinGiamGia.Voucher?.MaVoucher,
                            CodeVoucher = maVoucherChuan,
                            IdempotencyKey = $"gift-{maNguoiDung}-{khoaHoc.MaKhoaHoc}-{Guid.NewGuid():N}",
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
                            GiamGia = thongTinGiamGia.SoTienGiam,
                            ThanhTien = thongTinGiamGia.TongTienSauGiam
                        });

                        _dbContext.GiaoDichThanhToans.Add(new GiaoDichThanhToanModel
                        {
                            MaDonHang = donHang.MaDonHang,
                            CongThanhToan = "SEPAY",
                            MaThamChieuNgoai = $"GD-GIFT-{donHang.MaDonHang}-{Guid.NewGuid():N}".ToUpperInvariant(),
                            SoTien = khoaHoc.GiaKhoaHoc,
                            TrangThai = "INITIATED",
                            CreatedAt = thoiGianHienTai,
                            UpdatedAt = thoiGianHienTai
                        });

                        _dbContext.MaQuaTangHocViens.Add(new MaQuaTangHocVienModel
                        {
                            Code = TaoCodeQuaTang(),
                            MaDonHang = donHang.MaDonHang,
                            MaKhoaHoc = khoaHoc.MaKhoaHoc,
                            MaNguoiTang = maNguoiDung,
                            TrangThai = TrangThaiGiftChoThanhToan,
                            CreatedAt = thoiGianHienTai,
                            ExpiredAt = thoiGianHienTai.AddDays(30)
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
                throw new ApplicationException("Không thể khởi tạo mã quà tặng.");
            }

            var maQuaTang = await _dbContext.MaQuaTangHocViens
                .AsNoTracking()
                .Where(x => x.MaDonHang == donHang.MaDonHang)
                .OrderByDescending(x => x.CreatedAt)
                .FirstAsync();

            string noiDungChuyenKhoan = TaoNoiDungChuyenKhoan(donHang.MaDonHang);
            return new ThongTinMaQuaTangDTO
            {
                MaQuaTang = maQuaTang.MaQuaTang,
                Code = maQuaTang.Code,
                MaDonHang = donHang.MaDonHang,
                MaKhoaHoc = khoaHoc.MaKhoaHoc,
                TenKhoaHoc = khoaHoc.TenKhoaHoc,
                SoTienCanThanhToan = donHang.TongTien,
                DonViTienTe = donHang.LoaiTien,
                NoiDungChuyenKhoan = noiDungChuyenKhoan,
                DuongDanAnhQr = TaoDuongDanAnhQr(donHang.TongTien, noiDungChuyenKhoan),
                HetHanThanhToan = donHang.ExpiredAt,
                TrangThaiMaQuaTang = maQuaTang.TrangThai
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

        public async Task<TrangThaiMaQuaTangDTO> KiemTraTrangThaiMaQuaTangAsync(int maDonHang, int maNguoiDung)
        {
            var donHang = await _dbContext.DonHangKhoaHocs
                .Include(x => x.MaQuaTangHocViens)
                .FirstOrDefaultAsync(x => x.MaDonHang == maDonHang && x.MaNguoiDung == maNguoiDung && x.LoaiDonHang == LoaiDonHangGiftCode);

            if (donHang == null)
            {
                throw new ApplicationException("Không tìm thấy đơn hàng quà tặng.");
            }

            var gift = donHang.MaQuaTangHocViens.OrderByDescending(x => x.CreatedAt).FirstOrDefault();
            string trangThaiGift = gift?.TrangThai ?? TrangThaiGiftChoThanhToan;
            bool sanSang = string.Equals(trangThaiGift, TrangThaiGiftSanSang, StringComparison.OrdinalIgnoreCase)
                           || string.Equals(trangThaiGift, TrangThaiGiftDaDung, StringComparison.OrdinalIgnoreCase);

            return new TrangThaiMaQuaTangDTO
            {
                MaDonHang = maDonHang,
                TrangThaiDonHang = donHang.TrangThaiDonHang,
                TrangThaiMaQuaTang = trangThaiGift,
                SanSangSuDung = sanSang,
                ThongBao = sanSang ? "Mã quà tặng đã sẵn sàng sử dụng." : "Chưa xác nhận thanh toán cho mã quà tặng."
            };
        }

        public async Task<KetQuaNhapMaQuaTangDTO> NhapMaQuaTangAsync(NhapMaQuaTangDTO yeuCau, int maNguoiDung)
        {
            string code = yeuCau.Code.Trim().ToUpperInvariant();
            var gift = await _dbContext.MaQuaTangHocViens
                .Include(x => x.KhoaHoc)
                .FirstOrDefaultAsync(x => x.Code == code);

            if (gift == null)
            {
                throw new ApplicationException("Mã quà tặng không tồn tại.");
            }

            if (gift.MaNguoiTang == maNguoiDung)
            {
                throw new ApplicationException("Không thể tự nhận mã quà tặng do chính bạn tạo.");
            }

            if (gift.ExpiredAt.HasValue && gift.ExpiredAt.Value <= DateTime.UtcNow)
            {
                throw new ApplicationException("Mã quà tặng đã hết hạn.");
            }

            if (!string.Equals(gift.TrangThai, TrangThaiGiftSanSang, StringComparison.OrdinalIgnoreCase))
            {
                if (string.Equals(gift.TrangThai, TrangThaiGiftDaDung, StringComparison.OrdinalIgnoreCase))
                {
                    throw new ApplicationException("Mã quà tặng đã được sử dụng.");
                }

                throw new ApplicationException("Mã quà tặng chưa sẵn sàng sử dụng.");
            }

            bool daSoHuu = await _dbContext.DangKyKhoaHocs
                .AnyAsync(x => x.MaNguoiDung == maNguoiDung && x.MaKhoaHoc == gift.MaKhoaHoc);
            if (daSoHuu)
            {
                throw new ApplicationException("Bạn đã sở hữu khóa học này.");
            }

            var chienLuoc = _dbContext.Database.CreateExecutionStrategy();
            await chienLuoc.ExecuteAsync(async () =>
            {
                await using var giaoDich = await _dbContext.Database.BeginTransactionAsync();
                try
                {
                    var giftLock = await _dbContext.MaQuaTangHocViens
                        .FirstOrDefaultAsync(x => x.MaQuaTang == gift.MaQuaTang);
                    if (giftLock == null || !string.Equals(giftLock.TrangThai, TrangThaiGiftSanSang, StringComparison.OrdinalIgnoreCase))
                    {
                        throw new ApplicationException("Mã quà tặng đã được sử dụng hoặc không còn hiệu lực.");
                    }

                    _dbContext.DangKyKhoaHocs.Add(new DangKyKhoaHocModel
                    {
                        MaNguoiDung = maNguoiDung,
                        MaKhoaHoc = giftLock.MaKhoaHoc,
                        NgayDangKy = DateTime.UtcNow,
                        TrangThai = "DangHoc",
                        TienDo = 0
                    });

                    giftLock.TrangThai = TrangThaiGiftDaDung;
                    giftLock.MaNguoiNhan = maNguoiDung;
                    giftLock.RedeemedAt = DateTime.UtcNow;

                    await _dbContext.SaveChangesAsync();
                    await giaoDich.CommitAsync();
                }
                catch
                {
                    await giaoDich.RollbackAsync();
                    throw;
                }
            });

            try
            {
                await GuiEmailKhiRedeemMaQuaTangAsync(gift.MaQuaTang, maNguoiDung);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Không gửi được email sau khi redeem mã quà tặng {MaQuaTang}", gift.MaQuaTang);
            }

            return new KetQuaNhapMaQuaTangDTO
            {
                ThanhCong = true,
                ThongBao = "Nhập mã quà tặng thành công. Khóa học đã được mở.",
                Code = code,
                MaKhoaHoc = gift.MaKhoaHoc,
                TenKhoaHoc = gift.KhoaHoc.TenKhoaHoc,
                MaNguoiNhan = maNguoiDung
            };
        }

        public async Task<IReadOnlyList<LichSuMaQuaTangDTO>> LayLichSuMaQuaTangAsync(int maNguoiDung)
        {
            return await _dbContext.MaQuaTangHocViens
                .AsNoTracking()
                .Include(x => x.KhoaHoc)
                .Include(x => x.DonHang)
                .Include(x => x.NguoiTang)
                .Include(x => x.NguoiNhan)
                .Where(x => x.MaNguoiTang == maNguoiDung)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new LichSuMaQuaTangDTO
                {
                    MaQuaTang = x.MaQuaTang,
                    Code = x.Code,
                    MaDonHang = x.MaDonHang,
                    MaKhoaHoc = x.MaKhoaHoc,
                    TenKhoaHoc = x.KhoaHoc.TenKhoaHoc,
                    SoTien = x.DonHang.TongTien,
                    DonViTienTe = x.DonHang.LoaiTien,
                    NoiDungChuyenKhoan = $"EDU{x.MaDonHang}",
                    MaNguoiTang = x.MaNguoiTang,
                    TenNguoiTang = x.NguoiTang.HoTen ?? x.NguoiTang.TaiKhoan,
                    EmailNguoiTang = x.NguoiTang.Email,
                    TrangThai = x.TrangThai,
                    CreatedAt = x.CreatedAt,
                    ActivatedAt = x.ActivatedAt,
                    RedeemedAt = x.RedeemedAt,
                    MaNguoiNhan = x.MaNguoiNhan,
                    TenNguoiNhan = x.NguoiNhan != null ? (x.NguoiNhan.HoTen ?? x.NguoiNhan.TaiKhoan) : null,
                    EmailNguoiNhan = x.NguoiNhan != null ? x.NguoiNhan.Email : null
                })
                .ToListAsync();
        }

        public async Task<IReadOnlyList<LichSuMaQuaTangDTO>> LayLichSuMaQuaTangChoAdminAsync(string? trangThai, string? tuKhoa)
        {
            IQueryable<MaQuaTangHocVienModel> query = _dbContext.MaQuaTangHocViens
                .AsNoTracking()
                .Include(x => x.KhoaHoc)
                .Include(x => x.DonHang)
                .Include(x => x.NguoiTang)
                .Include(x => x.NguoiNhan);

            string? trangThaiLoc = string.IsNullOrWhiteSpace(trangThai) ? null : trangThai.Trim().ToUpperInvariant();
            if (!string.IsNullOrWhiteSpace(trangThaiLoc) && !string.Equals(trangThaiLoc, "ALL", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(x => x.TrangThai == trangThaiLoc);
            }

            var duLieu = await query
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new LichSuMaQuaTangDTO
                {
                    MaQuaTang = x.MaQuaTang,
                    Code = x.Code,
                    MaDonHang = x.MaDonHang,
                    MaKhoaHoc = x.MaKhoaHoc,
                    TenKhoaHoc = x.KhoaHoc.TenKhoaHoc,
                    SoTien = x.DonHang.TongTien,
                    DonViTienTe = x.DonHang.LoaiTien,
                    NoiDungChuyenKhoan = $"EDU{x.MaDonHang}",
                    MaNguoiTang = x.MaNguoiTang,
                    TenNguoiTang = x.NguoiTang.HoTen ?? x.NguoiTang.TaiKhoan,
                    EmailNguoiTang = x.NguoiTang.Email,
                    TrangThai = x.TrangThai,
                    CreatedAt = x.CreatedAt,
                    ActivatedAt = x.ActivatedAt,
                    RedeemedAt = x.RedeemedAt,
                    MaNguoiNhan = x.MaNguoiNhan,
                    TenNguoiNhan = x.NguoiNhan != null ? (x.NguoiNhan.HoTen ?? x.NguoiNhan.TaiKhoan) : null,
                    EmailNguoiNhan = x.NguoiNhan != null ? x.NguoiNhan.Email : null
                })
                .ToListAsync();

            if (string.IsNullOrWhiteSpace(tuKhoa))
            {
                return duLieu;
            }

            string key = tuKhoa.Trim().ToLowerInvariant();
            return duLieu.Where(x =>
                    x.Code.ToLowerInvariant().Contains(key) ||
                    x.TenKhoaHoc.ToLowerInvariant().Contains(key) ||
                    x.MaDonHang.ToString().Contains(key, StringComparison.OrdinalIgnoreCase) ||
                    x.NoiDungChuyenKhoan.ToLowerInvariant().Contains(key) ||
                    (x.TenNguoiTang?.ToLowerInvariant().Contains(key) ?? false) ||
                    (x.EmailNguoiTang?.ToLowerInvariant().Contains(key) ?? false) ||
                    (x.TenNguoiNhan?.ToLowerInvariant().Contains(key) ?? false) ||
                    (x.EmailNguoiNhan?.ToLowerInvariant().Contains(key) ?? false))
                .ToList();
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
            bool daKichHoatGift = false;

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
                            bool laDonHangGiftCode = string.Equals(donHang.LoaiDonHang, LoaiDonHangGiftCode, StringComparison.OrdinalIgnoreCase);
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

                            if (!laDonHangGiftCode)
                            {
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
                            }
                            else
                            {
                                var gift = await _dbContext.MaQuaTangHocViens
                                    .FirstOrDefaultAsync(x => x.MaDonHang == donHang.MaDonHang);
                                if (gift != null && string.Equals(gift.TrangThai, TrangThaiGiftChoThanhToan, StringComparison.OrdinalIgnoreCase))
                                {
                                    gift.TrangThai = TrangThaiGiftSanSang;
                                    gift.ActivatedAt = thoiGianHienTai;
                                    daKichHoatGift = true;
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
                                    var soTienNenTang = TinhPhiNenTang(donHang.TongTien);
                                    _dbContext.DoanhThuGiangViens.Add(new DoanhThuGiangVienModel
                                    {
                                        MaGiangVien = khoaHocDauTien.MaGiangVien,
                                        MaDonHang = donHang.MaDonHang,
                                        TongTienDonHang = donHang.TongTien,
                                        PhiNenTang = soTienNenTang,
                                        ThucNhanGiangVien = TinhTienThucNhanGiangVien(donHang.TongTien),
                                        TrangThaiDoiSoat = "PENDING",
                                        CreatedAt = thoiGianHienTai
                                    });
                                }
                            }

                            await CongLuotVoucherNeuCanAsync(donHang);
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

            if (daKichHoatGift)
            {
                try
                {
                    await GuiEmailKhiKichHoatMaQuaTangAsync(maDonHang);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Không gửi được email kích hoạt mã quà tặng sau khi admin chấp thuận hỗ trợ cho đơn {MaDonHang}", maDonHang);
                }
            }
            else if (daMoKhoaMoi || maDonHang > 0)
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

                    bool laDonHangGiftCode = string.Equals(donHang.LoaiDonHang, LoaiDonHangGiftCode, StringComparison.OrdinalIgnoreCase);
                    if (!laDonHangGiftCode)
                    {
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
                            var soTienNenTang = TinhPhiNenTang(donHang.TongTien);
                            _dbContext.DoanhThuGiangViens.Add(new DoanhThuGiangVienModel
                            {
                                MaGiangVien = khoaHocDauTien.MaGiangVien,
                                MaDonHang = donHang.MaDonHang,
                                TongTienDonHang = donHang.TongTien,
                                PhiNenTang = soTienNenTang,
                                ThucNhanGiangVien = TinhTienThucNhanGiangVien(donHang.TongTien),
                                TrangThaiDoiSoat = "PENDING",
                                CreatedAt = thoiGianHienTai
                            });
                        }
                    }

                    if (laDonHangGiftCode)
                    {
                        var gift = await _dbContext.MaQuaTangHocViens
                            .FirstOrDefaultAsync(x => x.MaDonHang == donHang.MaDonHang);
                        if (gift != null && string.Equals(gift.TrangThai, TrangThaiGiftChoThanhToan, StringComparison.OrdinalIgnoreCase))
                        {
                            gift.TrangThai = TrangThaiGiftSanSang;
                            gift.ActivatedAt = thoiGianHienTai;
                        }
                    }

                    await CongLuotVoucherNeuCanAsync(donHang);

                    await _dbContext.SaveChangesAsync();
                    await giaoDich.CommitAsync();

                    if (!laDonHangGiftCode)
                    {
                        try
                        {
                            await _thanhToanEmailService.GuiThongBaoThanhToanThanhCongHocVienAsync(donHang.MaDonHang);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Không gửi được email thanh toán cho đơn {MaDonHang}", donHang.MaDonHang);
                        }
                    }
                    else
                    {
                        try
                        {
                            await GuiEmailKhiKichHoatMaQuaTangAsync(donHang.MaDonHang);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Không gửi được email kích hoạt mã quà tặng cho đơn {MaDonHang}", donHang.MaDonHang);
                        }
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

        private sealed class ThongTinGiamGiaTinhToan
        {
            public MaGiamGiaModel? Voucher { get; init; }
            public decimal SoTienGiam { get; init; }
            public decimal TongTienSauGiam { get; init; }
        }

        private async Task<ThongTinGiamGiaTinhToan> TinhGiamGiaHopLeAsync(
            string? maVoucher,
            int maNguoiDung,
            int maKhoaHoc,
            decimal tongTienGoc,
            bool laDonQuaTang)
        {
            if (string.IsNullOrWhiteSpace(maVoucher))
            {
                return new ThongTinGiamGiaTinhToan { SoTienGiam = 0, TongTienSauGiam = tongTienGoc };
            }

            string code = maVoucher.Trim().ToUpperInvariant();
            var voucher = await _dbContext.MaGiamGias
                .Include(x => x.DanhSachKhoaHocApDung)
                .FirstOrDefaultAsync(x => x.Code == code);

            if (voucher == null || !voucher.KichHoat)
            {
                throw new ApplicationException("Mã giảm giá không tồn tại hoặc đã ngừng hoạt động.");
            }

            var now = DateTime.UtcNow;
            if (voucher.BatDauAt > now || voucher.KetThucAt < now)
            {
                throw new ApplicationException("Mã giảm giá chưa đến thời gian áp dụng hoặc đã hết hạn.");
            }

            if (voucher.SoLuongToiDa > 0 && voucher.SoLuongDaDung >= voucher.SoLuongToiDa)
            {
                throw new ApplicationException("Mã giảm giá đã hết lượt sử dụng.");
            }

            bool daDungTruocDo = await _dbContext.DonHangKhoaHocs
                .AnyAsync(x => x.MaNguoiDung == maNguoiDung
                               && x.MaVoucher == voucher.MaVoucher
                               && x.TrangThaiDonHang == "PAID");
            if (daDungTruocDo)
            {
                throw new ApplicationException("Bạn đã sử dụng mã giảm giá này trước đó.");
            }

            if (laDonQuaTang && !voucher.ChoPhepApDungChoQuaTang)
            {
                throw new ApplicationException("Mã giảm giá này không áp dụng cho đơn quà tặng.");
            }

            if (string.Equals(voucher.PhamViApDung, "ALL_TEACHER_COURSES", StringComparison.OrdinalIgnoreCase))
            {
                bool hopLe = await _dbContext.KhoaHocs
                    .AnyAsync(x => x.MaKhoaHoc == maKhoaHoc && x.MaGiangVien == voucher.MaNguoiTao);
                if (!hopLe)
                {
                    throw new ApplicationException("Mã giảm giá không áp dụng cho khóa học này.");
                }
            }
            else
            {
                bool hopLe = voucher.DanhSachKhoaHocApDung.Any(x => x.MaKhoaHoc == maKhoaHoc);
                if (!hopLe)
                {
                    throw new ApplicationException("Mã giảm giá không áp dụng cho khóa học này.");
                }
            }

            decimal soTienGiam = voucher.LoaiGiamGia == LoaiGiamGiaPhanTram
                ? Math.Round(tongTienGoc * voucher.GiaTriGiam / 100m, 2)
                : voucher.GiaTriGiam;

            if (voucher.LoaiGiamGia == LoaiGiamGiaPhanTram && voucher.GiamToiDa.HasValue)
            {
                soTienGiam = Math.Min(soTienGiam, voucher.GiamToiDa.Value);
            }

            soTienGiam = Math.Clamp(soTienGiam, 0, tongTienGoc);
            return new ThongTinGiamGiaTinhToan
            {
                Voucher = voucher,
                SoTienGiam = soTienGiam,
                TongTienSauGiam = tongTienGoc - soTienGiam
            };
        }

        private async Task CongLuotVoucherNeuCanAsync(DonHangKhoaHocModel donHang)
        {
            if (!donHang.MaVoucher.HasValue)
            {
                return;
            }

            var voucher = await _dbContext.MaGiamGias.FirstOrDefaultAsync(x => x.MaVoucher == donHang.MaVoucher.Value);
            if (voucher == null)
            {
                return;
            }

            voucher.SoLuongDaDung += 1;
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

        private string TaoCodeQuaTang()
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            string part1 = new(Enumerable.Range(0, 4).Select(_ => chars[Random.Shared.Next(chars.Length)]).ToArray());
            string part2 = new(Enumerable.Range(0, 4).Select(_ => chars[Random.Shared.Next(chars.Length)]).ToArray());
            string part3 = new(Enumerable.Range(0, 4).Select(_ => chars[Random.Shared.Next(chars.Length)]).ToArray());
            return $"EDG-{part1}-{part2}-{part3}";
        }

        private async Task GuiEmailKhiKichHoatMaQuaTangAsync(int maDonHang)
        {
            var duLieu = await _dbContext.MaQuaTangHocViens
                .AsNoTracking()
                .Include(x => x.KhoaHoc)
                .Include(x => x.NguoiTang)
                .FirstOrDefaultAsync(x => x.MaDonHang == maDonHang);

            if (duLieu == null || string.IsNullOrWhiteSpace(duLieu.NguoiTang.Email))
            {
                return;
            }

            string tenNguoiTang = duLieu.NguoiTang.HoTen ?? duLieu.NguoiTang.TaiKhoan;
            string subject = $"EduCodeAI - Mã quà tặng {duLieu.Code} đã sẵn sàng";
            string body = $@"
<div style='font-family: Arial, sans-serif; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;'>
  <h2 style='color: #2563eb; margin-top: 0;'>Mã quà tặng đã kích hoạt</h2>
  <p>Chào <b>{WebUtility.HtmlEncode(tenNguoiTang)}</b>,</p>
  <p>Thanh toán quà tặng cho khóa <b>{WebUtility.HtmlEncode(duLieu.KhoaHoc.TenKhoaHoc)}</b> đã thành công.</p>
  <p>Mã quà tặng của bạn là: <b>{WebUtility.HtmlEncode(duLieu.Code)}</b></p>
  <p>Hãy gửi mã này cho người nhận để họ nhập và mở khóa học.</p>
</div>";
            await Helpers.EmailHelper.SendEmailAsync(duLieu.NguoiTang.Email!, subject, body);
        }

        private async Task GuiEmailKhiRedeemMaQuaTangAsync(int maQuaTang, int maNguoiNhan)
        {
            var duLieu = await _dbContext.MaQuaTangHocViens
                .AsNoTracking()
                .Include(x => x.KhoaHoc)
                .Include(x => x.NguoiTang)
                .Include(x => x.NguoiNhan)
                .FirstOrDefaultAsync(x => x.MaQuaTang == maQuaTang);

            if (duLieu == null)
            {
                return;
            }

            string tenKhoaHoc = duLieu.KhoaHoc.TenKhoaHoc;
            string tenNguoiNhan = duLieu.NguoiNhan?.HoTen ?? duLieu.NguoiNhan?.TaiKhoan ?? $"Học viên #{maNguoiNhan}";

            if (!string.IsNullOrWhiteSpace(duLieu.NguoiTang.Email))
            {
                string subjectTang = "EduCodeAI - Mã quà tặng đã được sử dụng";
                string bodyTang = $@"
<div style='font-family: Arial, sans-serif; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;'>
  <h2 style='color: #16a34a; margin-top: 0;'>Mã quà tặng đã được nhận</h2>
  <p>Mã <b>{WebUtility.HtmlEncode(duLieu.Code)}</b> đã được học viên <b>{WebUtility.HtmlEncode(tenNguoiNhan)}</b> sử dụng thành công.</p>
  <p>Khóa học: <b>{WebUtility.HtmlEncode(tenKhoaHoc)}</b></p>
</div>";
                await Helpers.EmailHelper.SendEmailAsync(duLieu.NguoiTang.Email!, subjectTang, bodyTang);
            }

            if (!string.IsNullOrWhiteSpace(duLieu.NguoiNhan?.Email))
            {
                string subjectNhan = "EduCodeAI - Bạn đã nhận quà tặng khóa học";
                string bodyNhan = $@"
<div style='font-family: Arial, sans-serif; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;'>
  <h2 style='color: #16a34a; margin-top: 0;'>Nhận quà tặng thành công</h2>
  <p>Bạn đã nhập mã <b>{WebUtility.HtmlEncode(duLieu.Code)}</b> thành công.</p>
  <p>Khóa học: <b>{WebUtility.HtmlEncode(tenKhoaHoc)}</b> đã được mở trong tài khoản của bạn.</p>
</div>";
                await Helpers.EmailHelper.SendEmailAsync(duLieu.NguoiNhan.Email!, subjectNhan, bodyNhan);
            }
        }

        private string TaoNoiDungChuyenKhoan(int maDonHang)
        {
            return $"EDU{maDonHang}";
        }

        private decimal LayTyLePhiNenTang()
        {
            string? raw = _cauHinh["ThanhToan:TyLePhiNenTang"];
            if (string.IsNullOrWhiteSpace(raw))
            {
                return TyLePhiNenTangMacDinh;
            }

            if (!decimal.TryParse(raw, out var tyLe))
            {
                return TyLePhiNenTangMacDinh;
            }

            // Cho phép cấu hình dạng 20 hoặc 0.2
            if (tyLe > 1m)
            {
                tyLe /= 100m;
            }

            return decimal.Clamp(tyLe, 0m, 1m);
        }

        private decimal TinhPhiNenTang(decimal tongTien)
        {
            return Math.Round(tongTien * LayTyLePhiNenTang(), 2);
        }

        private decimal TinhTienThucNhanGiangVien(decimal tongTien)
        {
            return tongTien - TinhPhiNenTang(tongTien);
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
