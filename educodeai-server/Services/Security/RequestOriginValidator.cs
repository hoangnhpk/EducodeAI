using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Net;

namespace educodeai_server.Services.Security;

public sealed class RequestOriginOptions
{
    public string[] AllowedOrigins { get; set; } = [];
}

public interface IRequestOriginValidator
{
    bool IsAllowed(HttpRequest request);
}

public sealed class RequestOriginValidator : IRequestOriginValidator
{
    private readonly HashSet<string> _allowedOrigins;

    public RequestOriginValidator(IOptions<RequestOriginOptions> options)
    {
        _allowedOrigins = options.Value.AllowedOrigins
            .Select(NormalizeOrigin)
            .Where(origin => origin is not null)
            .Cast<string>()
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    public bool IsAllowed(HttpRequest request)
    {
        var origin = NormalizeOrigin(request.Headers.Origin.FirstOrDefault());
        var referer = NormalizeOrigin(request.Headers.Referer.FirstOrDefault());
        if (origin is not null && referer is not null && !string.Equals(origin, referer, StringComparison.OrdinalIgnoreCase))
            return false;

        var candidate = origin ?? referer;
        return candidate is not null && _allowedOrigins.Contains(candidate);
    }

    internal static string? NormalizeOrigin(string? value)
    {
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps) ||
            !string.IsNullOrEmpty(uri.UserInfo)) return null;

        var port = uri.IsDefaultPort ? (uri.Scheme == Uri.UriSchemeHttps ? 443 : 80) : uri.Port;
        return $"{uri.Scheme.ToLowerInvariant()}://{uri.IdnHost.ToLowerInvariant()}:{port}";
    }
}

public sealed class RequestOriginOptionsValidator : IValidateOptions<RequestOriginOptions>
{
    public ValidateOptionsResult Validate(string? name, RequestOriginOptions options) =>
        options.AllowedOrigins.Length > 0 && options.AllowedOrigins.All(value => RequestOriginValidator.NormalizeOrigin(value) is not null)
            ? ValidateOptionsResult.Success
            : ValidateOptionsResult.Fail("Security:RequestOrigin:AllowedOrigins must contain only absolute HTTP(S) origins.");
}

public sealed class TrustedProxyOptions
{
    public string[] Proxies { get; set; } = [];
}

public sealed class TrustedProxyOptionsValidator : IValidateOptions<TrustedProxyOptions>
{
    public ValidateOptionsResult Validate(string? name, TrustedProxyOptions options) =>
        options.Proxies.All(value => IPAddress.TryParse(value, out _))
            ? ValidateOptionsResult.Success
            : ValidateOptionsResult.Fail("Security:TrustedProxies contains a malformed IP address.");
}
