using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace educodeai_server.Services.Security;

public sealed class RefreshCookieOptions
{
    public string Name { get; set; } = "ecai_rt";
    public string Path { get; set; } = "/api/XacThuc";
    public string? Domain { get; set; }
    public bool AllowInsecureDevelopment { get; set; }
}

public sealed class RefreshCookiePolicy
{
    private readonly RefreshCookieOptions _options;
    private readonly bool _isDevelopment;

    public RefreshCookiePolicy(IOptions<RefreshCookieOptions> options, bool isDevelopment)
    {
        _options = options.Value;
        _isDevelopment = isDevelopment;
    }

    public string Name => _options.Name;

    public string? Read(HttpRequest request) => request.Cookies[Name];

    public CookieOptions Create(DateTimeOffset expires) => CreateCore(expires);

    public CookieOptions CreateExpired() => CreateCore(DateTimeOffset.UtcNow.AddDays(-1));

    private CookieOptions CreateCore(DateTimeOffset expires)
    {
        var secure = !_isDevelopment || !_options.AllowInsecureDevelopment;
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = secure ? SameSiteMode.None : SameSiteMode.Lax,
            Path = _options.Path,
            Domain = _options.Domain,
            Expires = expires,
            IsEssential = true
        };
    }
}
