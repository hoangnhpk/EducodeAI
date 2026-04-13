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
        private readonly EduCodeAIDbContext _dbContext;
        private readonly IConfiguration _cauHinh;

        public ThanhToanKhoaHocService(EduCodeAIDbContext dbContext, IConfiguration cauHinh)
        {
            _dbContext = dbContext;
            _cauHinh = cauHinh;
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

            DonHangKhoaHocModel donHang;
            if (donHangCho != null)
            {
                donHang = donHangCho;
            }
            else
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
                return true;
            }
            catch
            {
                await giaoDich.RollbackAsync();
                throw;
            }
        }

        private string TaoNoiDungChuyenKhoan(int maDonHang)
        {
            return $"EDU{maDonHang}";
        }

        private string TaoDuongDanAnhQr(decimal soTien, string noiDungChuyenKhoan)
        {
            string maNganHang = _cauHinh["ThanhToanSePay:MaNganHang"] ?? "BIDV";
            string soTaiKhoan = _cauHinh["ThanhToanSePay:SoTaiKhoan"] ?? "962470Y7UF";
            string tenTaiKhoan = _cauHinh["ThanhToanSePay:TenTaiKhoan"] ?? "NGUYEN HUY HOANG";

            return $"https://img.vietqr.io/image/{maNganHang}-{soTaiKhoan}-compact2.png?amount={soTien:0}&addInfo={noiDungChuyenKhoan}&accountName={Uri.EscapeDataString(tenTaiKhoan)}";
        }
    }
}
