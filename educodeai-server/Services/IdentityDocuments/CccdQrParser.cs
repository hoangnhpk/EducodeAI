using System.Text.RegularExpressions;

namespace educodeai_server.Services.IdentityDocuments;

public sealed record CccdQrParseResult(
    bool IsValid,
    string? DocumentNumber,
    string? FullName,
    string? DateOfBirth,
    string? Gender,
    string? Address,
    string? IssueDate);

public static class CccdQrParser
{
    public static CccdQrParseResult Parse(string? payload)
    {
        if (string.IsNullOrWhiteSpace(payload)) return Invalid();

        var parts = payload
            .Normalize(System.Text.NormalizationForm.FormC)
            .Split('|')
            .Select(part => RemoveControlCharacters(part).Trim())
            .ToArray();
        if (parts.Length != 7) return Invalid();

        var documentNumber = IdentityDocumentRules.NormalizeIdentifier(parts[0], "CCCD");
        var dateOfBirth = IdentityDocumentRules.NormalizeCompactDate(parts[3]);
        var issueDate = IdentityDocumentRules.NormalizeCompactDate(parts[6]);
        var fullName = parts[2];
        var gender = NormalizeGender(parts[4]);
        var address = parts[5];

        if (documentNumber?.Length != 12
            || dateOfBirth == null
            || issueDate == null
            || string.IsNullOrWhiteSpace(fullName)
            || string.IsNullOrWhiteSpace(gender)
            || string.IsNullOrWhiteSpace(address))
        {
            return Invalid();
        }

        return new(true, documentNumber, fullName, dateOfBirth, gender, address, issueDate);
    }

    private static string? NormalizeGender(string value)
    {
        var normalized = RemoveDiacritics(value).ToUpperInvariant();
        return normalized switch
        {
            "NAM" => "Nam",
            "NU" => "Nữ",
            _ => null
        };
    }

    private static string RemoveDiacritics(string value)
    {
        var normalized = value.Normalize(System.Text.NormalizationForm.FormD);
        var characters = normalized.Where(character =>
            System.Globalization.CharUnicodeInfo.GetUnicodeCategory(character)
            != System.Globalization.UnicodeCategory.NonSpacingMark);
        return string.Concat(characters).Normalize(System.Text.NormalizationForm.FormC)
            .Replace('đ', 'd')
            .Replace('Đ', 'D');
    }

    private static string RemoveControlCharacters(string value) =>
        string.Concat(value.Where(character => !char.IsControl(character)));

    private static CccdQrParseResult Invalid() => new(false, null, null, null, null, null, null);
}
