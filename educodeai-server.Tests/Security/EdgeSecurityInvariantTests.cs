using educodeai_server.Services.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace educodeai_server.Tests.Security;

public sealed class EdgeSecurityInvariantTests
{
    [Fact]
    public void CookiePolicy_ProductionIsSecureEvenWhenRequestSchemeIsHttp()
    {
        var policy = new RefreshCookiePolicy(Options.Create(new RefreshCookieOptions()), isDevelopment: false);

        var cookie = policy.Create(DateTimeOffset.UtcNow.AddDays(1));

        Assert.True(cookie.Secure);
        Assert.True(cookie.HttpOnly);
        Assert.Equal(SameSiteMode.None, cookie.SameSite);
    }

    [Fact]
    public void CookiePolicy_DevelopmentAllowsExplicitHttpOptIn()
    {
        var policy = new RefreshCookiePolicy(Options.Create(new RefreshCookieOptions
        {
            AllowInsecureDevelopment = true
        }), isDevelopment: true);

        var cookie = policy.Create(DateTimeOffset.UtcNow.AddDays(1));

        Assert.False(cookie.Secure);
        Assert.True(cookie.HttpOnly);
        Assert.Equal(SameSiteMode.Lax, cookie.SameSite);
    }

    [Fact]
    public void CookiePolicy_ProductionIgnoresInsecureDevelopmentOptIn()
    {
        var policy = new RefreshCookiePolicy(Options.Create(new RefreshCookieOptions
        {
            AllowInsecureDevelopment = true
        }), isDevelopment: false);

        var cookie = policy.Create(DateTimeOffset.UtcNow.AddDays(1));

        Assert.True(cookie.Secure);
        Assert.Equal(SameSiteMode.None, cookie.SameSite);
    }

    [Fact]
    public void CookiePolicy_IssueAndClearUseIdenticalScopeAttributes()
    {
        var policy = new RefreshCookiePolicy(Options.Create(new RefreshCookieOptions
        {
            Name = "refresh",
            Path = "/api/auth",
            Domain = "example.test"
        }), isDevelopment: false);

        var issue = policy.Create(DateTimeOffset.UtcNow.AddDays(1));
        var clear = policy.CreateExpired();

        Assert.Equal("refresh", policy.Name);
        Assert.Equal(issue.Path, clear.Path);
        Assert.Equal(issue.Domain, clear.Domain);
        Assert.Equal(issue.SameSite, clear.SameSite);
        Assert.Equal(issue.Secure, clear.Secure);
    }

    [Fact]
    public void CookiePolicy_ReadUsesConfiguredName()
    {
        var policy = new RefreshCookiePolicy(Options.Create(new RefreshCookieOptions
        {
            Name = "custom-refresh"
        }), isDevelopment: false);
        var context = new DefaultHttpContext();
        context.Request.Headers.Cookie = "ecai_rt=wrong; custom-refresh=expected";

        var token = policy.Read(context.Request);

        Assert.Equal("expected", token);
    }

    [Fact]
    public void OriginValidator_RejectsConflictingOriginAndReferer()
    {
        var validator = new RequestOriginValidator(Options.Create(new RequestOriginOptions
        {
            AllowedOrigins = ["https://app.example.test", "https://other.example.test"]
        }));
        var context = new DefaultHttpContext();
        context.Request.Headers.Origin = "https://app.example.test";
        context.Request.Headers.Referer = "https://other.example.test/page";

        Assert.False(validator.IsAllowed(context.Request));
    }

    [Fact]
    public void OriginOptions_RejectMalformedConfiguredOrigin()
    {
        var validator = new RequestOriginOptionsValidator();

        var result = validator.Validate(null, new RequestOriginOptions { AllowedOrigins = ["not an origin"] });

        Assert.True(result.Failed);
    }

    [Fact]
    public void TrustedProxyOptions_RejectMalformedEntry()
    {
        var validator = new TrustedProxyOptionsValidator();

        var result = validator.Validate(null, new TrustedProxyOptions { Proxies = ["proxy.example.test"] });

        Assert.True(result.Failed);
    }
}
