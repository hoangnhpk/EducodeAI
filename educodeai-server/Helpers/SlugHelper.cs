using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

public static class SlugHelper
{
    public static string Generate(string input)
    {
        var str = input.ToLowerInvariant()
            .Normalize(NormalizationForm.FormD);

        var sb = new StringBuilder();
        foreach (var c in str)
        {
            var uc = Char.GetUnicodeCategory(c);
            if (uc != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }

        return Regex.Replace(
            sb.ToString(),
            @"[^a-z0-9]+",
            "-"
        ).Trim('-');
    }
}
