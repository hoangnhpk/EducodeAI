using educodeai_server.Config;
using educodeai_server.Data;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Npgsql;

namespace educodeai_server.Services.Implementation
{
    public class ThanhToanEmailService : IThanhToanEmailService
    {
        private const string LoaiThongBaoThanhToanThanhCong = "PAYMENT_SUCCESS_STUDENT";

        private readonly EduCodeAIDbContext _dbContext;
        private readonly PaymentMailOptions _mailOptions;
        private readonly ILogger<ThanhToanEmailService> _logger;

        public ThanhToanEmailService(
            EduCodeAIDbContext dbContext,
            IOptions<PaymentMailOptions> mailOptions,
            ILogger<ThanhToanEmailService> logger)
        {
            _dbContext = dbContext;
            _mailOptions = mailOptions.Value;
            _logger = logger;
        }

        public async Task GuiThongBaoThanhToanThanhCongHocVienAsync(int maDonHang)
        {
            if (!_mailOptions.Enabled)
            {
                return;
            }

            var donHang = await _dbContext.DonHangKhoaHocs
                .AsNoTracking()
                .Include(x => x.NguoiDung)
                .Include(x => x.ChiTietDonHangs)
                    .ThenInclude(ct => ct.KhoaHoc)
                .FirstOrDefaultAsync(x => x.MaDonHang == maDonHang);

            if (donHang == null || !string.Equals(donHang.TrangThaiDonHang, "PAID", StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            string? emailNhan = donHang.NguoiDung.Email;
            if (string.IsNullOrWhiteSpace(emailNhan))
            {
                _logger.LogWarning("Bỏ qua gửi email thanh toán vì học viên {MaNguoiDung} chưa có email", donHang.MaNguoiDung);
                return;
            }

            var thongBao = new ThongBaoEmailThanhToanModel
            {
                MaDonHang = donHang.MaDonHang,
                LoaiThongBao = LoaiThongBaoThanhToanThanhCong,
                EmailNhan = emailNhan.Trim(),
                TrangThai = "PENDING",
                SoLanThu = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _dbContext.ThongBaoEmailThanhToans.Add(thongBao);

            try
            {
                await _dbContext.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (LaLoiTrungThongBao(ex))
            {
                // Webhook replay hoặc đã xử lý trước đó.
                return;
            }

            string tenHocVien = donHang.NguoiDung.HoTen ?? donHang.NguoiDung.TaiKhoan;
            string tenKhoaHoc = donHang.ChiTietDonHangs.FirstOrDefault()?.KhoaHoc?.TenKhoaHoc ?? "Khóa học";
            string subject = $"EduCodeAI - Thanh toán thành công đơn hàng #{donHang.MaDonHang}";
            string body = TaoNoiDungEmailThanhToanThanhCong(
                tenHocVien,
                tenKhoaHoc,
                donHang.MaDonHang,
                donHang.TongTien,
                donHang.LoaiTien,
                DateTime.UtcNow,
                _mailOptions.FrontendCourseUrl);

            bool daGui = await EmailHelper.SendEmailAsync(emailNhan, subject, body);

            thongBao.SoLanThu += 1;
            thongBao.UpdatedAt = DateTime.UtcNow;

            if (daGui)
            {
                thongBao.TrangThai = "SENT";
                thongBao.SentAt = DateTime.UtcNow;
                thongBao.LoiCuoi = null;
            }
            else
            {
                thongBao.TrangThai = "FAILED";
                thongBao.LoiCuoi = "SMTP gửi thất bại hoặc EmailHelper trả về false.";
            }

            await _dbContext.SaveChangesAsync();
        }

        private static bool LaLoiTrungThongBao(DbUpdateException ex)
        {
            return ex.InnerException is PostgresException pg && pg.SqlState == PostgresErrorCodes.UniqueViolation;
        }

        private static string TaoNoiDungEmailThanhToanThanhCong(
            string tenHocVien,
            string tenKhoaHoc,
            int maDonHang,
            decimal soTien,
            string loaiTien,
            DateTime thoiDiem,
            string linkKhoaHoc)
        {
            return $@"
<div style='font-family: Arial, sans-serif; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;'>
  <h2 style='color: #2563eb; margin-top: 0;'>Thanh toán thành công</h2>
  <p>Chào <b>{System.Net.WebUtility.HtmlEncode(tenHocVien)}</b>,</p>
  <p>Bạn đã thanh toán thành công khóa học <b>{System.Net.WebUtility.HtmlEncode(tenKhoaHoc)}</b>.</p>
  <ul>
    <li>Mã đơn hàng: <b>#{maDonHang}</b></li>
    <li>Số tiền: <b>{soTien:N0} {System.Net.WebUtility.HtmlEncode(loaiTien)}</b></li>
    <li>Thời điểm ghi nhận: <b>{thoiDiem:dd/MM/yyyy HH:mm:ss} UTC</b></li>
  </ul>
  <p>Khóa học đã được kích hoạt trong tài khoản của bạn.</p>
  <p>
    <a href='{System.Net.WebUtility.HtmlEncode(linkKhoaHoc)}' style='background:#2563eb;color:#fff;padding:10px 14px;text-decoration:none;border-radius:6px;'>
      Vào Khóa học của tôi
    </a>
  </p>
  <p style='font-size:12px;color:#6b7280;margin-top:16px;'>Email này được gửi tự động từ EduCodeAI.</p>
</div>";
        }
    }
}
