using Microsoft.AspNetCore.Http;
using SkiaSharp;
using System.Text;
using educodeai_server.Services.IdentityDocuments;

namespace educodeai_server.Tests.IdentityDocuments;

public sealed class IdentityDocumentMediaValidatorTests
{
    [Fact]
    public async Task ValidateAsync_RejectsDocumentOverSizeLimit()
    {
        var file = new FormFile(new MemoryStream(new byte[5 * 1024 * 1024 + 1]), 0, 5 * 1024 * 1024 + 1, "AnhMatTruoc", "front.jpg")
        {
            Headers = new HeaderDictionary(),
            ContentType = "image/jpeg"
        };

        var result = await IdentityDocumentMediaValidator.ValidateAsync(file, IdentityDocumentMediaKind.IdentityDocument);

        Assert.False(result.IsValid);
        Assert.Equal(IdentityDocumentMediaFailureCode.FileTooLarge, result.FailureCode);
    }

    [Fact]
    public async Task ValidateAsync_RejectsExtensionMimeAndMagicByteMismatch()
    {
        var file = new FormFile(new MemoryStream(Encoding.UTF8.GetBytes("not a png")), 0, 9, "AnhMatTruoc", "front.png")
        {
            Headers = new HeaderDictionary(),
            ContentType = "image/jpeg"
        };

        var result = await IdentityDocumentMediaValidator.ValidateAsync(file, IdentityDocumentMediaKind.IdentityDocument);

        Assert.False(result.IsValid);
        Assert.Equal(IdentityDocumentMediaFailureCode.InvalidMimeType, result.FailureCode);
    }

    [Fact]
    public async Task ValidateAsync_RejectsMalformedImageBeforeOcr()
    {
        var malformedJpeg = new byte[] { 0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0xFF, 0xD9 };
        var file = new FormFile(new MemoryStream(malformedJpeg), 0, malformedJpeg.Length, "AnhMatTruoc", "front.jpg")
        {
            Headers = new HeaderDictionary(),
            ContentType = "image/jpeg"
        };

        var result = await IdentityDocumentMediaValidator.ValidateAsync(file, IdentityDocumentMediaKind.IdentityDocument);

        Assert.False(result.IsValid);
        Assert.Equal(IdentityDocumentMediaFailureCode.UndecodableImage, result.FailureCode);
    }

    [Fact]
    public async Task ValidateAsync_DoesNotWriteRawDocumentToDisk()
    {
        using var bitmap = new SKBitmap(16, 16);
        using var image = SKImage.FromBitmap(bitmap);
        using var data = image.Encode(SKEncodedImageFormat.Png, 100);
        var bytes = data.ToArray();
        var tempRoot = Path.Combine(Path.GetTempPath(), "educodeai-validator-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(tempRoot);
        try
        {
            var before = Directory.GetFiles(tempRoot, "*", SearchOption.AllDirectories).Length;
            var file = new FormFile(new MemoryStream(bytes), 0, bytes.Length, "AnhMatTruoc", "front.png")
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/png"
            };

            var result = await IdentityDocumentMediaValidator.ValidateAsync(file, IdentityDocumentMediaKind.IdentityDocument);

            Assert.True(result.IsValid);
            Assert.Equal(before, Directory.GetFiles(tempRoot, "*", SearchOption.AllDirectories).Length);
        }
        finally
        {
            Directory.Delete(tempRoot, recursive: true);
        }
    }
}
