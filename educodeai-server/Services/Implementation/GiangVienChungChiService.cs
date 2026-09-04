using educodeai_server.Common;
using educodeai_server.Data;
using educodeai_server.DTOs.GiangVienChungChi;
using educodeai_server.DTOs.XacThuc;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public sealed class GiangVienChungChiService : IGiangVienChungChiService
    {
        private readonly EduCodeAIDbContext _context;
        private readonly IHoSoGiangVienTaiLieuStorage _storage;

        public GiangVienChungChiService(
            EduCodeAIDbContext context,
            IHoSoGiangVienTaiLieuStorage storage)
        {
            _context = context;
            _storage = storage;
        }

        public async Task<IReadOnlyList<DotGuiChungChiGiangVienDTO>> LayDanhSachAsync(int maGiangVien)
        {
            var rows = await _context.YeuCauChungChiGiangViens
                .AsNoTracking()
                .Where(x => x.MaGiangVien == maGiangVien)
                .OrderByDescending(x => x.NgayTao)
                .ThenByDescending(x => x.MaYeuCauChungChi)
                .Select(x => new
                {
                    x.MaDotGui,
                    x.MaYeuCauChungChi,
                    x.ClientRequestId,
                    x.PhienBan,
                    x.TenChungChi,
                    x.DonViCap,
                    x.NgayCap,
                    x.NgayHetHan,
                    x.MaChungChi,
                    x.UrlXacMinh,
                    x.TrangThai,
                    x.LyDoXuLy,
                    x.HienThiCongKhai,
                    x.NgayTao,
                    x.NgayCapNhat,
                    x.NgayDuyet
                })
                .ToListAsync();

            return rows
                .GroupBy(x => x.MaDotGui)
                .Select(group =>
                {
                    var children = group.ToList();
                    return new DotGuiChungChiGiangVienDTO
                    {
                        MaDotGui = group.Key,
                        TrangThai = DeriveBatchStatus(children.Select(x => x.TrangThai)),
                        LyDoXuLy = DeriveBatchReason(children.Select(x => x.LyDoXuLy)),
                        NgayTaiLen = group.Min(x => x.NgayTao),
                        NgayCapNhat = group.Max(x => x.NgayCapNhat),
                        NgayDuyet = children.All(x => x.TrangThai == "DaDuyet")
                            ? children.Max(x => x.NgayDuyet)
                            : null,
                        ChungChis = children.Select(x => new ChungChiGiangVienDTO
                        {
                            MaTaiLieu = x.MaYeuCauChungChi,
                            ClientRequestId = x.ClientRequestId,
                            PhienBan = x.PhienBan,
                            TenChungChi = x.TenChungChi,
                            DonViCap = x.DonViCap,
                            NgayCap = x.NgayCap,
                            NgayHetHan = x.NgayHetHan,
                            MaChungChi = x.TrangThai == "CanBoSung" ? x.MaChungChi : null,
                            MaChungChiChe = MaskCredentialId(x.MaChungChi),
                            UrlXacMinh = x.TrangThai == "CanBoSung" ? x.UrlXacMinh : null,
                            TrangThai = x.TrangThai,
                            LyDoXuLy = x.LyDoXuLy,
                            HienThiCongKhai = x.TrangThai == "DaDuyet" && x.HienThiCongKhai,
                            NgayTaiLen = x.NgayTao,
                            NgayCapNhat = x.NgayCapNhat,
                            NgayDuyet = x.NgayDuyet
                        }).ToList()
                    };
                })
                .OrderByDescending(x => x.NgayTaiLen)
                .ToList();
        }

        public async Task<object> GuiYeuCauAsync(int maGiangVien, GuiYeuCauChungChiRequest request)
        {
            if (request.Certificates.Count == 0)
                throw ApiException.InvalidRequest("Vui lòng chọn ít nhất một chứng chỉ.");

            var isLecturer = await _context.NguoiDungs
                .AsNoTracking()
                .AnyAsync(x =>
                    x.MaNguoiDung == maGiangVien &&
                    x.VaiTro == 1 &&
                    x.TrangThai == "Hoạt động");
            if (!isLecturer)
                throw ApiException.InvalidRequest("Tài khoản giảng viên không hợp lệ hoặc đang bị khóa.");

            await _storage.ValidateAsync(
                Array.Empty<IFormFile>(),
                request.Certificates,
                requireCv: false);

            var maDotGui = Guid.NewGuid();
            IReadOnlyList<YeuCauChungChiGiangVienModel> requests =
                Array.Empty<YeuCauChungChiGiangVienModel>();
            try
            {
                requests = await _storage.SaveCertificateRequestsAsync(
                    maGiangVien,
                    maDotGui,
                    request.Certificates);
                _context.YeuCauChungChiGiangViens.AddRange(requests);
                await _context.SaveChangesAsync();
            }
            catch
            {
                _storage.DeleteCertificateRequestFiles(requests);
                throw;
            }

            return new
            {
                success = true,
                message = $"Đã gửi {requests.Count} chứng chỉ để quản trị viên duyệt.",
                soLuong = requests.Count
            };
        }

        public async Task<object> BoSungAsync(
            int maGiangVien,
            Guid maDotGui,
            BoSungDotChungChiRequest request)
        {
            if (request.Certificates.Count == 0)
                throw ApiException.InvalidRequest("Vui lòng chọn ít nhất một chứng chỉ cần bổ sung.");

            var duplicateId = request.Certificates
                .GroupBy(x => x.MaTaiLieu)
                .FirstOrDefault(group => group.Key <= 0 || group.Count() > 1);
            if (duplicateId != null)
                throw ApiException.InvalidRequest("Danh sách chứng chỉ bổ sung có mã không hợp lệ hoặc bị trùng.");

            var requestedIds = request.Certificates.Select(x => x.MaTaiLieu).ToList();
            var currentRows = await _context.YeuCauChungChiGiangViens
                .AsNoTracking()
                .Where(x =>
                    x.MaGiangVien == maGiangVien &&
                    x.MaDotGui == maDotGui &&
                    requestedIds.Contains(x.MaYeuCauChungChi))
                .ToListAsync();
            if (currentRows.Count != requestedIds.Count)
                throw ApiException.InvalidRequest("Không tìm thấy chứng chỉ cần bổ sung trong đợt gửi này.");
            if (currentRows.Any(x => x.TrangThai != "CanBoSung"))
                throw ApiException.Conflict("Một hoặc nhiều chứng chỉ không còn ở trạng thái cần bổ sung. Vui lòng tải lại.");

            var rowsById = currentRows.ToDictionary(x => x.MaYeuCauChungChi);
            if (request.Certificates.Any(x => rowsById[x.MaTaiLieu].PhienBan != x.PhienBan))
                throw ApiException.Conflict("Thông tin chứng chỉ đã thay đổi. Vui lòng tải lại trước khi gửi bổ sung.");

            var uploads = request.Certificates.Select(item => new ChungChiUploadRequest
            {
                ClientId = rowsById[item.MaTaiLieu].ClientRequestId,
                File = item.File,
                TenChungChi = item.TenChungChi,
                DonViCap = item.DonViCap,
                NgayCap = item.NgayCap,
                NgayHetHan = item.NgayHetHan,
                MaChungChi = item.MaChungChi,
                UrlXacMinh = item.UrlXacMinh
            }).ToList();
            await _storage.ValidateAsync(Array.Empty<IFormFile>(), uploads, requireCv: false);

            IReadOnlyList<YeuCauChungChiGiangVienModel> staged =
                Array.Empty<YeuCauChungChiGiangVienModel>();
            var committed = false;
            try
            {
                staged = await _storage.SaveCertificateRequestsAsync(maGiangVien, maDotGui, uploads);
                var stagedByClientId = staged.ToDictionary(x => x.ClientRequestId);
                var now = DateTime.UtcNow;
                var strategy = _context.Database.CreateExecutionStrategy();

                await strategy.ExecuteAsync(async () =>
                {
                    await using var transaction = await _context.Database.BeginTransactionAsync();

                    foreach (var item in request.Certificates.OrderBy(x => x.MaTaiLieu))
                    {
                        var current = rowsById[item.MaTaiLieu];
                        var replacement = stagedByClientId[current.ClientRequestId];
                        var updated = await _context.YeuCauChungChiGiangViens
                            .Where(x =>
                                x.MaYeuCauChungChi == item.MaTaiLieu &&
                                x.MaGiangVien == maGiangVien &&
                                x.MaDotGui == maDotGui &&
                                x.TrangThai == "CanBoSung" &&
                                x.PhienBan == item.PhienBan)
                            .ExecuteUpdateAsync(setters => setters
                                .SetProperty(x => x.TenChungChi, replacement.TenChungChi)
                                .SetProperty(x => x.DonViCap, replacement.DonViCap)
                                .SetProperty(x => x.NgayCap, replacement.NgayCap)
                                .SetProperty(x => x.NgayHetHan, replacement.NgayHetHan)
                                .SetProperty(x => x.MaChungChi, replacement.MaChungChi)
                                .SetProperty(x => x.UrlXacMinh, replacement.UrlXacMinh)
                                .SetProperty(x => x.TenFileGoc, replacement.TenFileGoc)
                                .SetProperty(x => x.StorageKey, replacement.StorageKey)
                                .SetProperty(x => x.ContentType, replacement.ContentType)
                                .SetProperty(x => x.KichThuoc, replacement.KichThuoc)
                                .SetProperty(x => x.Sha256, replacement.Sha256)
                                .SetProperty(x => x.TrangThai, "ChoDuyet")
                                .SetProperty(x => x.LyDoXuLy, (string?)null)
                                .SetProperty(x => x.HienThiCongKhai, false)
                                .SetProperty(x => x.MaQuanTriVienDuyet, (int?)null)
                                .SetProperty(x => x.NgayDuyet, (DateTime?)null)
                                .SetProperty(x => x.NgayCapNhat, now)
                                .SetProperty(x => x.PhienBan, x => x.PhienBan + 1));
                        if (updated != 1)
                            throw ApiException.Conflict("Chứng chỉ vừa được xử lý ở nơi khác. Vui lòng tải lại.");
                    }

                    await transaction.CommitAsync();
                });
                committed = true;
            }
            finally
            {
                if (!committed) _storage.DeleteCertificateRequestFiles(staged);
            }

            _storage.DeleteCertificateRequestFiles(currentRows);
            return new
            {
                success = true,
                message = $"Đã gửi lại {request.Certificates.Count} chứng chỉ để quản trị viên duyệt.",
                soLuong = request.Certificates.Count
            };
        }

        public async Task<object> CapNhatHienThiAsync(
            int maGiangVien,
            long maTaiLieu,
            bool hienThiCongKhai)
        {
            var updated = await _context.YeuCauChungChiGiangViens
                .Where(x =>
                    x.MaYeuCauChungChi == maTaiLieu &&
                    x.MaGiangVien == maGiangVien &&
                    x.TrangThai == "DaDuyet")
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(x => x.HienThiCongKhai, hienThiCongKhai)
                    .SetProperty(x => x.NgayCapNhat, DateTime.UtcNow));

            if (updated != 1)
                throw ApiException.InvalidRequest(
                    "Chỉ có thể thay đổi hiển thị đối với chứng chỉ đã được duyệt.");

            return new
            {
                success = true,
                message = hienThiCongKhai
                    ? "Đã hiển thị chứng chỉ trên trang khóa học."
                    : "Đã ẩn chứng chỉ khỏi trang khóa học."
            };
        }

        private static string DeriveBatchStatus(IEnumerable<string> statuses)
        {
            var values = statuses.Distinct(StringComparer.Ordinal).ToList();
            return values.Count == 1 ? values[0] : "HonHop";
        }

        private static string? DeriveBatchReason(IEnumerable<string?> reasons)
        {
            var values = reasons
                .Select(value => string.IsNullOrWhiteSpace(value) ? null : value.Trim())
                .Distinct(StringComparer.Ordinal)
                .ToList();
            return values.Count == 1 ? values[0] : null;
        }

        private static string? MaskCredentialId(string? credentialId)
        {
            if (string.IsNullOrWhiteSpace(credentialId)) return null;
            var value = credentialId.Trim();
            return value.Length <= 4 ? "••••" : $"••••{value[^4..]}";
        }
    }
}
