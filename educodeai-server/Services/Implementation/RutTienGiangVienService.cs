using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using educodeai_server.Common;
using educodeai_server.Data;
using educodeai_server.DTOs.RutTienGiangVien;
using educodeai_server.DTOs.ThanhToan;
using educodeai_server.Models;
using educodeai_server.Config;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace educodeai_server.Services.Implementation
{
    public class RutTienGiangVienService : IRutTienGiangVienService
    {
        private readonly EduCodeAIDbContext _dbContext;
        private readonly IVietQrLookupApiService _vietQrLookup;
        private readonly VietQrLookupOptions _vietQrLookupOptions;

        public RutTienGiangVienService(
            EduCodeAIDbContext dbContext,
            IVietQrLookupApiService vietQrLookup,
            IOptions<VietQrLookupOptions> vietQrLookupOptions)
        {
            _dbContext = dbContext;
            _vietQrLookup = vietQrLookup;
            _vietQrLookupOptions = vietQrLookupOptions.Value;
        }

        public Task<IReadOnlyList<NganHangItemDTO>> LayDanhMucNganHangAsync()
        {
            return Task.FromResult(DanhMucNganHangLienKet.LayDanhSach());
        }

        public async Task<ThongTinViGiangVienDTO> LayThongTinViAsync(int maGiangVien)
        {
            var giangVien = await _dbContext.NguoiDungs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaNguoiDung == maGiangVien && x.VaiTro == 1);

            if (giangVien == null)
            {
                throw new ApplicationException("Không tìm thấy tài khoản giảng viên.");
            }

            var (tongDoanhThuDaGhiNhan, tongDangChoXuLyRut, tongDaChuyenKhoan) = await TinhToanSoDuViAsync(maGiangVien);

            var nganHangTheoVietQr = DanhMucNganHangLienKet.TimTheoMaVietQr(giangVien.MaNganHangNhanTien);

            return new ThongTinViGiangVienDTO
            {
                TongDoanhThuDaGhiNhan = tongDoanhThuDaGhiNhan,
                TongDangChoXuLyRut = tongDangChoXuLyRut,
                TongDaChuyenKhoan = tongDaChuyenKhoan,
                SoDuKhaDung = Math.Max(0, tongDoanhThuDaGhiNhan - tongDangChoXuLyRut),
                MaNganHangNhanTien = giangVien.MaNganHangNhanTien,
                MaNganHangChon = nganHangTheoVietQr?.Ma,
                SoTaiKhoanNhanTien = giangVien.SoTaiKhoanNhanTien,
                TenTaiKhoanNhanTien = giangVien.TenTaiKhoanNhanTien
            };
        }

        public async Task<ThongTinViGiangVienDTO> ThemTaiKhoanNhanTienAsync(int maGiangVien, CapNhatTaiKhoanRutTienDTO yeuCau)
        {
            var giangVien = await _dbContext.NguoiDungs
                .FirstOrDefaultAsync(x => x.MaNguoiDung == maGiangVien && x.VaiTro == 1);

            if (giangVien == null)
            {
                throw new ApplicationException("Không tìm thấy tài khoản giảng viên.");
            }

            bool daCoTaiKhoanNhanTien =
                !string.IsNullOrWhiteSpace(giangVien.MaNganHangNhanTien) ||
                !string.IsNullOrWhiteSpace(giangVien.SoTaiKhoanNhanTien) ||
                !string.IsNullOrWhiteSpace(giangVien.TenTaiKhoanNhanTien);

            if (daCoTaiKhoanNhanTien)
            {
                throw new ApplicationException("Giảng viên đã có tài khoản nhận tiền. Vui lòng xóa tài khoản hiện tại trước khi thêm mới.");
            }

            var nganHang = DanhMucNganHangLienKet.TimTheoMa(yeuCau.MaNganHangNhanTien);
            if (nganHang == null)
            {
                throw new ApplicationException("Ngân hàng không nằm trong danh mục được phép.");
            }

            giangVien.MaNganHangNhanTien = nganHang.MaVietQr;
            giangVien.SoTaiKhoanNhanTien = yeuCau.SoTaiKhoanNhanTien.Trim();
            giangVien.TenTaiKhoanNhanTien = yeuCau.TenTaiKhoanNhanTien.Trim().ToUpperInvariant();

            await _dbContext.SaveChangesAsync();
            return await LayThongTinViAsync(maGiangVien);
        }

        public async Task<KetQuaKiemTraTaiKhoanDTO> KiemTraTaiKhoanNganHangAsync(int maGiangVien, KiemTraTaiKhoanDTO yeuCau)
        {
            var giangVien = await _dbContext.NguoiDungs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.MaNguoiDung == maGiangVien && x.VaiTro == 1);

            if (giangVien == null)
            {
                throw new ApplicationException("Không tìm thấy tài khoản giảng viên.");
            }

            NganHangItemDTO? nganHang = DanhMucNganHangLienKet.TimTheoMa(yeuCau.MaNganHang);
            if (nganHang == null)
            {
                return new KetQuaKiemTraTaiKhoanDTO
                {
                    ThongBao = "Ngân hàng không nằm trong danh mục được phép."
                };
            }

            if (string.IsNullOrWhiteSpace(nganHang.MaBin) ||
                !int.TryParse(nganHang.MaBin, NumberStyles.Integer, CultureInfo.InvariantCulture, out int maBin))
            {
                return new KetQuaKiemTraTaiKhoanDTO
                {
                    ThongBao =
                        "Ngân hàng NAPAS không có mã BIN cố định — vui lòng chọn một ngân hàng cụ thể để tra cứu qua VietQR.io."
                };
            }

            if (string.IsNullOrWhiteSpace(_vietQrLookupOptions.ClientId) ||
                string.IsNullOrWhiteSpace(_vietQrLookupOptions.ApiKey))
            {
                return new KetQuaKiemTraTaiKhoanDTO
                {
                    ThieuCauHinhVietQrLookup = true,
                    ThongBao =
                        "Chưa cấu hình VietQR.io tra cứu STK trên server (VietQrLookup:ClientId, VietQrLookup:ApiKey). " +
                        "Đăng ký tại https://my.vietqr.io/ và thêm User Secrets, ví dụ: " +
                        "dotnet user-secrets set \"VietQrLookup:ClientId\" \"...\" ; " +
                        "dotnet user-secrets set \"VietQrLookup:ApiKey\" \"...\" . " +
                        "Base URL mặc định: https://api.vietqr.io/v2"
                };
            }

            VietQrTraCuuKetQua kq;
            try
            {
                kq = await _vietQrLookup.TraCuuTaiKhoanAsync(maBin, yeuCau.SoTaiKhoan);
            }
            catch (Exception ex)
            {
                return new KetQuaKiemTraTaiKhoanDTO
                {
                    ThongBao = "Không gọi được VietQR.io: " + ex.Message
                };
            }

            if (!kq.ThanhCong)
            {
                return new KetQuaKiemTraTaiKhoanDTO
                {
                    TimThayTaiKhoan = false,
                    ThongBao = kq.MoTa ?? "VietQR.io không tra cứu được tài khoản."
                };
            }

            string? tenTuVietQr = kq.AccountName;
            if (string.IsNullOrWhiteSpace(tenTuVietQr))
            {
                return new KetQuaKiemTraTaiKhoanDTO
                {
                    TimThayTaiKhoan = true,
                    TenKhop = false,
                    ThongBao =
                        "Tra cứu thành công nhưng phản hồi không kèm tên chủ tài khoản. Hãy tự đối chiếu với giấy tờ."
                };
            }

            bool tenKhop = SoSanhTenGanDung(tenTuVietQr, yeuCau.TenChuTaiKhoan);

            return new KetQuaKiemTraTaiKhoanDTO
            {
                TimThayTaiKhoan = true,
                TenKhop = tenKhop,
                TenChuTaiKhoanTuVietQr = tenTuVietQr,
                ThongBao = tenKhop
                    ? "Tên chủ tài khoản khớp với dữ liệu VietQR.io."
                    : "Tên chủ tài khoản không khớp với dữ liệu VietQR.io. Vui lòng kiểm tra lại số tài khoản hoặc tên chủ tài khoản."
            };
        }

        public async Task<ThongTinViGiangVienDTO> XoaTaiKhoanNhanTienAsync(int maGiangVien)
        {
            var giangVien = await _dbContext.NguoiDungs
                .FirstOrDefaultAsync(x => x.MaNguoiDung == maGiangVien && x.VaiTro == 1);

            if (giangVien == null)
            {
                throw new ApplicationException("Không tìm thấy tài khoản giảng viên.");
            }

            giangVien.MaNganHangNhanTien = null;
            giangVien.SoTaiKhoanNhanTien = null;
            giangVien.TenTaiKhoanNhanTien = null;

            await _dbContext.SaveChangesAsync();
            return await LayThongTinViAsync(maGiangVien);
        }

        public async Task<YeuCauRutTienChiTietDTO> TaoYeuCauRutTienAsync(int maGiangVien, YeuCauRutTienDTO yeuCau)
        {
            var giangVien = await _dbContext.NguoiDungs
                .FirstOrDefaultAsync(x => x.MaNguoiDung == maGiangVien && x.VaiTro == 1);

            if (giangVien == null)
            {
                throw new ApplicationException("Không tìm thấy tài khoản giảng viên.");
            }

            if (string.IsNullOrWhiteSpace(giangVien.MaNganHangNhanTien) ||
                string.IsNullOrWhiteSpace(giangVien.SoTaiKhoanNhanTien) ||
                string.IsNullOrWhiteSpace(giangVien.TenTaiKhoanNhanTien))
            {
                throw new ApplicationException("Vui lòng cập nhật thông tin nhận tiền trước khi gửi yêu cầu rút.");
            }

            var (tongDoanhThuDaGhiNhan, tongDangChoXuLyRut, _) = await TinhToanSoDuViAsync(maGiangVien);
            var soDuKhaDung = tongDoanhThuDaGhiNhan - tongDangChoXuLyRut;

            if (yeuCau.SoTienYeuCau > soDuKhaDung)
            {
                throw new ApplicationException("Số dư khả dụng không đủ để thực hiện yêu cầu rút.");
            }

            var banGhi = new YeuCauRutTienGiangVienModel
            {
                MaGiangVien = maGiangVien,
                SoTienYeuCau = yeuCau.SoTienYeuCau,
                TrangThaiYeuCau = "CHO_DUYET",
                LoaiTien = "VND",
                MaNganHangNhan = giangVien.MaNganHangNhanTien!,
                SoTaiKhoanNhan = giangVien.SoTaiKhoanNhanTien!,
                TenTaiKhoanNhan = giangVien.TenTaiKhoanNhanTien!,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.YeuCauRutTienGiangViens.Add(banGhi);
            await _dbContext.SaveChangesAsync();

            return await MapChiTietYeuCauAsync(banGhi.MaYeuCauRutTien);
        }

        public async Task<List<YeuCauRutTienChiTietDTO>> LayLichSuRutTienCuaGiangVienAsync(int maGiangVien)
        {
            return await _dbContext.YeuCauRutTienGiangViens
                .AsNoTracking()
                .Where(x => x.MaGiangVien == maGiangVien)
                .OrderByDescending(x => x.CreatedAt)
                .Select(MapChiTiet())
                .ToListAsync();
        }

        public async Task<List<YeuCauRutTienChiTietDTO>> LayDanhSachChoDoiSoatAsync(string? trangThai)
        {
            IQueryable<YeuCauRutTienGiangVienModel> query = _dbContext.YeuCauRutTienGiangViens
                .AsNoTracking()
                .Include(x => x.GiangVien)
                .OrderByDescending(x => x.CreatedAt);

            if (!string.IsNullOrWhiteSpace(trangThai))
            {
                string trangThaiCanLoc = trangThai.Trim().ToUpperInvariant();
                query = query.Where(x => x.TrangThaiYeuCau == trangThaiCanLoc);
            }

            return await query
                .Select(MapChiTiet())
                .ToListAsync();
        }

        public async Task<YeuCauRutTienChiTietDTO> DuyetYeuCauVaTaoQrAsync(int maYeuCauRutTien, int maQuanTriVien, DuyetYeuCauRutTienDTO? yeuCau)
        {
            var banGhi = await _dbContext.YeuCauRutTienGiangViens
                .Include(x => x.GiangVien)
                .FirstOrDefaultAsync(x => x.MaYeuCauRutTien == maYeuCauRutTien);

            if (banGhi == null)
            {
                throw new ApplicationException("Không tìm thấy yêu cầu rút tiền.");
            }

            if (!string.Equals(banGhi.TrangThaiYeuCau, "CHO_DUYET", StringComparison.OrdinalIgnoreCase))
            {
                throw new ApplicationException("Yêu cầu này không còn ở trạng thái chờ duyệt.");
            }

            banGhi.TrangThaiYeuCau = "CHO_CHUYEN_KHOAN";
            banGhi.DuyetLuc = DateTime.UtcNow;
            banGhi.MaQuanTriVienDuyet = maQuanTriVien;
            banGhi.GhiChuAdmin = string.IsNullOrWhiteSpace(yeuCau?.GhiChuAdmin) ? null : yeuCau!.GhiChuAdmin!.Trim();
            banGhi.NoiDungChuyenKhoan = TaoNoiDungRutTien(banGhi.MaYeuCauRutTien);
            banGhi.DuongDanAnhQr = TaoDuongDanQrRutTien(
                banGhi.MaNganHangNhan,
                banGhi.SoTaiKhoanNhan,
                banGhi.TenTaiKhoanNhan,
                banGhi.SoTienYeuCau,
                banGhi.NoiDungChuyenKhoan);

            await _dbContext.SaveChangesAsync();
            return await MapChiTietYeuCauAsync(maYeuCauRutTien);
        }

        public async Task<YeuCauRutTienChiTietDTO> TuChoiYeuCauAsync(int maYeuCauRutTien, int maQuanTriVien, TuChoiYeuCauRutTienDTO yeuCau)
        {
            var banGhi = await _dbContext.YeuCauRutTienGiangViens
                .Include(x => x.GiangVien)
                .FirstOrDefaultAsync(x => x.MaYeuCauRutTien == maYeuCauRutTien);

            if (banGhi == null)
            {
                throw new ApplicationException("Không tìm thấy yêu cầu rút tiền.");
            }

            if (!string.Equals(banGhi.TrangThaiYeuCau, "CHO_DUYET", StringComparison.OrdinalIgnoreCase))
            {
                throw new ApplicationException("Yêu cầu này không còn ở trạng thái chờ duyệt.");
            }

            banGhi.TrangThaiYeuCau = "TU_CHOI";
            banGhi.DuyetLuc = DateTime.UtcNow;
            banGhi.MaQuanTriVienDuyet = maQuanTriVien;
            banGhi.GhiChuAdmin = yeuCau.LyDoTuChoi.Trim();

            await _dbContext.SaveChangesAsync();
            return await MapChiTietYeuCauAsync(maYeuCauRutTien);
        }

        public async Task<bool> XuLyWebhookRutTienAsync(ThongBaoWebhookSePayDTO duLieuWebhook)
        {
            if (!string.Equals(duLieuWebhook.transferType, "out", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            var ketQuaTimMa = Regex.Match(duLieuWebhook.content?.ToUpperInvariant() ?? string.Empty, @"RUT(\d+)");
            if (!ketQuaTimMa.Success || !int.TryParse(ketQuaTimMa.Groups[1].Value, out var maYeuCauRutTien))
            {
                return false;
            }

            var banGhi = await _dbContext.YeuCauRutTienGiangViens
                .FirstOrDefaultAsync(x => x.MaYeuCauRutTien == maYeuCauRutTien);

            if (banGhi == null)
            {
                return false;
            }

            if (string.Equals(banGhi.TrangThaiYeuCau, "DA_CHUYEN_KHOAN", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            if (!string.Equals(banGhi.TrangThaiYeuCau, "CHO_CHUYEN_KHOAN", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            if (duLieuWebhook.transferAmount + 1000 < banGhi.SoTienYeuCau)
            {
                return false;
            }

            banGhi.TrangThaiYeuCau = "DA_CHUYEN_KHOAN";
            banGhi.SoTienDaChuyen = duLieuWebhook.transferAmount;
            banGhi.MaGiaoDichSePay = duLieuWebhook.id;
            banGhi.ChuyenKhoanThanhCongLuc = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
            return true;
        }

        private async Task<(decimal tongDoanhThuDaGhiNhan, decimal tongDangChoXuLyRut, decimal tongDaChuyenKhoan)> TinhToanSoDuViAsync(int maGiangVien)
        {
            decimal tongDoanhThuDaGhiNhan = await _dbContext.DoanhThuGiangViens
                .AsNoTracking()
                .Where(x => x.MaGiangVien == maGiangVien)
                .SumAsync(x => (decimal?)x.ThucNhanGiangVien) ?? 0;

            decimal tongDangChoXuLyRut = await _dbContext.YeuCauRutTienGiangViens
                .AsNoTracking()
                .Where(x => x.MaGiangVien == maGiangVien &&
                            (x.TrangThaiYeuCau == "CHO_DUYET" ||
                             x.TrangThaiYeuCau == "CHO_CHUYEN_KHOAN" ||
                             x.TrangThaiYeuCau == "DA_CHUYEN_KHOAN"))
                .SumAsync(x => (decimal?)x.SoTienYeuCau) ?? 0;

            decimal tongDaChuyenKhoan = await _dbContext.YeuCauRutTienGiangViens
                .AsNoTracking()
                .Where(x => x.MaGiangVien == maGiangVien && x.TrangThaiYeuCau == "DA_CHUYEN_KHOAN")
                .SumAsync(x => (decimal?)x.SoTienYeuCau) ?? 0;

            return (tongDoanhThuDaGhiNhan, tongDangChoXuLyRut, tongDaChuyenKhoan);
        }

        private static string TaoNoiDungRutTien(int maYeuCauRutTien)
        {
            return $"RUT{maYeuCauRutTien}";
        }

        private static string TaoDuongDanQrRutTien(
            string maNganHangNhan,
            string soTaiKhoanNhan,
            string tenTaiKhoanNhan,
            decimal soTien,
            string noiDungChuyenKhoan)
        {
            return $"https://img.vietqr.io/image/{maNganHangNhan}-{soTaiKhoanNhan}-compact2.png?amount={soTien:0}&addInfo={noiDungChuyenKhoan}&accountName={Uri.EscapeDataString(tenTaiKhoanNhan)}";
        }

        private async Task<YeuCauRutTienChiTietDTO> MapChiTietYeuCauAsync(int maYeuCauRutTien)
        {
            var duLieu = await _dbContext.YeuCauRutTienGiangViens
                .AsNoTracking()
                .Include(x => x.GiangVien)
                .FirstOrDefaultAsync(x => x.MaYeuCauRutTien == maYeuCauRutTien);

            if (duLieu == null)
            {
                throw new ApplicationException("Không tìm thấy yêu cầu rút tiền.");
            }

            return MapChiTietNoiBo(duLieu);
        }

        private static System.Linq.Expressions.Expression<Func<YeuCauRutTienGiangVienModel, YeuCauRutTienChiTietDTO>> MapChiTiet()
        {
            return x => new YeuCauRutTienChiTietDTO
            {
                MaYeuCauRutTien = x.MaYeuCauRutTien,
                MaGiangVien = x.MaGiangVien,
                TenGiangVien = x.GiangVien.HoTen ?? $"Giang vien #{x.MaGiangVien}",
                EmailGiangVien = x.GiangVien.Email,
                SoTienYeuCau = x.SoTienYeuCau,
                TrangThaiYeuCau = x.TrangThaiYeuCau,
                LoaiTien = x.LoaiTien,
                MaNganHangNhan = x.MaNganHangNhan,
                SoTaiKhoanNhan = x.SoTaiKhoanNhan,
                TenTaiKhoanNhan = x.TenTaiKhoanNhan,
                NoiDungChuyenKhoan = x.NoiDungChuyenKhoan,
                DuongDanAnhQr = x.DuongDanAnhQr,
                SoTienDaChuyen = x.SoTienDaChuyen,
                MaGiaoDichSePay = x.MaGiaoDichSePay,
                GhiChuAdmin = x.GhiChuAdmin,
                CreatedAt = x.CreatedAt,
                DuyetLuc = x.DuyetLuc,
                ChuyenKhoanThanhCongLuc = x.ChuyenKhoanThanhCongLuc
            };
        }

        private static YeuCauRutTienChiTietDTO MapChiTietNoiBo(YeuCauRutTienGiangVienModel x)
        {
            return new YeuCauRutTienChiTietDTO
            {
                MaYeuCauRutTien = x.MaYeuCauRutTien,
                MaGiangVien = x.MaGiangVien,
                TenGiangVien = x.GiangVien.HoTen ?? $"Giang vien #{x.MaGiangVien}",
                EmailGiangVien = x.GiangVien.Email,
                SoTienYeuCau = x.SoTienYeuCau,
                TrangThaiYeuCau = x.TrangThaiYeuCau,
                LoaiTien = x.LoaiTien,
                MaNganHangNhan = x.MaNganHangNhan,
                SoTaiKhoanNhan = x.SoTaiKhoanNhan,
                TenTaiKhoanNhan = x.TenTaiKhoanNhan,
                NoiDungChuyenKhoan = x.NoiDungChuyenKhoan,
                DuongDanAnhQr = x.DuongDanAnhQr,
                SoTienDaChuyen = x.SoTienDaChuyen,
                MaGiaoDichSePay = x.MaGiaoDichSePay,
                GhiChuAdmin = x.GhiChuAdmin,
                CreatedAt = x.CreatedAt,
                DuyetLuc = x.DuyetLuc,
                ChuyenKhoanThanhCongLuc = x.ChuyenKhoanThanhCongLuc
            };
        }

        private static bool SoSanhTenGanDung(string? tenTuApi, string? tenNguoiNhap)
        {
            string a = ChuanHoaTenKhongDau(tenTuApi);
            string b = ChuanHoaTenKhongDau(tenNguoiNhap);
            if (string.IsNullOrEmpty(a) || string.IsNullOrEmpty(b))
            {
                return false;
            }

            return string.Equals(a, b, StringComparison.OrdinalIgnoreCase);
        }

        private static string ChuanHoaTenKhongDau(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return string.Empty;
            }

            string normalized = input.Trim().Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();
            foreach (char c in normalized)
            {
                UnicodeCategory cat = CharUnicodeInfo.GetUnicodeCategory(c);
                if (cat != UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }

            string ketQua = sb.ToString().Normalize(NormalizationForm.FormC);
            return string.Join(' ', ketQua.Split(' ', StringSplitOptions.RemoveEmptyEntries))
                .ToUpperInvariant();
        }
    }
}
