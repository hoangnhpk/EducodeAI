using educodeai_server.DTOs.XacThuc;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Moq;

namespace educodeai_server.Tests.LecturerDocuments;

public sealed class LecturerDocumentStorageTests
{
    [Fact]
    public async Task ValidateAsync_RejectsDuplicateCertificateClientIds()
    {
        using var fixture = new StorageFixture();
        var clientId = Guid.NewGuid();
        var certificates = new[]
        {
            Certificate("first.jpg", clientId, "First"),
            Certificate("second.jpg", clientId, "Second")
        };

        var error = await Assert.ThrowsAsync<ApiException>(() =>
            fixture.Storage.ValidateAsync(Array.Empty<IFormFile>(), certificates, requireCv: false));

        Assert.Equal(StatusCodes.Status400BadRequest, error.StatusCode);
        Assert.Contains("bị trùng", error.SafeMessage);
    }

    [Fact]
    public async Task ValidateAsync_RejectsMissingTitleInvalidDatesAndUnsafeUrl()
    {
        using var fixture = new StorageFixture();
        var missingTitle = Certificate("certificate.jpg", Guid.NewGuid(), " ");
        var invalidDates = Certificate("certificate.jpg", Guid.NewGuid(), "Certificate");
        invalidDates.NgayCap = new DateOnly(2026, 8, 31);
        invalidDates.NgayHetHan = new DateOnly(2026, 8, 30);
        var unsafeUrl = Certificate("certificate.jpg", Guid.NewGuid(), "Certificate");
        unsafeUrl.UrlXacMinh = "https://user:secret@example.com/verify";

        var titleError = await Assert.ThrowsAsync<ApiException>(() =>
            fixture.Storage.ValidateAsync(Array.Empty<IFormFile>(), new[] { missingTitle }, requireCv: false));
        var dateError = await Assert.ThrowsAsync<ApiException>(() =>
            fixture.Storage.ValidateAsync(Array.Empty<IFormFile>(), new[] { invalidDates }, requireCv: false));
        var urlError = await Assert.ThrowsAsync<ApiException>(() =>
            fixture.Storage.ValidateAsync(Array.Empty<IFormFile>(), new[] { unsafeUrl }, requireCv: false));

        Assert.Contains("nhập tên", titleError.SafeMessage);
        Assert.Contains("không được trước ngày cấp", dateError.SafeMessage);
        Assert.Contains("HTTPS hợp lệ", urlError.SafeMessage);
    }

    [Fact]
    public async Task SaveAsync_KeepsEachCertificateMetadataAssociatedWithItsOwnFile()
    {
        using var fixture = new StorageFixture();
        var firstId = Guid.NewGuid();
        var secondId = Guid.NewGuid();
        var first = Certificate("first.jpg", firstId, "Cloud Practitioner");
        first.DonViCap = "Issuer A";
        first.MaChungChi = "ABC12345";
        first.RelativePath = "cloud/first.jpg";
        var second = Certificate("second.jpg", secondId, "Developer Associate");
        second.DonViCap = "Issuer B";
        second.UrlXacMinh = "https://example.com/verify/second";
        second.RelativePath = "developer/second.jpg";
        var certificates = new[] { first, second };

        var saved = await fixture.Storage.SaveAsync(42, Array.Empty<IFormFile>(), certificates, requireCv: false);

        Assert.Collection(saved,
            first =>
            {
                Assert.Equal(firstId, first.ClientFileId);
                Assert.Equal("first.jpg", first.TenFileGoc);
                Assert.Equal("Cloud Practitioner", first.TenChungChi);
                Assert.Equal("Issuer A", first.DonViCap);
                Assert.Equal("ABC12345", first.MaChungChi);
                Assert.Equal("cloud/first.jpg", first.RelativePath);
                Assert.DoesNotContain("first.jpg", first.StorageKey);
                Assert.True(File.Exists(fixture.Storage.ResolvePath(first.StorageKey)));
            },
            second =>
            {
                Assert.Equal(secondId, second.ClientFileId);
                Assert.Equal("second.jpg", second.TenFileGoc);
                Assert.Equal("Developer Associate", second.TenChungChi);
                Assert.Equal("Issuer B", second.DonViCap);
                Assert.Equal("https://example.com/verify/second", second.UrlXacMinh);
                Assert.Equal("developer/second.jpg", second.RelativePath);
                Assert.DoesNotContain("second.jpg", second.StorageKey);
                Assert.True(File.Exists(fixture.Storage.ResolvePath(second.StorageKey)));
            });

        fixture.Storage.DeleteFiles(saved);
        Assert.All(saved, document => Assert.False(File.Exists(fixture.Storage.ResolvePath(document.StorageKey))));
    }

    [Fact]
    public async Task SaveCertificateRequestsAsync_AssignsOneSubmissionIdToAllSelectedCertificates()
    {
        using var fixture = new StorageFixture();
        var submissionId = Guid.NewGuid();
        var firstId = Guid.NewGuid();
        var secondId = Guid.NewGuid();
        var certificates = new[]
        {
            Certificate("first.jpg", firstId, "Cloud Practitioner"),
            Certificate("second.jpg", secondId, "Developer Associate")
        };

        var saved = await fixture.Storage.SaveCertificateRequestsAsync(42, submissionId, certificates);

        Assert.Collection(saved,
            first =>
            {
                Assert.Equal(submissionId, first.MaDotGui);
                Assert.Equal(firstId, first.ClientRequestId);
                Assert.Equal("Cloud Practitioner", first.TenChungChi);
                Assert.False(first.HienThiCongKhai);
                Assert.Equal("ChoDuyet", first.TrangThai);
            },
            second =>
            {
                Assert.Equal(submissionId, second.MaDotGui);
                Assert.Equal(secondId, second.ClientRequestId);
                Assert.Equal("Developer Associate", second.TenChungChi);
                Assert.False(second.HienThiCongKhai);
                Assert.Equal("ChoDuyet", second.TrangThai);
            });

        Assert.Single(saved.Select(item => item.MaDotGui).Distinct());
        Assert.All(saved, item => Assert.True(File.Exists(fixture.Storage.ResolvePath(item.StorageKey))));
        fixture.Storage.DeleteCertificateRequestFiles(saved);
    }

    private static ChungChiUploadRequest Certificate(string name, Guid clientId, string title) => new()
    {
        ClientId = clientId,
        File = ImageFile(name),
        TenChungChi = title
    };

    private static IFormFile ImageFile(string name)
    {
        var bytes = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10 };
        return new FormFile(new MemoryStream(bytes), 0, bytes.Length, "file", name)
        {
            Headers = new HeaderDictionary(),
            ContentType = "image/jpeg"
        };
    }

    private sealed class StorageFixture : IDisposable
    {
        private readonly string _root = Path.Combine(
            Path.GetTempPath(),
            "educodeai-lecturer-documents-" + Guid.NewGuid().ToString("N"));

        public StorageFixture()
        {
            Directory.CreateDirectory(_root);
            var environment = new Mock<IWebHostEnvironment>();
            environment.SetupGet(item => item.ContentRootPath).Returns(_root);
            Storage = new HoSoGiangVienTaiLieuStorage(environment.Object);
        }

        public HoSoGiangVienTaiLieuStorage Storage { get; }

        public void Dispose()
        {
            if (Directory.Exists(_root)) Directory.Delete(_root, recursive: true);
        }
    }
}
