using Microsoft.AspNetCore.Http;
using SkiaSharp;

namespace educodeai_server.Services.IdentityDocuments;

public enum IdentityDocumentMediaKind
{
    IdentityDocument,
    Avatar
}

public enum IdentityDocumentMediaFailureCode
{
    FileTooLarge,
    InvalidExtension,
    InvalidMimeType,
    InvalidMagicBytes,
    UndecodableImage,
    InvalidDimensions
}

public sealed record IdentityDocumentMediaValidationResult(
    bool IsValid,
    IdentityDocumentMediaFailureCode? FailureCode,
    string? FailureMessage,
    int? Width,
    int? Height)
{
    public static IdentityDocumentMediaValidationResult Ok(int width, int height) =>
        new(true, null, null, width, height);

    public static IdentityDocumentMediaValidationResult Fail(IdentityDocumentMediaFailureCode code, string message) =>
        new(false, code, message, null, null);
}

public static class IdentityDocumentMediaValidator
{
    private const long DefaultMaxBytes = 5 * 1024 * 1024;
    private const int MaxDimension = 6000;
    private const int MaxPixels = 24_000_000;
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp"
    };

    private static readonly IReadOnlyDictionary<string, string> MimeTypeByExtension =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [".jpg"] = "image/jpeg",
            [".jpeg"] = "image/jpeg",
            [".png"] = "image/png",
            [".webp"] = "image/webp"
        };

    public static async Task<IdentityDocumentMediaValidationResult> ValidateAsync(IFormFile file, IdentityDocumentMediaKind kind, CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length <= 0)
        {
            return IdentityDocumentMediaValidationResult.Fail(IdentityDocumentMediaFailureCode.FileTooLarge, "File ảnh không hợp lệ.");
        }

        if (file.Length > DefaultMaxBytes)
        {
            return IdentityDocumentMediaValidationResult.Fail(IdentityDocumentMediaFailureCode.FileTooLarge, "Ảnh quá lớn. Kích thước tối đa là 5MB mỗi ảnh.");
        }

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension))
        {
            return IdentityDocumentMediaValidationResult.Fail(IdentityDocumentMediaFailureCode.InvalidExtension, "Chỉ chấp nhận file ảnh JPG, JPEG, PNG hoặc WEBP.");
        }

        if (!MimeTypeByExtension.TryGetValue(extension, out var expectedMimeType)
            || !string.Equals(file.ContentType, expectedMimeType, StringComparison.OrdinalIgnoreCase))
        {
            return IdentityDocumentMediaValidationResult.Fail(IdentityDocumentMediaFailureCode.InvalidMimeType, "Định dạng ảnh không khớp với phần mở rộng file.");
        }

        await using var stream = file.OpenReadStream();
        using var memory = new MemoryStream();
        await stream.CopyToAsync(memory, cancellationToken);
        var bytes = memory.ToArray();

        if (!LooksLikeSupportedImage(bytes))
        {
            return IdentityDocumentMediaValidationResult.Fail(IdentityDocumentMediaFailureCode.InvalidMagicBytes, "Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG hoặc WEBP.");
        }

        SKBitmap? bitmap;
        try
        {
            bitmap = SKBitmap.Decode(bytes);
        }
        catch (ArgumentNullException)
        {
            bitmap = null;
        }

        using (bitmap)
        {
            if (bitmap == null || bitmap.Width <= 0 || bitmap.Height <= 0)
            {
                return IdentityDocumentMediaValidationResult.Fail(IdentityDocumentMediaFailureCode.UndecodableImage, "Ảnh bị mờ, hỏng hoặc không thể đọc được.");
            }

            if (bitmap.Width > MaxDimension || bitmap.Height > MaxDimension || (long)bitmap.Width * bitmap.Height > MaxPixels)
            {
                return IdentityDocumentMediaValidationResult.Fail(IdentityDocumentMediaFailureCode.InvalidDimensions, "Ảnh vượt giới hạn kích thước hoặc độ phân giải.");
            }

            return IdentityDocumentMediaValidationResult.Ok(bitmap.Width, bitmap.Height);
        }
    }

    private static bool LooksLikeSupportedImage(byte[] bytes)
    {
        if (bytes.Length < 12) return false;

        var jpeg = bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[^2] == 0xFF && bytes[^1] == 0xD9;
        var png = bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47;
        var webp = bytes.Length >= 12
                   && bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46
                   && bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50;

        return jpeg || png || webp;
    }
}
