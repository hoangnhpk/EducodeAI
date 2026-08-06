using educodeai_server.Data;
using educodeai_server.DTOs.QuanLyHoSoGiangVien;
using educodeai_server.Helpers;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using educodeai_server.Config;
using educodeai_server.Common;
using educodeai_server.Workers;

namespace educodeai_server.Services.Implementation
{
    public class QuanLyHoSoGiangVienService : IQuanLyHoSoGiangVienService
    {
        private readonly EduCodeAIDbContext _context;
        private readonly PaymentMailOptions _mailOptions;
        private readonly IWebHostEnvironment _env;
        private readonly IDataProtector _cccdDataProtector;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<QuanLyHoSoGiangVienService> _logger;
        private readonly ITokenService _tokenService;
        private readonly IGiangVienReviewEmailQueue _emailQueue;

        public QuanLyHoSoGiangVienService(EduCodeAIDbContext context, IOptions<PaymentMailOptions> mailOptions, IWebHostEnvironment env, IDataProtectionProvider dataProtectionProvider, IHttpContextAccessor httpContextAccessor, ILogger<QuanLyHoSoGiangVienService> logger, ITokenService tokenService, IGiangVienReviewEmailQueue emailQueue)
        {
            _context = context;
            _mailOptions = mailOptions.Value;
            _env = env;
            _cccdDataProtector = dataProtectionProvider.CreateProtector("EduCodeAI.CCCD.OcrData.v1");
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _tokenService = tokenService;
            _emailQueue = emailQueue;
        }

        private string? ActorIp() =>
            _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();

        public async Task<object> LayDanhSachHoSoAsync(string? trangThai = null)
        {
            var query = _context.HoSoDangKyGiangViens.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(trangThai))
            {
                query = query.Where(h => h.TrangThaiHoSo == trangThai);
            }

            var rows = await query
                .OrderByDescending(h => h.NgayTao)
                .Select(h => new
                {
                    h.MaHoSoDangKyGiangVien,
                    h.HoTen,
                    h.Email,
                    h.SoDienThoai,
                    h.LinhVucGiangDay,
                    h.LoaiGiayTo,
                    h.SoGiayTo,
                    h.AnhDaiDienUrl,
                    h.TrangThaiHoSo,
                    h.LyDoTuChoi,
                    h.NgayTao,
                    h.NgayDuyet,
                    h.MaNguoiDung
                })
                .ToListAsync();

            // I.10: danh sách chỉ cần nhận diện hồ sơ — mask số giấy tờ, không trả full cho mọi bản ghi.
            return rows.Select(h => new
            {
                h.MaHoSoDangKyGiangVien,
                h.HoTen,
                h.Email,
                h.SoDienThoai,
                h.LinhVucGiangDay,
                h.LoaiGiayTo,
                SoGiayTo = MaskSoGiayTo(h.SoGiayTo),
                h.AnhDaiDienUrl,
                h.TrangThaiHoSo,
                h.LyDoTuChoi,
                h.NgayTao,
                h.NgayDuyet,
                h.MaNguoiDung
            }).ToList();
        }

        public async Task<object> LayChiTietHoSoAsync(long maHoSo)
        {
            var hoSo = await _context.HoSoDangKyGiangViens
                .AsNoTracking()
                .Where(h => h.MaHoSoDangKyGiangVien == maHoSo)
                .Select(h => new HoSoDangKyGiangVienDTO
                {
                    MaHoSoDangKyGiangVien = h.MaHoSoDangKyGiangVien,
                    MaNguoiDung = h.MaNguoiDung,
                    HoTen = h.HoTen,
                    Email = h.Email,
                    SoDienThoai = h.SoDienThoai,
                    TaiKhoan = h.TaiKhoan,
                    LinhVucGiangDay = h.LinhVucGiangDay,
                    TieuSu = h.TieuSu,
                    LinkedInUrl = h.LinkedInUrl,
                    WebsiteUrl = h.WebsiteUrl,
                    LoaiGiayTo = h.LoaiGiayTo,
                    SoGiayTo = h.SoGiayTo,
                    AnhDaiDienUrl = h.AnhDaiDienUrl,
                    ThongTinCccdQuet = null,
                    DuLieuCccdMaHoa = h.DuLieuCccdMaHoa,
                    PhuongThucThanhToan = h.PhuongThucThanhToan,
                    TenNganHang = h.TenNganHang,
                    SoTaiKhoanNhanTien = h.SoTaiKhoanNhanTien,
                    TenChuTaiKhoan = h.TenChuTaiKhoan,
                    MaSoThue = h.MaSoThue,
                    LoaiDoiTuongThue = h.LoaiDoiTuongThue,
                    TrangThaiHoSo = h.TrangThaiHoSo,
                    LyDoTuChoi = h.LyDoTuChoi,
                    MaQuanTriVienDuyet = h.MaQuanTriVienDuyet,
                    NgayTao = h.NgayTao,
                    NgayCapNhat = h.NgayCapNhat,
                    NgayDuyet = h.NgayDuyet
                })
                .FirstOrDefaultAsync();

            if (hoSo == null) throw ApiException.InvalidRequest("Không tìm thấy hồ sơ đăng ký giảng viên.");

            if (!string.IsNullOrWhiteSpace(hoSo.DuLieuCccdMaHoa)
                && TryGiaiMaThongTinCccd(hoSo.DuLieuCccdMaHoa, out var thongTinCccd))
            {
                hoSo.ThongTinCccdQuet = thongTinCccd;
            }

            return hoSo;
        }

        public async Task<int> DemHoSoChoDuyetAsync()
        {
            return await _context.HoSoDangKyGiangViens
                .AsNoTracking()
                .CountAsync(h => h.TrangThaiHoSo == "ChoDuyet");
        }

        public async Task<object> DuyetHoSoAsync(long maHoSo, int maQuanTriVien)
        {
            var hoSo = await _context.HoSoDangKyGiangViens
                .FirstOrDefaultAsync(h => h.MaHoSoDangKyGiangVien == maHoSo);
            if (hoSo == null) throw ApiException.InvalidRequest("Không tìm thấy hồ sơ đăng ký giảng viên.");


            if (hoSo.TrangThaiHoSo == "DaDuyet")
                throw ApiException.InvalidRequest("Hồ sơ này đã được duyệt trước đó.");

            // Kiểm tra trùng tài khoản/email đã tồn tại trong NguoiDungs
            var email = hoSo.Email.Trim().ToLower();
            var taiKhoan = hoSo.TaiKhoan.Trim();

            if (await _context.NguoiDungs.AnyAsync(u => u.Email.ToLower() == email))
                throw ApiException.InvalidRequest("Email này đã được sử dụng bởi một tài khoản khác.");

            if (await _context.NguoiDungs.AnyAsync(u => u.TaiKhoan == taiKhoan))
                throw ApiException.InvalidRequest("Tên tài khoản này đã tồn tại, vui lòng liên hệ giảng viên đổi tên đăng nhập.");

            int maNguoiDungMoi = 0;

            // Bọc trong execution strategy vì đang bật NpgsqlRetryingExecutionStrategy
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var tx = await _context.Database.BeginTransactionAsync();
                try
                {
                    // I.7: atomic claim — chỉ request đầu flip được ChoDuyet→DangDuyet (rows=1) mới tạo tài khoản.
                    // Hai admin bấm duyệt đồng thời cùng hồ sơ: request thua (rows=0) dừng, không tạo 2 tài khoản.
                    var claimed = await _context.HoSoDangKyGiangViens
                        .Where(h => h.MaHoSoDangKyGiangVien == maHoSo && h.TrangThaiHoSo == "ChoDuyet")
                        .ExecuteUpdateAsync(s => s.SetProperty(h => h.TrangThaiHoSo, "DangDuyet"));
                    if (claimed == 0)
                        throw ApiException.InvalidRequest("Hồ sơ đang được xử lý hoặc đã được duyệt.");

                    // Tạo tài khoản giảng viên (VaiTro = 1)
                    // Lưu mã VietQR vào NguoiDung.MaNganHangNhanTien để dùng chung với ví/rút tiền.
                    var nganHang = DanhMucNganHangLienKet.LayDanhSach().FirstOrDefault(x =>
                        string.Equals(x.TenHienThi, hoSo.TenNganHang, StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(x.Ma, hoSo.TenNganHang, StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(x.MaVietQr, hoSo.TenNganHang, StringComparison.OrdinalIgnoreCase));

                    var nguoiDungMoi = new NguoiDungModel
                    {
                        TaiKhoan = taiKhoan,
                        Email = email, // chuẩn hoá lowercase
                        HoTen = hoSo.HoTen.Trim(),
                        MatKhau = hoSo.MatKhau, // đã được hash BCrypt lúc đăng ký
                        AnhDaiDien = hoSo.AnhDaiDienUrl,
                        VaiTro = 1,
                        TrangThai = "Hoạt động",
                        NgayThamGia = DateTime.UtcNow,
                        MaNganHangNhanTien = nganHang?.MaVietQr ?? hoSo.TenNganHang,
                        SoTaiKhoanNhanTien = hoSo.SoTaiKhoanNhanTien,
                        TenTaiKhoanNhanTien = hoSo.TenChuTaiKhoan
                    };

                    _context.NguoiDungs.Add(nguoiDungMoi);
                    await _context.SaveChangesAsync();

                    // Link hồ sơ với tài khoản vừa tạo
                    hoSo.MaNguoiDung = nguoiDungMoi.MaNguoiDung;
                    hoSo.TrangThaiHoSo = "DaDuyet";
                    hoSo.MaQuanTriVienDuyet = maQuanTriVien;
                    hoSo.NgayDuyet = DateTime.UtcNow;
                    hoSo.NgayCapNhat = DateTime.UtcNow;
                    // Xoá mật khẩu khỏi hồ sơ (đã chuyển sang NguoiDung, không lưu trữ dư thừa)
                    hoSo.MatKhau = "";
                    await _context.SaveChangesAsync();

                    await tx.CommitAsync();
                    maNguoiDungMoi = nguoiDungMoi.MaNguoiDung;
                }
                catch
                {
                    await tx.RollbackAsync();
                    throw;
                }
            });

            // I.9: audit — ai duyệt hồ sơ nào, tạo user nào, IP, thời điểm. Không log dữ liệu CCCD/số giấy tờ.
            _logger.LogInformation("Admin {ActorId} duyệt hồ sơ {MaHoSo} → tạo user {TargetId} từ IP {Ip}.",
                maQuanTriVien, maHoSo, maNguoiDungMoi, ActorIp());

            // Gửi email chúc mừng (ngoài transaction - lỗi email không rollback tài khoản)
            string subject = "Hồ sơ giảng viên EduCodeAI đã được duyệt";
            string body = $@"
            <div style='font-family: ""Segoe UI"", Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#fff; border-radius:12px; border:1px solid #eaeaea; overflow:hidden;'>
                <div style='background:#fcfcfc; padding:25px 0; text-align:center; border-bottom:1px solid #f0f0f0;'>
                    <h1 style='margin:0; font-size:28px; font-weight:800; color:#333;'>EDUCODE<span style='color:#fb873f;'>AI</span></h1>
                </div>
                <div style='padding:40px 30px;'>
                    <h2 style='color:#2c3e50; text-align:center;'>Chúc mừng! Hồ sơ đã được duyệt</h2>
                    <p style='color:#555; font-size:16px; line-height:1.6;'>
                        Xin chào <b>{hoSo.HoTen}</b>,<br><br>
                        Hồ sơ đăng ký giảng viên của bạn đã được đội ngũ EduCodeAI phê duyệt.
                        Bạn đã có thể đăng nhập vào hệ thống với thông tin sau:
                    </p>
                    <div style='background:#fff8f3; border:2px dashed #fb873f; border-radius:12px; padding:20px; text-align:center; margin:20px auto; max-width:360px;'>
                        <p style='margin:0 0 8px; color:#555;'>Tài khoản: <b>{hoSo.TaiKhoan}</b></p>
                        <p style='margin:0; color:#555;'>Email: <b>{hoSo.Email}</b></p>
                    </div>
                    <p style='color:#555; font-size:16px; line-height:1.6;'>
                        Vui lòng đăng nhập bằng mật khẩu bạn đã đặt lúc đăng ký và đổi mật khẩu nếu cần.
                        Chúc bạn có những trải nghiệm tuyệt vời khi đồng hành cùng EduCodeAI!
                    </p>
                </div>
                <div style='background:#f9f9f9; padding:20px; text-align:center; border-top:1px solid #eee;'>
                    <p style='color:#999; font-size:13px; margin:0;'>&copy; {DateTime.UtcNow.Year} EduCodeAI. All rights reserved.</p>
                </div>
            </div>";
            try
            {
                await _emailQueue.EnqueueAsync(new GiangVienReviewEmailPayload(hoSo.Email, subject, body));
            }
            catch (Exception exMail)
            {
                _logger.LogWarning(exMail, "Gửi email duyệt hồ sơ {MaHoSo} thất bại.", maHoSo);
            }

            return new
            {
                success = true,
                message = "Đã duyệt hồ sơ, tạo tài khoản giảng viên và gửi email thông báo.",
                maNguoiDung = maNguoiDungMoi,
                taiKhoan = taiKhoan
            };
        }

        public async Task<object> TuChoiHoSoAsync(long maHoSo, int maQuanTriVien, TuChoiHoSoRequest request)
        {
            var hoSo = await _context.HoSoDangKyGiangViens
                .FirstOrDefaultAsync(h => h.MaHoSoDangKyGiangVien == maHoSo);
            if (hoSo == null) throw ApiException.InvalidRequest("Không tìm thấy hồ sơ đăng ký giảng viên.");


            if (hoSo.TrangThaiHoSo == "DaDuyet")
                throw ApiException.InvalidRequest("Hồ sơ đã được duyệt, không thể từ chối.");

            hoSo.TrangThaiHoSo = "TuChoi";
            hoSo.LyDoTuChoi = request.LyDoTuChoi.Trim();
            hoSo.MaQuanTriVienDuyet = maQuanTriVien;
            hoSo.NgayCapNhat = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // I.9: audit hành động admin (không log dữ liệu nhạy cảm).
            _logger.LogInformation("Admin {ActorId} từ chối hồ sơ {MaHoSo} từ IP {Ip}.",
                maQuanTriVien, maHoSo, ActorIp());

            string subject = "Kết quả hồ sơ đăng ký giảng viên EduCodeAI";
            string body = $@"
            <div style='font-family: ""Segoe UI"", Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#fff; border-radius:12px; border:1px solid #eaeaea; overflow:hidden;'>
                <div style='background:#fcfcfc; padding:25px 0; text-align:center; border-bottom:1px solid #f0f0f0;'>
                    <h1 style='margin:0; font-size:28px; font-weight:800; color:#333;'>EDUCODE<span style='color:#fb873f;'>AI</span></h1>
                </div>
                <div style='padding:40px 30px;'>
                    <h2 style='color:#c0392b; text-align:center;'>Hồ sơ chưa được duyệt</h2>
                    <p style='color:#555; font-size:16px; line-height:1.6;'>
                        Xin chào <b>{hoSo.HoTen}</b>,<br><br>
                        Rất tiếc, hồ sơ đăng ký giảng viên của bạn <b>chưa được phê duyệt</b> với lý do sau:
                    </p>
                    <div style='background:#fdecea; border-left:4px solid #c0392b; padding:15px 20px; margin:20px 0; color:#c0392b; font-size:15px;'>
                        {request.LyDoTuChoi.Trim()}
                    </div>
                    <p style='color:#555; font-size:16px; line-height:1.6;'>
                        Nếu bạn cho rằng đây là sự nhầm lẫn hoặc cần hỗ trợ, vui lòng liên hệ đội ngũ EduCodeAI.
                    </p>
                </div>
                <div style='background:#f9f9f9; padding:20px; text-align:center; border-top:1px solid #eee;'>
                    <p style='color:#999; font-size:13px; margin:0;'>&copy; {DateTime.Now.Year} EduCodeAI. All rights reserved.</p>
                </div>
            </div>";
            try
            {
                await _emailQueue.EnqueueAsync(new GiangVienReviewEmailPayload(hoSo.Email, subject, body));
            }
            catch (Exception exMail)
            {
                _logger.LogWarning(exMail, "Gửi email từ chối hồ sơ {MaHoSo} thất bại.", maHoSo);
            }

            return new { success = true, message = "Đã từ chối hồ sơ và gửi email thông báo." };
        }

        public async Task<object> YeuCauBoSungHoSoAsync(long maHoSo, int maQuanTriVien, YeuCauBoSungHoSoRequest request)
        {
            var hoSo = await _context.HoSoDangKyGiangViens
                .FirstOrDefaultAsync(h => h.MaHoSoDangKyGiangVien == maHoSo);
            if (hoSo == null) throw ApiException.InvalidRequest("Không tìm thấy hồ sơ đăng ký giảng viên.");


            if (hoSo.TrangThaiHoSo == "DaDuyet")
                throw ApiException.InvalidRequest("Hồ sơ đã được duyệt, không thể yêu cầu bổ sung.");

            // I.8: sinh token CSPRNG 256-bit; chỉ lưu HASH trong DB, plaintext chỉ gửi qua email.
            // Trước đây token là 12 hex đầu của GUID (~48-bit) lưu plaintext → brute-force được.
            var tokenMaterial = _tokenService.CreateRefreshTokenMaterial();
            var plainToken = tokenMaterial.PlainToken;
            hoSo.BoSungToken = _tokenService.HashRefreshToken(plainToken);
            hoSo.BoSungTokenHetHan = DateTime.UtcNow.AddHours(24);
            hoSo.DaNopBoSung = false;
            hoSo.NgayNopBoSung = null;

            hoSo.TrangThaiHoSo = "CanBoSung";
            hoSo.LyDoTuChoi = request.NoiDungBoSung.Trim();
            hoSo.MaQuanTriVienDuyet = maQuanTriVien;
            hoSo.NgayCapNhat = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // I.9: audit hành động yêu cầu bổ sung (actor admin, hồ sơ, IP) — không log token/PII.
            _logger.LogInformation("Admin {ActorId} yêu cầu bổ sung hồ sơ {MaHoSo} từ IP {Ip}.",
                maQuanTriVien, maHoSo, ActorIp());

            // Gửi email với link bổ sung — dùng plaintext token, KHÔNG lưu plaintext ở đâu.
            string boSungLink = $"{_mailOptions.FrontendGiangVienBoSungUrl}/{maHoSo}?token={plainToken}";
            string subject = "Yêu cầu bổ sung hồ sơ đăng ký giảng viên EduCodeAI";
            string body = $@"
            <div style='font-family: ""Segoe UI"", Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#fff; border-radius:12px; border:1px solid #eaeaea; overflow:hidden;'>
                <div style='background:#fcfcfc; padding:25px 0; text-align:center; border-bottom:1px solid #f0f0f0;'>
                    <h1 style='margin:0; font-size:28px; font-weight:800; color:#333;'>EDUCODE<span style='color:#fb873f;'>AI</span></h1>
                </div>
                <div style='padding:40px 30px;'>
                    <h2 style='color:#2c3e50; text-align:center;'>Cần bổ sung thông tin hồ sơ</h2>
                    <p style='color:#555; font-size:16px; line-height:1.6;'>
                        Xin chào <b>{hoSo.HoTen}</b>,<br><br>
                        Hồ sơ đăng ký giảng viên của bạn cần <b>bổ sung thêm thông tin</b> trước khi được phê duyệt:
                    </p>
                    <div style='background:#fff8f3; border:2px dashed #fb873f; border-radius:12px; padding:15px 20px; margin:20px 0; color:#555; font-size:15px;'>
                        {request.NoiDungBoSung.Trim()}
                    </div>
                    <p style='color:#555; font-size:16px; line-height:1.6;'>
                        Vui lòng nhấn nút bên dưới để cập nhật hồ sơ. Liên kết này chỉ có hiệu lực trong 24 giờ.
                    </p>
                    <p style='text-align:center; margin:25px 0;'>
                        <a href='{boSungLink}' style='display:inline-block; background:#fb873f; color:white; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600;'>Bổ sung hồ sơ tại đây</a>
                    </p>
                    <p style='color:#888; font-size:13px;'>Nếu nút không hoạt động, copy đường dẫn sau vào trình duyệt:<br><code style='background:#f5f5f5; padding:4px 8px; border-radius:4px;'>{boSungLink}</code></p>
                </div>
                <div style='background:#f9f9f9; padding:20px; text-align:center; border-top:1px solid #eee;'>
                    <p style='color:#999; font-size:13px; margin:0;'>&copy; {DateTime.Now.Year} EduCodeAI. All rights reserved.</p>
                </div>
            </div>";

            try
            {
                await _emailQueue.EnqueueAsync(new GiangVienReviewEmailPayload(hoSo.Email, subject, body));
            }
            catch (Exception exMail)
            {
                _logger.LogWarning(exMail, "Gửi email yêu cầu bổ sung hồ sơ {MaHoSo} thất bại.", maHoSo);
            }

            return new { success = true, message = "Đã yêu cầu bổ sung hồ sơ và gửi email hướng dẫn." };
        }
        // I.10: che bớt số giấy tờ/số tài khoản khi trả ra danh sách/response — chỉ lộ 4 ký tự cuối.
        private static string? MaskSoGiayTo(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return value;
            var v = value.Trim();
            if (v.Length <= 4) return new string('*', v.Length);
            return new string('*', v.Length - 4) + v[^4..];
        }

        private bool TryGiaiMaThongTinCccd(string duLieuMaHoa, out Dictionary<string, string>? thongTinCccd)
        {
            thongTinCccd = null;
            try
            {
                var json = _cccdDataProtector.Unprotect(duLieuMaHoa);
                thongTinCccd = JsonSerializer.Deserialize<Dictionary<string, string>>(json);
                return thongTinCccd != null;
            }
            catch
            {
                return false;
            }
        }
    }
}
