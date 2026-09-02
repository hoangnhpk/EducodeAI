using educodeai_server.DTOs.XacThuc;
using educodeai_server.Helpers;
using educodeai_server.Models;
using Microsoft.AspNetCore.Http;
using System.IO.Compression;
using System.Security.Cryptography;

namespace educodeai_server.Services.Interface
{
    public interface IHoSoGiangVienTaiLieuStorage
    {
        Task ValidateAsync(IReadOnlyCollection<IFormFile> cvFiles, IReadOnlyCollection<ChungChiUploadRequest> chungChis, bool requireCv = true);
        Task<IReadOnlyList<HoSoGiangVienTaiLieuModel>> SaveAsync(long maHoSo, IReadOnlyCollection<IFormFile> cvFiles, IReadOnlyCollection<ChungChiUploadRequest> chungChis, bool requireCv = true);
        Task<IReadOnlyList<YeuCauChungChiGiangVienModel>> SaveCertificateRequestsAsync(int maGiangVien, Guid maDotGui, IReadOnlyCollection<ChungChiUploadRequest> chungChis);
        string ResolvePath(string storageKey);
        void DeleteFiles(IEnumerable<HoSoGiangVienTaiLieuModel> taiLieus);
        void DeleteCertificateRequestFiles(IEnumerable<YeuCauChungChiGiangVienModel> taiLieus);
    }

    public sealed class HoSoGiangVienTaiLieuStorage : IHoSoGiangVienTaiLieuStorage
    {
        public const int MaxCvFiles = 2;
        public const int MaxCertificateFiles = 20;
        public const long MaxFileSize = 10 * 1024 * 1024;
        public const long MaxTotalSize = 50 * 1024 * 1024;
        private const int MaxDocxEntries = 512;
        private const long MaxDocxEntrySize = 25 * 1024 * 1024;
        private const long MaxDocxUncompressedSize = 75 * 1024 * 1024;
        private const long MaxDocxCompressionRatio = 200;
        private const int MaxContentTypesSize = 1024 * 1024;

        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".pdf", ".docx", ".jpg", ".jpeg", ".png"
        };

        private readonly string _storageRoot;

        public HoSoGiangVienTaiLieuStorage(IWebHostEnvironment env)
        {
            _storageRoot = Path.GetFullPath(Path.Combine(env.ContentRootPath, "private_uploads", "lecturer-applications"));
        }

        public async Task ValidateAsync(IReadOnlyCollection<IFormFile> cvFiles, IReadOnlyCollection<ChungChiUploadRequest> chungChis, bool requireCv = true)
        {
            if (requireCv && cvFiles.Count == 0)
                throw ApiException.InvalidRequest("Vui lòng tải lên ít nhất một file CV.");
            if (cvFiles.Count > MaxCvFiles)
                throw ApiException.InvalidRequest($"Chỉ được tải tối đa {MaxCvFiles} file CV.");
            if (chungChis.Count > MaxCertificateFiles)
                throw ApiException.InvalidRequest($"Chỉ được tải tối đa {MaxCertificateFiles} file chứng chỉ.");

            ValidateCertificateMetadata(chungChis);
            var allFiles = cvFiles.Concat(chungChis.Select(chungChi => chungChi.File)).ToList();
            if (allFiles.Sum(file => file.Length) > MaxTotalSize)
                throw ApiException.InvalidRequest("Tổng dung lượng CV và chứng chỉ không được vượt quá 50MB.");

            foreach (var file in allFiles)
            {
                if (file == null || file.Length <= 0)
                    throw ApiException.InvalidRequest("Tài liệu tải lên không được để trống.");
                if (file.Length > MaxFileSize)
                    throw ApiException.InvalidRequest($"File {Path.GetFileName(file.FileName)} vượt quá 10MB.");

                var extension = Path.GetExtension(file.FileName);
                if (!AllowedExtensions.Contains(extension))
                    throw ApiException.InvalidRequest($"File {Path.GetFileName(file.FileName)} phải là PDF, DOCX, JPG hoặc PNG.");
                if (!await HasValidSignatureAsync(file, extension))
                    throw ApiException.InvalidRequest($"Nội dung file {Path.GetFileName(file.FileName)} không đúng định dạng.");
            }
        }

        public async Task<IReadOnlyList<HoSoGiangVienTaiLieuModel>> SaveAsync(
            long maHoSo,
            IReadOnlyCollection<IFormFile> cvFiles,
            IReadOnlyCollection<ChungChiUploadRequest> chungChis,
            bool requireCv = true)
        {
            await ValidateAsync(cvFiles, chungChis, requireCv);
            var applicationFolder = Path.Combine(_storageRoot, maHoSo.ToString());
            Directory.CreateDirectory(applicationFolder);
            var result = new List<HoSoGiangVienTaiLieuModel>();
            string? currentPath = null;

            try
            {
                foreach (var file in cvFiles)
                {
                    var document = await SaveFileAsync(maHoSo, file, "CV");
                    result.Add(document);
                }

                foreach (var chungChi in chungChis)
                {
                    var document = await SaveFileAsync(maHoSo, chungChi.File, "ChungChi");
                    result.Add(document);
                    document.ClientFileId = chungChi.ClientId;
                    document.TenChungChi = NormalizeRequired(chungChi.TenChungChi);
                    document.DonViCap = NormalizeOptional(chungChi.DonViCap);
                    document.NgayCapChungChi = chungChi.NgayCap;
                    document.NgayHetHanChungChi = chungChi.NgayHetHan;
                    document.MaChungChi = NormalizeOptional(chungChi.MaChungChi);
                    document.UrlXacMinh = NormalizeOptional(chungChi.UrlXacMinh);
                    document.RelativePath = SafeRelativePath(chungChi.RelativePath);
                }

                return result;
            }
            catch
            {
                if (currentPath != null)
                {
                    try
                    {
                        if (File.Exists(currentPath)) File.Delete(currentPath);
                    }
                    catch
                    {
                        // Best-effort cleanup; preserve the original upload error.
                    }
                }

                DeleteFiles(result);
                throw;
            }

            async Task<HoSoGiangVienTaiLieuModel> SaveFileAsync(long applicationId, IFormFile file, string type)
            {
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                var generatedName = $"{Guid.NewGuid():N}{extension}";
                var storageKey = $"{applicationId}/{generatedName}";
                var fullPath = ResolvePath(storageKey);
                currentPath = fullPath;

                await using var source = file.OpenReadStream();
                await using var destination = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, true);
                using var hash = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
                var buffer = new byte[81920];
                int read;
                while ((read = await source.ReadAsync(buffer)) > 0)
                {
                    await destination.WriteAsync(buffer.AsMemory(0, read));
                    hash.AppendData(buffer, 0, read);
                }

                currentPath = null;
                return new HoSoGiangVienTaiLieuModel
                {
                    MaHoSoDangKyGiangVien = applicationId,
                    LoaiTaiLieu = type,
                    TenFileGoc = SafeDisplayName(file.FileName),
                    StorageKey = storageKey,
                    ContentType = ContentTypeFor(extension),
                    KichThuoc = file.Length,
                    Sha256 = Convert.ToHexString(hash.GetHashAndReset()),
                    TrangThai = "ChoDuyet",
                    NgayTaiLen = DateTime.UtcNow
                };
            }
        }

        public async Task<IReadOnlyList<YeuCauChungChiGiangVienModel>> SaveCertificateRequestsAsync(
            int maGiangVien,
            Guid maDotGui,
            IReadOnlyCollection<ChungChiUploadRequest> chungChis)
        {
            await ValidateAsync(Array.Empty<IFormFile>(), chungChis, requireCv: false);
            var result = new List<YeuCauChungChiGiangVienModel>();

            try
            {
                foreach (var chungChi in chungChis)
                {
                    var extension = Path.GetExtension(chungChi.File.FileName).ToLowerInvariant();
                    var storageKey = $"certificate-requests/{maGiangVien}/{Guid.NewGuid():N}{extension}";
                    var fullPath = ResolvePath(storageKey);
                    Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

                    await using var source = chungChi.File.OpenReadStream();
                    await using var destination = new FileStream(
                        fullPath,
                        FileMode.CreateNew,
                        FileAccess.Write,
                        FileShare.None,
                        81920,
                        true);
                    using var hash = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
                    var buffer = new byte[81920];
                    int read;
                    while ((read = await source.ReadAsync(buffer)) > 0)
                    {
                        await destination.WriteAsync(buffer.AsMemory(0, read));
                        hash.AppendData(buffer, 0, read);
                    }

                    result.Add(new YeuCauChungChiGiangVienModel
                    {
                        MaGiangVien = maGiangVien,
                        ClientRequestId = chungChi.ClientId,
                        MaDotGui = maDotGui,
                        TenChungChi = NormalizeRequired(chungChi.TenChungChi),
                        DonViCap = NormalizeOptional(chungChi.DonViCap),
                        NgayCap = chungChi.NgayCap,
                        NgayHetHan = chungChi.NgayHetHan,
                        MaChungChi = NormalizeOptional(chungChi.MaChungChi),
                        UrlXacMinh = NormalizeOptional(chungChi.UrlXacMinh),
                        TenFileGoc = SafeDisplayName(chungChi.File.FileName),
                        StorageKey = storageKey,
                        ContentType = ContentTypeFor(extension),
                        KichThuoc = chungChi.File.Length,
                        Sha256 = Convert.ToHexString(hash.GetHashAndReset()),
                        TrangThai = "ChoDuyet",
                        HienThiCongKhai = false,
                        NgayTao = DateTime.UtcNow,
                        NgayCapNhat = DateTime.UtcNow
                    });
                }

                return result;
            }
            catch
            {
                DeleteCertificateRequestFiles(result);
                throw;
            }
        }

        public string ResolvePath(string storageKey)
        {
            var normalizedKey = storageKey.Replace('/', Path.DirectorySeparatorChar);
            var fullPath = Path.GetFullPath(Path.Combine(_storageRoot, normalizedKey));
            var rootPrefix = _storageRoot.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            if (!fullPath.StartsWith(rootPrefix, StringComparison.OrdinalIgnoreCase))
                throw ApiException.InvalidRequest("Đường dẫn tài liệu không hợp lệ.");
            return fullPath;
        }

        public void DeleteFiles(IEnumerable<HoSoGiangVienTaiLieuModel> taiLieus)
        {
            foreach (var taiLieu in taiLieus)
            {
                try
                {
                    var path = ResolvePath(taiLieu.StorageKey);
                    if (File.Exists(path)) File.Delete(path);
                }
                catch
                {
                    // Best-effort cleanup; database transaction remains authoritative.
                }
            }
        }

        public void DeleteCertificateRequestFiles(IEnumerable<YeuCauChungChiGiangVienModel> taiLieus)
        {
            foreach (var taiLieu in taiLieus)
            {
                try
                {
                    var path = ResolvePath(taiLieu.StorageKey);
                    if (File.Exists(path)) File.Delete(path);
                }
                catch
                {
                    // Best-effort cleanup; database transaction remains authoritative.
                }
            }
        }

        private static void ValidateCertificateMetadata(IReadOnlyCollection<ChungChiUploadRequest> chungChis)
        {
            var clientIds = new HashSet<Guid>();
            foreach (var chungChi in chungChis)
            {
                if (chungChi.File == null)
                    throw ApiException.InvalidRequest("Mỗi chứng chỉ phải có một file đính kèm.");
                if (chungChi.ClientId == Guid.Empty || !clientIds.Add(chungChi.ClientId))
                    throw ApiException.InvalidRequest("Mã liên kết file chứng chỉ không hợp lệ hoặc bị trùng.");
                if (string.IsNullOrWhiteSpace(chungChi.TenChungChi))
                    throw ApiException.InvalidRequest("Vui lòng nhập tên cho từng chứng chỉ.");
                if (chungChi.TenChungChi.Trim().Length > 200)
                    throw ApiException.InvalidRequest("Tên chứng chỉ không được vượt quá 200 ký tự.");
                if (chungChi.NgayCap.HasValue && chungChi.NgayHetHan.HasValue
                    && chungChi.NgayHetHan.Value < chungChi.NgayCap.Value)
                    throw ApiException.InvalidRequest("Ngày hết hạn chứng chỉ không được trước ngày cấp.");

                var url = NormalizeOptional(chungChi.UrlXacMinh);
                if (url != null && (!Uri.TryCreate(url, UriKind.Absolute, out var parsed)
                    || parsed.Scheme != Uri.UriSchemeHttps
                    || string.IsNullOrWhiteSpace(parsed.Host)
                    || !string.IsNullOrEmpty(parsed.UserInfo)))
                {
                    throw ApiException.InvalidRequest("URL xác minh chứng chỉ phải là địa chỉ HTTPS hợp lệ.");
                }
            }
        }

        private static string NormalizeRequired(string value) => value.Trim();

        private static string? NormalizeOptional(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();

        private static string? SafeRelativePath(string? relativePath)
        {
            var value = NormalizeOptional(relativePath)?.Replace('\\', '/');
            if (value == null) return null;
            value = string.Join('/', value.Split('/', StringSplitOptions.RemoveEmptyEntries)
                .Where(segment => segment is not "." and not ".."));
            return value.Length switch
            {
                0 => null,
                <= 500 => value,
                _ => value[^500..]
            };
        }

        private static string SafeDisplayName(string fileName)
        {
            var safeName = Path.GetFileName(fileName).Trim();
            if (string.IsNullOrWhiteSpace(safeName)) safeName = "tai-lieu";
            return safeName.Length <= 255 ? safeName : safeName[..255];
        }

        private static string ContentTypeFor(string extension) => extension switch
        {
            ".pdf" => "application/pdf",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".png" => "image/png",
            _ => "image/jpeg"
        };

        private static async Task<bool> HasValidSignatureAsync(IFormFile file, string extension)
        {
            try
            {
                await using var stream = file.OpenReadStream();
                if (extension.Equals(".pdf", StringComparison.OrdinalIgnoreCase))
                {
                    // ISO 32000 cho phép header %PDF- xuất hiện trong 1024 byte đầu.
                    // Một số phần mềm xuất PDF thêm BOM/metadata trước header nên kiểm đúng byte 0
                    // sẽ từ chối nhầm file PDF hợp lệ.
                    var pdfHeaderArea = new byte[Math.Min(1024, checked((int)file.Length))];
                    var totalRead = 0;
                    while (totalRead < pdfHeaderArea.Length)
                    {
                        var read = await stream.ReadAsync(pdfHeaderArea.AsMemory(totalRead));
                        if (read == 0) break;
                        totalRead += read;
                    }
                    return pdfHeaderArea.AsSpan(0, totalRead).IndexOf("%PDF-"u8) >= 0;
                }

                var header = new byte[12];
                var bytesRead = 0;
                while (bytesRead < header.Length)
                {
                    var read = await stream.ReadAsync(header.AsMemory(bytesRead));
                    if (read == 0) break;
                    bytesRead += read;
                }

                if (extension.Equals(".jpg", StringComparison.OrdinalIgnoreCase) || extension.Equals(".jpeg", StringComparison.OrdinalIgnoreCase))
                    return bytesRead >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;
                if (extension.Equals(".png", StringComparison.OrdinalIgnoreCase))
                    return bytesRead >= 8 && header.AsSpan(0, 8).SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A });
                if (!extension.Equals(".docx", StringComparison.OrdinalIgnoreCase) || bytesRead < 4
                    || header[0] != 0x50 || header[1] != 0x4B || header[2] != 0x03 || header[3] != 0x04)
                    return false;

                stream.Position = 0;
                using var archive = new ZipArchive(stream, ZipArchiveMode.Read, leaveOpen: true);
                if (archive.Entries.Count == 0 || archive.Entries.Count > MaxDocxEntries) return false;

                var names = new HashSet<string>(StringComparer.Ordinal);
                long totalUncompressedSize = 0;
                foreach (var entry in archive.Entries)
                {
                    var name = entry.FullName;
                    if (!IsCanonicalArchiveEntryName(name) || !names.Add(name)) return false;
                    if (entry.Length > MaxDocxEntrySize) return false;
                    totalUncompressedSize = checked(totalUncompressedSize + entry.Length);
                    if (totalUncompressedSize > MaxDocxUncompressedSize) return false;
                    if (entry.Length > 0 && (entry.CompressedLength == 0
                        || entry.Length / Math.Max(1, entry.CompressedLength) > MaxDocxCompressionRatio))
                    {
                        return false;
                    }
                }

                var contentTypes = archive.GetEntry("[Content_Types].xml");
                var document = archive.GetEntry("word/document.xml");
                if (contentTypes == null || document == null || contentTypes.Length > MaxContentTypesSize) return false;

                using var contentTypesStream = contentTypes.Open();
                using var reader = new StreamReader(contentTypesStream);
                var content = await reader.ReadToEndAsync();
                return content.Contains(
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
                    StringComparison.OrdinalIgnoreCase);
            }
            catch
            {
                return false;
            }
        }

        private static bool IsCanonicalArchiveEntryName(string name)
        {
            if (string.IsNullOrWhiteSpace(name) || name.Contains('\\') || name.StartsWith('/')) return false;
            var segments = name.Split('/', StringSplitOptions.RemoveEmptyEntries);
            return segments.Length > 0 && segments.All(segment => segment is not "." and not "..");
        }
    }
}
