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
using System.Net;

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
        private readonly IHoSoGiangVienTaiLieuStorage _taiLieuStorage;

        public QuanLyHoSoGiangVienService(EduCodeAIDbContext context, IOptions<PaymentMailOptions> mailOptions, IWebHostEnvironment env, IDataProtectionProvider dataProtectionProvider, IHttpContextAccessor httpContextAccessor, ILogger<QuanLyHoSoGiangVienService> logger, ITokenService tokenService, IHoSoGiangVienTaiLieuStorage taiLieuStorage)
        {
            _context = context;
            _mailOptions = mailOptions.Value;
            _env = env;
            _cccdDataProtector = dataProtectionProvider.CreateProtector("EduCodeAI.CCCD.OcrData.v1");
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _tokenService = tokenService;
            _taiLieuStorage = taiLieuStorage;
        }

        private string? ActorIp() =>
            _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();

        public async Task<object> LayDanhSachHoSoAsync(string? trangThai = null)
        {
            var query = _context.HoSoDangKyGiangViens
                .AsNoTracking()
                .Where(h =>
                    h.TrangThaiHoSo != "DangTaiTaiLieu" &&
                    h.TrangThaiHoSo != "DangBoSung")
                .AsQueryable();

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
                AnhDaiDienUrl = GetExistingPublicFileUrl(h.AnhDaiDienUrl),
                h.TrangThaiHoSo,
                h.LyDoTuChoi,
                h.NgayTao,
                h.NgayDuyet,
                h.MaNguoiDung
            }).ToList();
        }

        public async Task<ChungChiAdminPagedDTO> LayDanhSachChungChiAsync(ChungChiAdminFilterRequest filter)
        {
            var query = _context.YeuCauChungChiGiangViens
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.TuKhoa))
            {
                var keyword = filter.TuKhoa.Trim().ToLower();
                query = query.Where(x =>
                    x.TenChungChi.ToLower().Contains(keyword) ||
                    (x.DonViCap ?? string.Empty).ToLower().Contains(keyword) ||
                    x.GiangVien.HoTen.ToLower().Contains(keyword) ||
                    x.GiangVien.Email.ToLower().Contains(keyword));
            }

            if (!string.IsNullOrWhiteSpace(filter.TrangThai))
            {
                var status = filter.TrangThai.Trim();
                query = query.Where(x => _context.YeuCauChungChiGiangViens
                    .Where(child => child.MaDotGui == x.MaDotGui)
                    .All(child => child.TrangThai == status));
            }
            if (!string.IsNullOrWhiteSpace(filter.DonViCap))
            {
                var issuer = filter.DonViCap.Trim().ToLower();
                query = query.Where(x =>
                    (x.DonViCap ?? string.Empty).ToLower().Contains(issuer));
            }
            if (filter.TuNgay.HasValue)
            {
                var from = filter.TuNgay.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
                query = query.Where(x => x.NgayTao >= from);
            }
            if (filter.DenNgay.HasValue)
            {
                var toExclusive = filter.DenNgay.Value.AddDays(1)
                    .ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
                query = query.Where(x => x.NgayTao < toExclusive);
            }

            var groupedQuery = query
                .GroupBy(x => x.MaDotGui)
                .Select(group => new
                {
                    MaDotGui = group.Key,
                    NgayTaiLen = group.Min(x => x.NgayTao),
                    MaSapXep = group.Max(x => x.MaYeuCauChungChi)
                });
            var tongSo = await groupedQuery.CountAsync();
            var page = await groupedQuery
                .OrderByDescending(x => x.NgayTaiLen)
                .ThenByDescending(x => x.MaSapXep)
                .Skip((filter.Trang - 1) * filter.KichThuocTrang)
                .Take(filter.KichThuocTrang)
                .ToListAsync();
            var batchIds = page.Select(x => x.MaDotGui).ToList();

            var rows = await _context.YeuCauChungChiGiangViens
                .AsNoTracking()
                .Where(x => batchIds.Contains(x.MaDotGui))
                .OrderBy(x => x.MaYeuCauChungChi)
                .Select(x => new
                {
                    x.MaDotGui,
                    x.MaYeuCauChungChi,
                    x.MaGiangVien,
                    x.GiangVien.HoTen,
                    x.GiangVien.Email,
                    AnhDaiDienUrl = x.GiangVien.AnhDaiDien,
                    x.TenChungChi,
                    x.DonViCap,
                    x.NgayCap,
                    x.NgayHetHan,
                    x.MaChungChi,
                    x.UrlXacMinh,
                    x.TenFileGoc,
                    x.ContentType,
                    x.KichThuoc,
                    x.TrangThai,
                    x.LyDoXuLy,
                    x.PhienBan,
                    x.NgayTao,
                    x.NgayCapNhat,
                    x.NgayDuyet,
                    x.HienThiCongKhai
                })
                .ToListAsync();

            var rowsByBatch = rows.GroupBy(x => x.MaDotGui)
                .ToDictionary(group => group.Key, group => group.ToList());
            var duLieu = new List<ChungChiAdminListItemDTO>();
            foreach (var batch in page)
            {
                if (!rowsByBatch.TryGetValue(batch.MaDotGui, out var children) || children.Count == 0)
                    continue;
                var first = children[0];
                var batchStatus = DeriveCertificateBatchStatus(children.Select(x => x.TrangThai));
                duLieu.Add(new ChungChiAdminListItemDTO
                {
                    MaDotGui = batch.MaDotGui,
                    MaNguoiDung = first.MaGiangVien,
                    HoTen = first.HoTen,
                    Email = first.Email,
                    AnhDaiDienUrl = GetExistingPublicFileUrl(first.AnhDaiDienUrl),
                    TrangThai = batchStatus,
                    LyDoXuLy = DeriveCertificateBatchReason(children.Select(x => x.LyDoXuLy)),
                    NgayTaiLen = children.Min(x => x.NgayTao),
                    NgayCapNhat = children.Max(x => x.NgayCapNhat),
                    NgayDuyet = children.All(x => x.TrangThai == "DaDuyet")
                        ? children.Max(x => x.NgayDuyet)
                        : null,
                    SoLuongChungChi = children.Count,
                    ChungChis = children.Select(x => new ChungChiAdminItemDTO
                    {
                        MaTaiLieu = x.MaYeuCauChungChi,
                        TenChungChi = x.TenChungChi,
                        DonViCap = x.DonViCap,
                        NgayCap = x.NgayCap,
                        NgayHetHan = x.NgayHetHan,
                        MaChungChi = x.MaChungChi,
                        UrlXacMinh = x.UrlXacMinh,
                        TenFile = x.TenFileGoc,
                        ContentType = x.ContentType,
                        KichThuoc = x.KichThuoc,
                        TrangThai = x.TrangThai,
                        LyDoXuLy = x.LyDoXuLy,
                        PhienBan = x.PhienBan,
                        NgayCapNhat = x.NgayCapNhat,
                        NgayDuyet = x.NgayDuyet,
                        HienThiCongKhai = x.TrangThai == "DaDuyet" && x.HienThiCongKhai
                    }).ToList()
                });
            }

            return new ChungChiAdminPagedDTO
            {
                DuLieu = duLieu,
                TongSo = tongSo,
                Trang = filter.Trang,
                KichThuocTrang = filter.KichThuocTrang,
                TongSoTrang = tongSo == 0
                    ? 0
                    : (int)Math.Ceiling(tongSo / (double)filter.KichThuocTrang)
            };
        }

        public async Task<HoSoGiangVienTaiLieuDownloadDTO> TaiChungChiAsync(long maTaiLieu)
        {
            var taiLieu = await _context.YeuCauChungChiGiangViens
                .AsNoTracking()
                .Where(x => x.MaYeuCauChungChi == maTaiLieu)
                .Select(x => new
                {
                    x.StorageKey,
                    x.ContentType,
                    x.TenFileGoc
                })
                .FirstOrDefaultAsync();
            if (taiLieu == null)
                throw ApiException.InvalidRequest("Không tìm thấy yêu cầu chứng chỉ.");

            var path = _taiLieuStorage.ResolvePath(taiLieu.StorageKey);
            try
            {
                return new HoSoGiangVienTaiLieuDownloadDTO
                {
                    NoiDung = new FileStream(
                        path,
                        FileMode.Open,
                        FileAccess.Read,
                        FileShare.Read,
                        81920,
                        true),
                    ContentType = taiLieu.ContentType,
                    TenFile = taiLieu.TenFileGoc
                };
            }
            catch (FileNotFoundException)
            {
                _logger.LogWarning("Thiếu file yêu cầu chứng chỉ {MaTaiLieu}.", maTaiLieu);
                throw ApiException.InvalidRequest("Tài liệu hiện không khả dụng.");
            }
            catch (DirectoryNotFoundException)
            {
                _logger.LogWarning("Thiếu thư mục yêu cầu chứng chỉ {MaTaiLieu}.", maTaiLieu);
                throw ApiException.InvalidRequest("Tài liệu hiện không khả dụng.");
            }
        }

        public async Task<object> QuyetDinhChungChiAsync(
            Guid maDotGui,
            int maQuanTriVien,
            QuyetDinhDotChungChiRequest request)
        {
            if (request.QuyetDinhs.Count == 0)
                throw ApiException.InvalidRequest("Vui lòng chọn quyết định cho các chứng chỉ đang chờ duyệt.");

            var duplicate = request.QuyetDinhs
                .GroupBy(x => x.MaTaiLieu)
                .FirstOrDefault(group => group.Key <= 0 || group.Count() > 1);
            if (duplicate != null)
                throw ApiException.InvalidRequest("Danh sách quyết định có mã chứng chỉ không hợp lệ hoặc bị trùng.");

            foreach (var decision in request.QuyetDinhs)
            {
                if (decision.TrangThai is not "DaDuyet" and not "CanBoSung" and not "TuChoi")
                    throw ApiException.InvalidRequest("Quyết định chứng chỉ không hợp lệ.");

                decision.LyDo = string.IsNullOrWhiteSpace(decision.LyDo)
                    ? null
                    : decision.LyDo.Trim();
                if (decision.TrangThai == "DaDuyet")
                {
                    decision.LyDo = null;
                }
                else if (decision.LyDo == null)
                {
                    throw ApiException.InvalidRequest(
                        decision.TrangThai == "CanBoSung"
                            ? "Vui lòng nhập nội dung cần bổ sung cho từng chứng chỉ."
                            : "Vui lòng nhập lý do từ chối cho từng chứng chỉ.");
                }
            }

            var now = DateTime.UtcNow;
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();
                var batch = await _context.YeuCauChungChiGiangViens
                    .AsNoTracking()
                    .Where(x => x.MaDotGui == maDotGui)
                    .OrderBy(x => x.MaYeuCauChungChi)
                    .Select(x => new
                    {
                        x.MaYeuCauChungChi,
                        x.TrangThai,
                        x.PhienBan
                    })
                    .ToListAsync();
                if (batch.Count == 0)
                    throw ApiException.InvalidRequest("Không tìm thấy đợt gửi chứng chỉ.");

                var batchIds = batch.Select(x => x.MaYeuCauChungChi).ToHashSet();
                if (request.QuyetDinhs.Any(x => !batchIds.Contains(x.MaTaiLieu)))
                    throw ApiException.InvalidRequest("Có chứng chỉ không thuộc đợt gửi này.");

                var pending = batch.Where(x => x.TrangThai == "ChoDuyet").ToList();
                var requestedIds = request.QuyetDinhs.Select(x => x.MaTaiLieu).ToHashSet();
                if (pending.Count == 0 ||
                    pending.Count != requestedIds.Count ||
                    pending.Any(x => !requestedIds.Contains(x.MaYeuCauChungChi)))
                {
                    throw ApiException.Conflict(
                        "Đợt chứng chỉ đã thay đổi hoặc chưa chọn đủ quyết định. Vui lòng tải lại.");
                }

                var pendingById = pending.ToDictionary(x => x.MaYeuCauChungChi);
                if (request.QuyetDinhs.Any(x => pendingById[x.MaTaiLieu].PhienBan != x.PhienBan))
                    throw ApiException.Conflict("Đợt chứng chỉ đã được xử lý ở nơi khác. Vui lòng tải lại.");

                foreach (var decision in request.QuyetDinhs.OrderBy(x => x.MaTaiLieu))
                {
                    var approved = decision.TrangThai == "DaDuyet";
                    var updated = await _context.YeuCauChungChiGiangViens
                        .Where(x =>
                            x.MaDotGui == maDotGui &&
                            x.MaYeuCauChungChi == decision.MaTaiLieu &&
                            x.TrangThai == "ChoDuyet" &&
                            x.PhienBan == decision.PhienBan)
                        .ExecuteUpdateAsync(setters => setters
                            .SetProperty(x => x.TrangThai, decision.TrangThai)
                            .SetProperty(x => x.LyDoXuLy, decision.LyDo)
                            .SetProperty(x => x.NgayDuyet, approved ? now : (DateTime?)null)
                            .SetProperty(x => x.NgayCapNhat, now)
                            .SetProperty(x => x.MaQuanTriVienDuyet, maQuanTriVien)
                            .SetProperty(x => x.HienThiCongKhai, false)
                            .SetProperty(x => x.PhienBan, x => x.PhienBan + 1));
                    if (updated != 1)
                        throw ApiException.Conflict("Đợt chứng chỉ đã được xử lý ở nơi khác. Vui lòng tải lại.");
                }

                await transaction.CommitAsync();
            });

            var counts = request.QuyetDinhs
                .GroupBy(x => x.TrangThai)
                .ToDictionary(group => group.Key, group => group.Count());
            _logger.LogInformation(
                "Admin {ActorId} xử lý {Count} chứng chỉ trong đợt {MaDotGui} từ IP {Ip}.",
                maQuanTriVien,
                request.QuyetDinhs.Count,
                maDotGui,
                ActorIp());

            return new
            {
                success = true,
                message = "Đã lưu quyết định cho từng chứng chỉ.",
                soLuongDuyet = counts.GetValueOrDefault("DaDuyet"),
                soLuongCanBoSung = counts.GetValueOrDefault("CanBoSung"),
                soLuongTuChoi = counts.GetValueOrDefault("TuChoi")
            };
        }

        public async Task<object> DuyetChungChiAsync(Guid maDotGui, int maQuanTriVien)
        {
            var now = DateTime.UtcNow;
            var updated = 0;
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();
                var batch = await _context.YeuCauChungChiGiangViens
                    .AsNoTracking()
                    .Where(x => x.MaDotGui == maDotGui)
                    .Select(x => new { x.TrangThai })
                    .ToListAsync();
                if (batch.Count == 0)
                    throw ApiException.InvalidRequest("Không tìm thấy đợt gửi chứng chỉ.");
                if (batch.Any(x => x.TrangThai != "ChoDuyet"))
                    throw ApiException.InvalidRequest("Đợt chứng chỉ đang được xử lý hoặc không còn ở trạng thái có thể duyệt.");

                updated = await _context.YeuCauChungChiGiangViens
                    .Where(x => x.MaDotGui == maDotGui && x.TrangThai == "ChoDuyet")
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(x => x.TrangThai, "DaDuyet")
                        .SetProperty(x => x.LyDoXuLy, (string?)null)
                        .SetProperty(x => x.NgayDuyet, now)
                        .SetProperty(x => x.NgayCapNhat, now)
                        .SetProperty(x => x.MaQuanTriVienDuyet, maQuanTriVien)
                        .SetProperty(x => x.HienThiCongKhai, false));

                if (updated != batch.Count)
                    throw ApiException.InvalidRequest("Đợt chứng chỉ vừa được xử lý bởi yêu cầu khác. Vui lòng tải lại danh sách.");

                await transaction.CommitAsync();
            });

            _logger.LogInformation(
                "Admin {ActorId} duyệt đợt chứng chỉ {MaDotGui} gồm {Count} chứng chỉ từ IP {Ip}.",
                maQuanTriVien,
                maDotGui,
                updated,
                ActorIp());

            return new
            {
                success = true,
                message = $"Đã duyệt {updated} chứng chỉ. Giảng viên có thể chủ động bật hiển thị công khai."
            };
        }

        public async Task<object> XuLyChungChiAsync(
            Guid maDotGui,
            int maQuanTriVien,
            string trangThai,
            XuLyChungChiRequest request)
        {
            if (trangThai is not "CanBoSung" and not "TuChoi")
                throw ApiException.InvalidRequest("Trạng thái xử lý chứng chỉ không hợp lệ.");

            var lyDo = request.LyDo.Trim();
            if (string.IsNullOrWhiteSpace(lyDo))
                throw ApiException.InvalidRequest("Vui lòng nhập lý do xử lý chứng chỉ.");

            var now = DateTime.UtcNow;
            var updated = 0;
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();
                var batch = await _context.YeuCauChungChiGiangViens
                    .AsNoTracking()
                    .Where(x => x.MaDotGui == maDotGui)
                    .Select(x => new { x.TrangThai })
                    .ToListAsync();
                if (batch.Count == 0)
                    throw ApiException.InvalidRequest("Không tìm thấy đợt gửi chứng chỉ.");
                if (batch.Any(x => x.TrangThai != "ChoDuyet"))
                    throw ApiException.InvalidRequest("Đợt chứng chỉ đang được xử lý hoặc không còn ở trạng thái chờ duyệt.");

                updated = await _context.YeuCauChungChiGiangViens
                    .Where(x => x.MaDotGui == maDotGui && x.TrangThai == "ChoDuyet")
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(x => x.TrangThai, trangThai)
                        .SetProperty(x => x.LyDoXuLy, lyDo)
                        .SetProperty(x => x.NgayDuyet, (DateTime?)null)
                        .SetProperty(x => x.NgayCapNhat, now)
                        .SetProperty(x => x.MaQuanTriVienDuyet, maQuanTriVien)
                        .SetProperty(x => x.HienThiCongKhai, false));

                if (updated != batch.Count)
                    throw ApiException.InvalidRequest("Đợt chứng chỉ vừa được xử lý bởi yêu cầu khác. Vui lòng tải lại danh sách.");

                await transaction.CommitAsync();
            });

            _logger.LogInformation(
                "Admin {ActorId} chuyển đợt chứng chỉ {MaDotGui} gồm {Count} chứng chỉ sang {TrangThai} từ IP {Ip}.",
                maQuanTriVien,
                maDotGui,
                updated,
                trangThai,
                ActorIp());

            return new
            {
                success = true,
                message = trangThai == "CanBoSung"
                    ? $"Đã yêu cầu giảng viên bổ sung đợt gồm {updated} chứng chỉ."
                    : $"Đã từ chối đợt gồm {updated} chứng chỉ."
            };
        }

        public async Task<object> LayChiTietHoSoAsync(long maHoSo)
        {
            var hoSo = await _context.HoSoDangKyGiangViens
                .AsNoTracking()
                .Where(h =>
                    h.MaHoSoDangKyGiangVien == maHoSo &&
                    h.TrangThaiHoSo != "DangTaiTaiLieu" &&
                    h.TrangThaiHoSo != "DangBoSung")
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
                    NgayDuyet = h.NgayDuyet,
                    DaNopBoSung = h.DaNopBoSung,
                    NgayNopBoSung = h.NgayNopBoSung,
                    TaiLieus = h.TaiLieus
                        .OrderBy(t => t.LoaiTaiLieu)
                        .ThenByDescending(t => t.NgayTaiLen)
                        .Select(t => new HoSoGiangVienTaiLieuDTO
                        {
                            MaTaiLieu = t.MaTaiLieu,
                            LoaiTaiLieu = t.LoaiTaiLieu,
                            TenFile = t.TenFileGoc,
                            ContentType = t.ContentType,
                            KichThuoc = t.KichThuoc,
                            TrangThai = t.TrangThai,
                            LyDoTuChoi = t.LyDoTuChoi,
                            NgayTaiLen = t.NgayTaiLen,
                            NgayDuyet = t.NgayDuyet,
                            TenChungChi = t.TenChungChi,
                            DonViCap = t.DonViCap,
                            NgayCapChungChi = t.NgayCapChungChi,
                            NgayHetHanChungChi = t.NgayHetHanChungChi,
                            MaChungChi = t.MaChungChi,
                            UrlXacMinh = t.UrlXacMinh,
                            DownloadUrl = $"/api/QuanTriVien/quan-ly-ho-so-giang-vien/{h.MaHoSoDangKyGiangVien}/tai-lieu/{t.MaTaiLieu}"
                        })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (hoSo == null) throw ApiException.InvalidRequest("Không tìm thấy hồ sơ đăng ký giảng viên.");

            hoSo.AnhDaiDienUrl = GetExistingPublicFileUrl(hoSo.AnhDaiDienUrl);

            if (!string.IsNullOrWhiteSpace(hoSo.DuLieuCccdMaHoa)
                && TryGiaiMaThongTinCccd(hoSo.DuLieuCccdMaHoa, out var thongTinCccd))
            {
                hoSo.ThongTinCccdQuet = thongTinCccd;
            }

            return hoSo;
        }

        public async Task<HoSoGiangVienTaiLieuDownloadDTO> TaiTaiLieuAsync(long maHoSo, long maTaiLieu)
        {
            var taiLieu = await _context.HoSoGiangVienTaiLieus
                .AsNoTracking()
                .FirstOrDefaultAsync(t =>
                    t.MaTaiLieu == maTaiLieu &&
                    t.MaHoSoDangKyGiangVien == maHoSo);

            if (taiLieu == null)
                throw ApiException.InvalidRequest("Không tìm thấy tài liệu trong hồ sơ này.");

            var path = _taiLieuStorage.ResolvePath(taiLieu.StorageKey);
            try
            {
                return new HoSoGiangVienTaiLieuDownloadDTO
                {
                    NoiDung = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read, 81920, true),
                    ContentType = taiLieu.ContentType,
                    TenFile = taiLieu.TenFileGoc
                };
            }
            catch (FileNotFoundException)
            {
                _logger.LogWarning("Thiếu file tài liệu {MaTaiLieu} của hồ sơ {MaHoSo}.", maTaiLieu, maHoSo);
                throw ApiException.InvalidRequest("Tài liệu hiện không khả dụng.");
            }
            catch (DirectoryNotFoundException)
            {
                _logger.LogWarning("Thiếu thư mục tài liệu {MaTaiLieu} của hồ sơ {MaHoSo}.", maTaiLieu, maHoSo);
                throw ApiException.InvalidRequest("Tài liệu hiện không khả dụng.");
            }
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
                .AsNoTracking()
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

                    var taiLieus = await _context.HoSoGiangVienTaiLieus
                        .Where(t => t.MaHoSoDangKyGiangVien == maHoSo)
                        .ToListAsync();
                    if (!taiLieus.Any(t => t.LoaiTaiLieu == "CV" && t.TrangThai == "ChoDuyet"))
                        throw ApiException.InvalidRequest("Hồ sơ chưa có CV hợp lệ để duyệt.");

                    var ngayDuyet = DateTime.UtcNow;
                    foreach (var taiLieu in taiLieus.Where(t => t.TrangThai == "ChoDuyet"))
                    {
                        taiLieu.TrangThai = "DaDuyet";
                        taiLieu.LyDoTuChoi = null;
                        taiLieu.NgayDuyet = ngayDuyet;
                    }

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

                    // Link hồ sơ với tài khoản vừa tạo mà không attach lại projection cũ.
                    // Predicate DangDuyet ngăn một trạng thái khác bị ghi đè bởi entity stale.
                    var finalized = await _context.HoSoDangKyGiangViens
                        .Where(h => h.MaHoSoDangKyGiangVien == maHoSo && h.TrangThaiHoSo == "DangDuyet")
                        .ExecuteUpdateAsync(setters => setters
                            .SetProperty(h => h.MaNguoiDung, nguoiDungMoi.MaNguoiDung)
                            .SetProperty(h => h.TrangThaiHoSo, "DaDuyet")
                            .SetProperty(h => h.MaQuanTriVienDuyet, maQuanTriVien)
                            .SetProperty(h => h.NgayDuyet, ngayDuyet)
                            .SetProperty(h => h.NgayCapNhat, ngayDuyet)
                            .SetProperty(h => h.MatKhau, string.Empty)
                            .SetProperty(h => h.LyDoTuChoi, (string?)null)
                            .SetProperty(h => h.BoSungToken, (string?)null)
                            .SetProperty(h => h.BoSungTokenHetHan, (DateTime?)null));
                    if (finalized != 1)
                        throw ApiException.InvalidRequest("Không thể hoàn tất duyệt hồ sơ do trạng thái đã thay đổi.");

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
            var safeHoTen = WebUtility.HtmlEncode(hoSo.HoTen);
            var safeTaiKhoan = WebUtility.HtmlEncode(hoSo.TaiKhoan);
            var safeEmail = WebUtility.HtmlEncode(hoSo.Email);
            string subject = "Hồ sơ giảng viên EduCodeAI đã được duyệt";
            string body = $@"
            <div style='font-family: ""Segoe UI"", Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#fff; border-radius:12px; border:1px solid #eaeaea; overflow:hidden;'>
                <div style='background:#fcfcfc; padding:25px 0; text-align:center; border-bottom:1px solid #f0f0f0;'>
                    <h1 style='margin:0; font-size:28px; font-weight:800; color:#333;'>EDUCODE<span style='color:#fb873f;'>AI</span></h1>
                </div>
                <div style='padding:40px 30px;'>
                    <h2 style='color:#2c3e50; text-align:center;'>Chúc mừng! Hồ sơ đã được duyệt</h2>
                    <p style='color:#555; font-size:16px; line-height:1.6;'>
                        Xin chào <b>{safeHoTen}</b>,<br><br>
                        Hồ sơ đăng ký giảng viên của bạn đã được đội ngũ EduCodeAI phê duyệt.
                        Bạn đã có thể đăng nhập vào hệ thống với thông tin sau:
                    </p>
                    <div style='background:#fff8f3; border:2px dashed #fb873f; border-radius:12px; padding:20px; text-align:center; margin:20px auto; max-width:360px;'>
                        <p style='margin:0 0 8px; color:#555;'>Tài khoản: <b>{safeTaiKhoan}</b></p>
                        <p style='margin:0; color:#555;'>Email: <b>{safeEmail}</b></p>
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
            var emailSent = await EmailHelper.SendEmailAsync(hoSo.Email, subject, body);
            if (!emailSent)
                _logger.LogWarning("Gửi email duyệt hồ sơ {MaHoSo} thất bại.", maHoSo);

            return new
            {
                success = true,
                message = emailSent
                    ? "Đã duyệt hồ sơ, tạo tài khoản giảng viên và gửi email thông báo."
                    : "Đã duyệt hồ sơ và tạo tài khoản giảng viên, nhưng chưa gửi được email thông báo.",
                maNguoiDung = maNguoiDungMoi,
                taiKhoan = taiKhoan
            };
        }

        public async Task<object> TuChoiHoSoAsync(long maHoSo, int maQuanTriVien, TuChoiHoSoRequest request)
        {
            var lyDo = request.LyDoTuChoi.Trim();
            var ngayCapNhat = DateTime.UtcNow;
            var hoSo = await _context.HoSoDangKyGiangViens
                .AsNoTracking()
                .Where(h => h.MaHoSoDangKyGiangVien == maHoSo)
                .Select(h => new { h.Email, h.HoTen })
                .FirstOrDefaultAsync();
            if (hoSo == null)
                throw ApiException.InvalidRequest("Không tìm thấy hồ sơ đăng ký giảng viên.");

            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var tx = await _context.Database.BeginTransactionAsync();
                var transitioned = await _context.HoSoDangKyGiangViens
                    .Where(h => h.MaHoSoDangKyGiangVien == maHoSo && h.TrangThaiHoSo == "ChoDuyet")
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(h => h.TrangThaiHoSo, "TuChoi")
                        .SetProperty(h => h.LyDoTuChoi, lyDo)
                        .SetProperty(h => h.MaQuanTriVienDuyet, maQuanTriVien)
                        .SetProperty(h => h.NgayCapNhat, ngayCapNhat));
                if (transitioned == 0)
                    throw ApiException.InvalidRequest("Hồ sơ đang được xử lý hoặc không còn ở trạng thái chờ duyệt.");

                await _context.HoSoGiangVienTaiLieus
                    .Where(t => t.MaHoSoDangKyGiangVien == maHoSo && t.TrangThai == "ChoDuyet")
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(t => t.TrangThai, "TuChoi")
                        .SetProperty(t => t.LyDoTuChoi, lyDo)
                        .SetProperty(t => t.NgayDuyet, (DateTime?)null));
                await tx.CommitAsync();
            });

            // I.9: audit hành động admin (không log dữ liệu nhạy cảm).
            _logger.LogInformation("Admin {ActorId} từ chối hồ sơ {MaHoSo} từ IP {Ip}.",
                maQuanTriVien, maHoSo, ActorIp());

            var safeHoTenTuChoi = WebUtility.HtmlEncode(hoSo.HoTen);
            var safeLyDoTuChoi = WebUtility.HtmlEncode(lyDo);
            string subject = "Kết quả hồ sơ đăng ký giảng viên EduCodeAI";
            string body = $@"
            <div style='font-family: ""Segoe UI"", Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#fff; border-radius:12px; border:1px solid #eaeaea; overflow:hidden;'>
                <div style='background:#fcfcfc; padding:25px 0; text-align:center; border-bottom:1px solid #f0f0f0;'>
                    <h1 style='margin:0; font-size:28px; font-weight:800; color:#333;'>EDUCODE<span style='color:#fb873f;'>AI</span></h1>
                </div>
                <div style='padding:40px 30px;'>
                    <h2 style='color:#c0392b; text-align:center;'>Hồ sơ chưa được duyệt</h2>
                    <p style='color:#555; font-size:16px; line-height:1.6;'>
                        Xin chào <b>{safeHoTenTuChoi}</b>,<br><br>
                        Rất tiếc, hồ sơ đăng ký giảng viên của bạn <b>chưa được phê duyệt</b> với lý do sau:
                    </p>
                    <div style='background:#fdecea; border-left:4px solid #c0392b; padding:15px 20px; margin:20px 0; color:#c0392b; font-size:15px;'>
                        {safeLyDoTuChoi}
                    </div>
                    <p style='color:#555; font-size:16px; line-height:1.6;'>
                        Nếu bạn cho rằng đây là sự nhầm lẫn hoặc cần hỗ trợ, vui lòng liên hệ đội ngũ EduCodeAI.
                    </p>
                </div>
                <div style='background:#f9f9f9; padding:20px; text-align:center; border-top:1px solid #eee;'>
                    <p style='color:#999; font-size:13px; margin:0;'>&copy; {DateTime.Now.Year} EduCodeAI. All rights reserved.</p>
                </div>
            </div>";
            var emailSent = await EmailHelper.SendEmailAsync(hoSo.Email, subject, body);
            if (!emailSent)
                _logger.LogWarning("Gửi email từ chối hồ sơ {MaHoSo} thất bại.", maHoSo);

            return new
            {
                success = true,
                message = emailSent
                    ? "Đã từ chối hồ sơ và gửi email thông báo."
                    : "Đã từ chối hồ sơ, nhưng chưa gửi được email thông báo."
            };
        }

        public async Task<object> YeuCauBoSungHoSoAsync(long maHoSo, int maQuanTriVien, YeuCauBoSungHoSoRequest request)
        {
            var hoSo = await _context.HoSoDangKyGiangViens
                .AsNoTracking()
                .Where(h => h.MaHoSoDangKyGiangVien == maHoSo)
                .Select(h => new { h.Email, h.HoTen })
                .FirstOrDefaultAsync();
            if (hoSo == null)
                throw ApiException.InvalidRequest("Không tìm thấy hồ sơ đăng ký giảng viên.");

            // Sinh token CSPRNG; DB chỉ lưu hash, plaintext chỉ tồn tại để gửi email.
            var tokenMaterial = _tokenService.CreateRefreshTokenMaterial();
            var plainToken = tokenMaterial.PlainToken;
            var tokenHash = _tokenService.HashRefreshToken(plainToken);
            var ngayCapNhat = DateTime.UtcNow;
            var hetHan = ngayCapNhat.AddHours(24);
            var noiDungBoSung = request.NoiDungBoSung.Trim();

            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var tx = await _context.Database.BeginTransactionAsync();
                var transitioned = await _context.HoSoDangKyGiangViens
                    .Where(h =>
                        h.MaHoSoDangKyGiangVien == maHoSo &&
                        (h.TrangThaiHoSo == "ChoDuyet" || h.TrangThaiHoSo == "CanBoSung"))
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(h => h.BoSungToken, tokenHash)
                        .SetProperty(h => h.BoSungTokenHetHan, hetHan)
                        .SetProperty(h => h.DaNopBoSung, false)
                        .SetProperty(h => h.NgayNopBoSung, (DateTime?)null)
                        .SetProperty(h => h.TrangThaiHoSo, "CanBoSung")
                        .SetProperty(h => h.LyDoTuChoi, noiDungBoSung)
                        .SetProperty(h => h.MaQuanTriVienDuyet, maQuanTriVien)
                        .SetProperty(h => h.NgayCapNhat, ngayCapNhat));
                if (transitioned != 1)
                    throw ApiException.InvalidRequest("Hồ sơ đang được xử lý hoặc không còn ở trạng thái chờ duyệt.");

                await _context.HoSoGiangVienTaiLieus
                    .Where(t =>
                        t.MaHoSoDangKyGiangVien == maHoSo &&
                        t.TrangThai == "ChoDuyet")
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(t => t.TrangThai, "TuChoi")
                        .SetProperty(t => t.LyDoTuChoi, noiDungBoSung)
                        .SetProperty(t => t.NgayDuyet, (DateTime?)null));
                await tx.CommitAsync();
            });

            // I.9: audit hành động yêu cầu bổ sung (actor admin, hồ sơ, IP) — không log token/PII.
            _logger.LogInformation("Admin {ActorId} yêu cầu bổ sung hồ sơ {MaHoSo} từ IP {Ip}.",
                maQuanTriVien, maHoSo, ActorIp());

            // Gửi email với link bổ sung — dùng plaintext token, KHÔNG lưu plaintext ở đâu.
            string boSungLink = $"{_mailOptions.FrontendGiangVienBoSungUrl}/{maHoSo}?token={plainToken}";
            var safeHoTenBoSung = WebUtility.HtmlEncode(hoSo.HoTen);
            var safeNoiDungBoSung = WebUtility.HtmlEncode(noiDungBoSung);
            var safeBoSungLink = WebUtility.HtmlEncode(boSungLink);
            string subject = "Yêu cầu bổ sung hồ sơ đăng ký giảng viên EduCodeAI";
            string body = $@"
            <div style='font-family: ""Segoe UI"", Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#fff; border-radius:12px; border:1px solid #eaeaea; overflow:hidden;'>
                <div style='background:#fcfcfc; padding:25px 0; text-align:center; border-bottom:1px solid #f0f0f0;'>
                    <h1 style='margin:0; font-size:28px; font-weight:800; color:#333;'>EDUCODE<span style='color:#fb873f;'>AI</span></h1>
                </div>
                <div style='padding:40px 30px;'>
                    <h2 style='color:#2c3e50; text-align:center;'>Cần bổ sung thông tin hồ sơ</h2>
                    <p style='color:#555; font-size:16px; line-height:1.6;'>
                        Xin chào <b>{safeHoTenBoSung}</b>,<br><br>
                        Hồ sơ đăng ký giảng viên của bạn cần <b>bổ sung thêm thông tin</b> trước khi được phê duyệt:
                    </p>
                    <div style='background:#fff8f3; border:2px dashed #fb873f; border-radius:12px; padding:15px 20px; margin:20px 0; color:#555; font-size:15px;'>
                        {safeNoiDungBoSung}
                    </div>
                    <p style='color:#555; font-size:16px; line-height:1.6;'>
                        Vui lòng nhấn nút bên dưới để cập nhật hồ sơ. Liên kết này chỉ có hiệu lực trong 24 giờ.
                    </p>
                    <p style='text-align:center; margin:25px 0;'>
                        <a href='{safeBoSungLink}' style='display:inline-block; background:#fb873f; color:white; padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:600;'>Bổ sung hồ sơ tại đây</a>
                    </p>
                    <p style='color:#888; font-size:13px;'>Nếu nút không hoạt động, copy đường dẫn sau vào trình duyệt:<br><code style='background:#f5f5f5; padding:4px 8px; border-radius:4px;'>{safeBoSungLink}</code></p>
                </div>
                <div style='background:#f9f9f9; padding:20px; text-align:center; border-top:1px solid #eee;'>
                    <p style='color:#999; font-size:13px; margin:0;'>&copy; {DateTime.Now.Year} EduCodeAI. All rights reserved.</p>
                </div>
            </div>";

            var emailSent = await EmailHelper.SendEmailAsync(hoSo.Email, subject, body);
            if (!emailSent)
                _logger.LogWarning("Gửi email yêu cầu bổ sung hồ sơ {MaHoSo} thất bại; admin có thể gửi lại để cấp liên kết mới.", maHoSo);

            return new
            {
                success = true,
                message = emailSent
                    ? "Đã yêu cầu bổ sung hồ sơ và gửi email hướng dẫn."
                    : "Đã chuyển hồ sơ sang trạng thái cần bổ sung, nhưng chưa gửi được email. Vui lòng gửi lại yêu cầu để cấp liên kết mới."
            };
        }
        private string? GetExistingPublicFileUrl(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;

            var url = value.Trim();
            if (!url.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase)) return url;

            var relativePath = url.Split('?', '#')[0]
                .TrimStart('/')
                .Replace('/', Path.DirectorySeparatorChar);
            var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            var fullPath = Path.GetFullPath(Path.Combine(webRoot, relativePath));
            var uploadsRoot = Path.GetFullPath(Path.Combine(webRoot, "uploads")) + Path.DirectorySeparatorChar;

            if (!fullPath.StartsWith(uploadsRoot, StringComparison.OrdinalIgnoreCase) || !File.Exists(fullPath))
            {
                _logger.LogWarning("Ảnh đại diện hồ sơ không còn tồn tại tại URL {AvatarUrl}.", url);
                return null;
            }

            return url;
        }

        private static string DeriveCertificateBatchStatus(IEnumerable<string> statuses)
        {
            var values = statuses.Distinct(StringComparer.Ordinal).ToList();
            return values.Count == 1 ? values[0] : "HonHop";
        }

        private static string? DeriveCertificateBatchReason(IEnumerable<string?> reasons)
        {
            var values = reasons
                .Select(value => string.IsNullOrWhiteSpace(value) ? null : value.Trim())
                .Distinct(StringComparer.Ordinal)
                .ToList();
            return values.Count == 1 ? values[0] : null;
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
