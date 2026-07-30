using System.Text.RegularExpressions;

namespace educodeai_server.Helpers;

public static partial class SensitiveDataRedactor
{
    public const string RedactedValue = "[REDACTED]";

    private static readonly string[] SensitiveNames =
    [
        "authorization", "cookie", "token", "refreshtoken", "accesstoken",
        "password", "matkhau", "otp", "jwt:key", "jwtkey", "signingkey", "ocr", "cccd"
    ];

    public static string Redact(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        return SensitiveValuePattern().Replace(value, match =>
            $"{match.Groups[1].Value}{RedactedValue}");
    }

    public static IReadOnlyDictionary<string, object?> RedactProperties(
        IEnumerable<KeyValuePair<string, object?>> properties) =>
        properties.ToDictionary(
            property => property.Key,
            property => IsSensitiveName(property.Key) ? RedactedValue : property.Value);

    private static bool IsSensitiveName(string name) =>
        SensitiveNames.Any(sensitiveName =>
            name.Contains(sensitiveName, StringComparison.OrdinalIgnoreCase));

    [GeneratedRegex("(?i)(authorization\\s*[:=]\\s*|cookie\\s*[:=]\\s*|refresh[_-]?token\\s*[:=]\\s*|access[_-]?token\\s*[:=]\\s*|password\\s*[:=]\\s*|matkhau\\s*[:=]\\s*|otp\\s*[:=]\\s*|jwt(?::|[_-]?)key\\s*[:=]\\s*|signing[_-]?key\\s*[:=]\\s*)[^\\s,;]+")]
    private static partial Regex SensitiveValuePattern();
}
