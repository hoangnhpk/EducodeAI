using System.Globalization;
using System.Text.RegularExpressions;

namespace educodeai_server.Services.IdentityDocuments;

public static class IdentityDocumentRules
{
    private static readonly Regex CccdPattern = new(@"^(?:\d{9}|\d{12})$", RegexOptions.Compiled);
    private static readonly Regex PassportPattern = new(@"^[A-Z0-9]{6,12}$", RegexOptions.Compiled);

    public static bool AreIdentifiersExactlyEqual(string? first, string? second, string documentType)
    {
        var normalizedFirst = NormalizeIdentifier(first, documentType);
        var normalizedSecond = NormalizeIdentifier(second, documentType);

        return normalizedFirst != null
            && string.Equals(normalizedFirst, normalizedSecond, StringComparison.Ordinal);
    }

    public static string? NormalizeIdentifier(string? value, string documentType)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;

        var normalized = value.Trim();
        if (string.Equals(documentType, "Passport", StringComparison.OrdinalIgnoreCase))
        {
            normalized = normalized.ToUpperInvariant();
            return PassportPattern.IsMatch(normalized) ? normalized : null;
        }

        normalized = Regex.Replace(normalized, @"[\s.-]", string.Empty);
        return CccdPattern.IsMatch(normalized) ? normalized : null;
    }

    public static string? NormalizeCompactDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)
            || !DateTime.TryParseExact(
                value,
                "ddMMyyyy",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var date))
        {
            return null;
        }

        return date.ToString("dd/MM/yyyy", CultureInfo.InvariantCulture);
    }
}
