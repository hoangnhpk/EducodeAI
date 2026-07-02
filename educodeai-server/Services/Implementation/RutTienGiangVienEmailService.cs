using System.Net;
using educodeai_server.Common;
using educodeai_server.Config;
using educodeai_server.Data;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace educodeai_server.Services.Implementation
{
    public class RutTienGiangVienEmailService : IRutTienGiangVienEmailService
    {
        private readonly EduCodeAIDbContext _dbContext;
        private readonly PaymentMailOptions _mailOptions;
        private readonly ILogger<RutTienGiangVienEmailService> _logger;

        public RutTienGiangVienEmailService(
            EduCodeAIDbContext dbContext,
            IOptions<PaymentMailOptions> mailOptions,
            ILogger<RutTienGiangVienEmailService> logger)
        {
            _dbContext = dbContext;
            _mailOptions = mailOptions.Value;
            _logger = logger;
        }

        public async Task GuiEmailKhiRutTienDaChuyenKhoanAsync(int maYeuCauRutTien)
        {
            if (!_mailOptions.Enabled)
            {
                return;
            }

            var yeuCau = await _dbContext.YeuCauRutTienGiangViens
                .Include(x => x.GiangVien)
                .FirstOrDefaultAsync(x => x.MaYeuCauRutTien == maYeuCauRutTien);

            if (yeuCau == null)
            {
                return;
            }

            if (!string.Equals(yeuCau.TrangThaiYeuCau, "DA_CHUYEN_KHOAN", StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            if (yeuCau.GuiEmailRutTienThanhCongLuc != null)
            {
                return;
            }

            string? emailNhan = yeuCau.GiangVien.Email;
            if (string.IsNullOrWhiteSpace(emailNhan))
            {
                _logger.LogWarning("Bỏ qua email rút tiền thành công: giảng viên {MaGiangVien} chưa có email.", yeuCau.MaGiangVien);
                return;
            }

            decimal soTienChuyen = yeuCau.SoTienDaChuyen ?? yeuCau.SoTienYeuCau;
            DateTime thoiDiem = yeuCau.ChuyenKhoanThanhCongLuc ?? DateTime.UtcNow;
            string tenGiangVien = string.IsNullOrWhiteSpace(yeuCau.GiangVien.HoTen)
                ? yeuCau.GiangVien.TaiKhoan
                : yeuCau.GiangVien.HoTen!;

            string tenNganHang = DanhMucNganHangLienKet.TimTheoMaVietQr(yeuCau.MaNganHangNhan)?.TenHienThi
                ?? yeuCau.MaNganHangNhan;
            string stkChe = CheSoTaiKhoan(yeuCau.SoTaiKhoanNhan);

            decimal soDuKhaDung = await TinhSoDuKhaDungSauKhiHoanTatAsync(yeuCau.MaGiangVien);

            string subject = $"EduCodeAI — Đã chuyển khoản rút tiền #{maYeuCauRutTien}";
            string body = TaoNoiDungEmail(
                tenGiangVien,
                maYeuCauRutTien,
                soTienChuyen,
                yeuCau.LoaiTien,
                thoiDiem,
                tenNganHang,
                stkChe,
                yeuCau.MaGiaoDichSePay,
                soDuKhaDung,
                _mailOptions.FrontendGiangVienRutTienUrl);

            bool daGui = await EmailHelper.SendEmailAsync(emailNhan.Trim(), subject, body);
            if (!daGui)
            {
                _logger.LogWarning("Gửi email rút tiền thất bại (SMTP) cho yêu cầu {MaYeuCauRutTien}.", maYeuCauRutTien);
                return;
            }

            yeuCau.GuiEmailRutTienThanhCongLuc = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
        }

        private async Task<decimal> TinhSoDuKhaDungSauKhiHoanTatAsync(int maGiangVien)
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

            return Math.Max(0, tongDoanhThuDaGhiNhan - tongDangChoXuLyRut);
        }

        private static string CheSoTaiKhoan(string? stk)
        {
            if (string.IsNullOrWhiteSpace(stk))
            {
                return "—";
            }

            string s = stk.Trim();
            if (s.Length <= 4)
            {
                return "****";
            }

            return "****" + s[^4..];
        }

        private static string TaoNoiDungEmail(
            string tenGiangVien,
            int maYeuCau,
            decimal soTien,
            string loaiTien,
            DateTime thoiDiemUtc,
            string tenNganHang,
            string stkChe,
            long? maGiaoDichSePay,
            decimal soDuKhaDung,
            string linkVi)
        {
            string maGd = maGiaoDichSePay.HasValue
                ? WebUtility.HtmlEncode(maGiaoDichSePay.Value.ToString())
                : "—";

            string thoiGianHienThi = DinhDangThoiGianVn(thoiDiemUtc);

            return $@"
<div style='font-family: Arial, sans-serif; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;'>
  <h2 style='color: #2563eb; margin-top: 0;'>Rút tiền — đã chuyển khoản thành công</h2>
  <p>Chào <b>{WebUtility.HtmlEncode(tenGiangVien)}</b>,</p>
  <p>Hệ thống đã ghi nhận khoản chuyển tương ứng với yêu cầu rút tiền của bạn.</p>
  <ul>
    <li>Mã yêu cầu: <b>#{maYeuCau}</b></li>
    <li>Số tiền đã chuyển: <b>{soTien:N0} {WebUtility.HtmlEncode(loaiTien)}</b></li>
    <li>Thời điểm ghi nhận: <b>{thoiGianHienThi}</b></li>
    <li>Ngân hàng nhận: <b>{WebUtility.HtmlEncode(tenNganHang)}</b> — STK: <b>{stkChe}</b></li>
    <li>Mã giao dịch (nếu có): <b>{maGd}</b></li>
    <li>Số dư khả dụng ước tính sau giao dịch: <b>{soDuKhaDung:N0} {WebUtility.HtmlEncode(loaiTien)}</b></li>
  </ul>
  <p>Bạn có thể xem lịch sử rút tiền trong ứng dụng.</p>
  <p>
    <a href='{WebUtility.HtmlEncode(linkVi)}' style='background:#2563eb;color:#fff;padding:10px 14px;text-decoration:none;border-radius:6px;'>
      Mở trang ví &amp; rút tiền
    </a>
  </p>
  <p style='font-size:12px;color:#6b7280;margin-top:16px;'>Email này được gửi tự động từ EduCodeAI.</p>
</div>";
        }

        private static string DinhDangThoiGianVn(DateTime utc)
        {
            try
            {
                string tzId = OperatingSystem.IsWindows() ? "SE Asia Standard Time" : "Asia/Ho_Chi_Minh";
                var tz = TimeZoneInfo.FindSystemTimeZoneById(tzId);
                var utcKind = DateTime.SpecifyKind(utc, DateTimeKind.Utc);
                var local = TimeZoneInfo.ConvertTimeFromUtc(utcKind, tz);
                return $"{local:dd/MM/yyyy HH:mm} (Giờ Việt Nam)";
            }
            catch
            {
                return $"{utc:dd/MM/yyyy HH:mm} UTC";
            }
        }
    }
}
