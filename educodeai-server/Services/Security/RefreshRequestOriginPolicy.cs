using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace educodeai_server.Services.Security;

public interface IRefreshRequestOriginPolicy
{
    bool IsAllowed(HttpRequest request);
}

public sealed class RefreshRequestOriginPolicy : IRefreshRequestOriginPolicy
{
    private readonly HashSet<string> _allowed;

    public RefreshRequestOriginPolicy(IConfiguration configuration, IWebHostEnvironment environment)
    {
        var origins = (configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>()).ToList();
        if (environment.IsDevelopment())
        {
            origins.AddRange([
                "https://educodeai-client.vercel.app",
                "http://localhost:3000", "http://localhost:3001", "http://localhost:5173",
                "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:5173",
                "http://[::1]:3000", "http://[::1]:3001", "http://[::1]:5173"
            ]);
        }

        _allowed = origins
            .Select(Normalize)
            .Where(value => value != null)
            .Cast<string>()
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    public bool IsAllowed(HttpRequest request)
    {
        var origin = request.Headers.Origin.FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(origin)) return IsAllowedOrigin(origin);

        var referer = request.Headers.Referer.FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(referer) && Uri.TryCreate(referer, UriKind.Absolute, out var uri))
            return IsAllowedOrigin(uri.GetLeftPart(UriPartial.Authority));

        return false;
    }

    private bool IsAllowedOrigin(string value)
    {
        var normalized = Normalize(value);
        return normalized != null && _allowed.Contains(normalized);
    }

    private static string? Normalize(string? value)
    {
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri)
            || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
            || !string.IsNullOrEmpty(uri.UserInfo)
            || !string.IsNullOrEmpty(uri.AbsolutePath.Trim('/'))
            || !string.IsNullOrEmpty(uri.Query)
            || !string.IsNullOrEmpty(uri.Fragment)
            || value!.Contains('*')) return null;

        var port = uri.IsDefaultPort ? -1 : uri.Port;
        return $"{uri.Scheme.ToLowerInvariant()}://{uri.Host.ToLowerInvariant()}" + (port < 0 ? "" : $":{port}");
    }
}
