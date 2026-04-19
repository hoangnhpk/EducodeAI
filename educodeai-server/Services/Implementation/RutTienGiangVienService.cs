using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using educodeai_server.Common;
using educodeai_server.Data;
using educodeai_server.DTOs.RutTienGiangVien;
using educodeai_server.DTOs.ThanhToan;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class RutTienGiangVienService : IRutTienGiangVienService
    {
        private readonly EduCodeAIDbContext _dbContext;

        public RutTienGiangVienService(EduCodeAIDbContext dbContext)
        {
            _dbContext = dbContext;
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

            banGhi.NoiDungChuyenKhoan = await TaoMaNoiDungChuyenKhoanDocNhatAsync();
            banGhi.DuongDanAnhQr = TaoDuongDanQrRutTien(
                banGhi.MaNganHangNhan,
                banGhi.SoTaiKhoanNhan,
                banGhi.TenTaiKhoanNhan,
                banGhi.SoTienYeuCau,
                banGhi.NoiDungChuyenKhoan);
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

        public async Task<YeuCauRutTienChiTietDTO> LayChiTietChoQuanTriAsync(int maYeuCauRutTien)
        {
            await DamBaoNoiDungVaQrNeuThieuAsync(maYeuCauRutTien);
            var dto = await MapChiTietYeuCauAsync(maYeuCauRutTien);
            BoSungQrXemTruocNeuCan(dto);
            return dto;
        }

        public async Task<YeuCauRutTienChiTietDTO> XacNhanDaChuyenKhoanThuCongAsync(int maYeuCauRutTien, int maQuanTriVien)
        {
            var banGhi = await _dbContext.YeuCauRutTienGiangViens
                .Include(x => x.GiangVien)
                .FirstOrDefaultAsync(x => x.MaYeuCauRutTien == maYeuCauRutTien);

            if (banGhi == null)
            {
                throw new ApplicationException("Không tìm thấy yêu cầu rút tiền.");
            }

            if (string.Equals(banGhi.TrangThaiYeuCau, "DA_CHUYEN_KHOAN", StringComparison.OrdinalIgnoreCase))
            {
                throw new ApplicationException("Yêu cầu đã được ghi nhận chuyển khoản thành công.");
            }

            if (string.Equals(banGhi.TrangThaiYeuCau, "TU_CHOI", StringComparison.OrdinalIgnoreCase))
            {
                throw new ApplicationException("Yêu cầu đã bị từ chối trước đó.");
            }

            if (!string.Equals(banGhi.TrangThaiYeuCau, "CHO_DUYET", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(banGhi.TrangThaiYeuCau, "CHO_CHUYEN_KHOAN", StringComparison.OrdinalIgnoreCase))
            {
                throw new ApplicationException("Chỉ có thể xác nhận khi yêu cầu đang chờ xử lý hoặc đang chuyển khoản.");
            }

            if (string.IsNullOrWhiteSpace(banGhi.NoiDungChuyenKhoan))
            {
                banGhi.NoiDungChuyenKhoan = await TaoMaNoiDungChuyenKhoanDocNhatAsync();
            }

            if (string.IsNullOrWhiteSpace(banGhi.DuongDanAnhQr))
            {
                banGhi.DuongDanAnhQr = TaoDuongDanQrRutTien(
                    banGhi.MaNganHangNhan,
                    banGhi.SoTaiKhoanNhan,
                    banGhi.TenTaiKhoanNhan,
                    banGhi.SoTienYeuCau,
                    banGhi.NoiDungChuyenKhoan);
            }

            banGhi.TrangThaiYeuCau = "DA_CHUYEN_KHOAN";
            banGhi.SoTienDaChuyen = banGhi.SoTienYeuCau;
            banGhi.ChuyenKhoanThanhCongLuc = DateTime.UtcNow;

            if (banGhi.DuyetLuc == null)
            {
                banGhi.DuyetLuc = DateTime.UtcNow;
                banGhi.MaQuanTriVienDuyet = maQuanTriVien;
            }

            await _dbContext.SaveChangesAsync();
            return await MapChiTietYeuCauAsync(maYeuCauRutTien);
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
            if (string.IsNullOrWhiteSpace(banGhi.NoiDungChuyenKhoan))
            {
                banGhi.NoiDungChuyenKhoan = await TaoMaNoiDungChuyenKhoanDocNhatAsync();
            }

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

            if (!string.Equals(banGhi.TrangThaiYeuCau, "CHO_DUYET", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(banGhi.TrangThaiYeuCau, "CHO_CHUYEN_KHOAN", StringComparison.OrdinalIgnoreCase))
            {
                throw new ApplicationException("Yêu cầu này không thể từ chối ở trạng thái hiện tại.");
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

            var banGhi = await TimYeuCauRutTienTuNoiDungWebhookAsync(duLieuWebhook.content);
            if (banGhi == null)
            {
                return false;
            }

            if (string.Equals(banGhi.TrangThaiYeuCau, "DA_CHUYEN_KHOAN", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            bool dangChoXuLyHoacChoCk =
                string.Equals(banGhi.TrangThaiYeuCau, "CHO_CHUYEN_KHOAN", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(banGhi.TrangThaiYeuCau, "CHO_DUYET", StringComparison.OrdinalIgnoreCase);

            if (!dangChoXuLyHoacChoCk)
            {
                return false;
            }

            if (duLieuWebhook.transferAmount + 1000 < banGhi.SoTienYeuCau)
            {
                return false;
            }

            var luc = DateTime.UtcNow;

            if (string.Equals(banGhi.TrangThaiYeuCau, "CHO_DUYET", StringComparison.OrdinalIgnoreCase))
            {
                banGhi.DuyetLuc = luc;
                if (string.IsNullOrWhiteSpace(banGhi.NoiDungChuyenKhoan))
                {
                    banGhi.NoiDungChuyenKhoan = await TaoMaNoiDungChuyenKhoanDocNhatAsync();
                }
            }

            banGhi.TrangThaiYeuCau = "DA_CHUYEN_KHOAN";
            banGhi.SoTienDaChuyen = duLieuWebhook.transferAmount;
            banGhi.MaGiaoDichSePay = duLieuWebhook.id;
            banGhi.ChuyenKhoanThanhCongLuc = luc;
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

        /// <summary>Bản ghi tạo trước khi có mã ngẫu nhiên (hoặc lỗi lưu) — bổ sung khi admin mở chi tiết.</summary>
        private async Task DamBaoNoiDungVaQrNeuThieuAsync(int maYeuCauRutTien)
        {
            var e = await _dbContext.YeuCauRutTienGiangViens
                .FirstOrDefaultAsync(x => x.MaYeuCauRutTien == maYeuCauRutTien);
            if (e == null)
            {
                return;
            }

            bool trangThaiChoPhepMa =
                string.Equals(e.TrangThaiYeuCau, "CHO_DUYET", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(e.TrangThaiYeuCau, "CHO_CHUYEN_KHOAN", StringComparison.OrdinalIgnoreCase);

            if (!trangThaiChoPhepMa)
            {
                return;
            }

            if (string.IsNullOrWhiteSpace(e.MaNganHangNhan) ||
                string.IsNullOrWhiteSpace(e.SoTaiKhoanNhan) ||
                string.IsNullOrWhiteSpace(e.TenTaiKhoanNhan))
            {
                return;
            }

            bool doi = false;
            if (string.IsNullOrWhiteSpace(e.NoiDungChuyenKhoan))
            {
                e.NoiDungChuyenKhoan = await TaoMaNoiDungChuyenKhoanDocNhatAsync();
                doi = true;
            }

            if (string.IsNullOrWhiteSpace(e.DuongDanAnhQr) && !string.IsNullOrWhiteSpace(e.NoiDungChuyenKhoan))
            {
                e.DuongDanAnhQr = TaoDuongDanQrRutTien(
                    e.MaNganHangNhan,
                    e.SoTaiKhoanNhan,
                    e.TenTaiKhoanNhan,
                    e.SoTienYeuCau,
                    e.NoiDungChuyenKhoan);
                doi = true;
            }

            if (doi)
            {
                await _dbContext.SaveChangesAsync();
            }
        }

        /// <summary>Mã nội dung CK không đoán trước được (đủ dài, duy nhất trong DB). Prefix EDUR phân biệt với mã thanh toán khóa học EDU…</summary>
        private async Task<string> TaoMaNoiDungChuyenKhoanDocNhatAsync()
        {
            const int soByteNgauNhien = 12;
            for (int lan = 0; lan < 10; lan++)
            {
                var bytes = new byte[soByteNgauNhien];
                RandomNumberGenerator.Fill(bytes);
                string token = "EDUR" + Convert.ToHexString(bytes);

                bool trung = await _dbContext.YeuCauRutTienGiangViens
                    .AnyAsync(x => x.NoiDungChuyenKhoan == token);
                if (!trung)
                {
                    return token;
                }
            }

            throw new ApplicationException("Không tạo được mã nội dung chuyển khoản duy nhất.");
        }

        /// <summary>Nhận diện yêu cầu từ nội dung SePay: mã ngẫu nhiên (khớp chính xác hoặc chuỗi con), hoặc định dạng cũ RUT{ma}.</summary>
        private async Task<YeuCauRutTienGiangVienModel?> TimYeuCauRutTienTuNoiDungWebhookAsync(string? content)
        {
            if (string.IsNullOrWhiteSpace(content))
            {
                return null;
            }

            string raw = content.Trim();
            string rawUpper = raw.ToUpperInvariant();

            var legacy = Regex.Match(rawUpper, @"RUT(\d+)");
            if (legacy.Success && int.TryParse(legacy.Groups[1].Value, out int maCu))
            {
                return await _dbContext.YeuCauRutTienGiangViens
                    .FirstOrDefaultAsync(x => x.MaYeuCauRutTien == maCu);
            }

            var choXuLy = await _dbContext.YeuCauRutTienGiangViens
                .Where(x => x.NoiDungChuyenKhoan != null &&
                            (x.TrangThaiYeuCau == "CHO_DUYET" || x.TrangThaiYeuCau == "CHO_CHUYEN_KHOAN"))
                .ToListAsync();

            var khopChinhXac = choXuLy.FirstOrDefault(x =>
                string.Equals(x.NoiDungChuyenKhoan!.Trim(), raw, StringComparison.OrdinalIgnoreCase));
            if (khopChinhXac != null)
            {
                return khopChinhXac;
            }

            foreach (var hang in choXuLy.OrderByDescending(h => h.NoiDungChuyenKhoan!.Length))
            {
                string nd = hang.NoiDungChuyenKhoan!.Trim();
                if (nd.Length >= 8 && rawUpper.Contains(nd.ToUpperInvariant(), StringComparison.Ordinal))
                {
                    return hang;
                }
            }

            return null;
        }

        private static void BoSungQrXemTruocNeuCan(YeuCauRutTienChiTietDTO dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.DuongDanAnhQr))
            {
                return;
            }

            if (!LaTrangThaiCoTheHienQr(dto.TrangThaiYeuCau))
            {
                return;
            }

            if (string.IsNullOrWhiteSpace(dto.NoiDungChuyenKhoan))
            {
                return;
            }

            string nd = dto.NoiDungChuyenKhoan.Trim();

            dto.DuongDanAnhQr = TaoDuongDanQrRutTien(
                dto.MaNganHangNhan,
                dto.SoTaiKhoanNhan,
                dto.TenTaiKhoanNhan,
                dto.SoTienYeuCau,
                nd);
        }

        private static bool LaTrangThaiCoTheHienQr(string? trangThai)
        {
            return string.Equals(trangThai, "CHO_DUYET", StringComparison.OrdinalIgnoreCase)
                || string.Equals(trangThai, "CHO_CHUYEN_KHOAN", StringComparison.OrdinalIgnoreCase);
        }

        private static string TaoDuongDanQrRutTien(
            string maNganHangNhan,
            string soTaiKhoanNhan,
            string tenTaiKhoanNhan,
            decimal soTien,
            string noiDungChuyenKhoan)
        {
            return $"https://img.vietqr.io/image/{maNganHangNhan}-{soTaiKhoanNhan}-compact2.png?amount={soTien:0}&addInfo={Uri.EscapeDataString(noiDungChuyenKhoan)}&accountName={Uri.EscapeDataString(tenTaiKhoanNhan)}";
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
    }
}
