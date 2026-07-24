using System.Security.Claims;
using System.Text.Json;
using educodeai_server.Helpers;
using Microsoft.AspNetCore.Http;

namespace educodeai_server.Tests.Security;

public sealed class PhaseJMaintenanceTests : IDisposable
{
    public PhaseJMaintenanceTests()
    {
        MaintenanceMiddleware.IsUnderMaintenance = false;
    }

    public void Dispose()
    {
        MaintenanceMiddleware.IsUnderMaintenance = false;
    }

    [Fact]
    public async Task WhenNotUnderMaintenance_PassesThrough()
    {
        MaintenanceMiddleware.IsUnderMaintenance = false;
        var context = CreateContext("/api/khoa-hoc");
        var called = false;
        var middleware = new MaintenanceMiddleware(_ => { called = true; return Task.CompletedTask; });

        await middleware.InvokeAsync(context);

        Assert.True(called);
        Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
    }

    [Fact]
    public async Task UnderMaintenance_BlocksAnonymousRequestWithStableCode()
    {
        MaintenanceMiddleware.IsUnderMaintenance = true;
        var context = CreateContext("/api/khoa-hoc");
        var called = false;
        var middleware = new MaintenanceMiddleware(_ => { called = true; return Task.CompletedTask; });

        await middleware.InvokeAsync(context);

        Assert.False(called);
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, context.Response.StatusCode);
        var body = await ReadBodyAsync(context);
        using var doc = JsonDocument.Parse(body);
        Assert.Equal("MAINTENANCE_MODE", doc.RootElement.GetProperty("error").GetProperty("code").GetString());
    }

    [Fact]
    public async Task UnderMaintenance_IgnoresClientBypassHeader()
    {
        MaintenanceMiddleware.IsUnderMaintenance = true;
        var context = CreateContext("/api/khoa-hoc");
        context.Request.Headers["X-Bypass-Maintenance"] = "true";
        var called = false;
        var middleware = new MaintenanceMiddleware(_ => { called = true; return Task.CompletedTask; });

        await middleware.InvokeAsync(context);

        Assert.False(called);
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, context.Response.StatusCode);
    }

    [Fact]
    public async Task UnderMaintenance_DoesNotTrustQuanTriPath()
    {
        MaintenanceMiddleware.IsUnderMaintenance = true;
        var context = CreateContext("/api/quan-tri/thong-ke");
        var called = false;
        var middleware = new MaintenanceMiddleware(_ => { called = true; return Task.CompletedTask; });

        await middleware.InvokeAsync(context);

        Assert.False(called);
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, context.Response.StatusCode);
    }

    [Fact]
    public async Task UnderMaintenance_AllowsAuthenticatedAdmin()
    {
        MaintenanceMiddleware.IsUnderMaintenance = true;
        var context = CreateContext("/api/quan-tri/thong-ke");
        context.User = CreateUser("Admin");
        var called = false;
        var middleware = new MaintenanceMiddleware(_ => { called = true; return Task.CompletedTask; });

        await middleware.InvokeAsync(context);

        Assert.True(called);
    }

    [Fact]
    public async Task UnderMaintenance_BlocksAuthenticatedNonAdmin()
    {
        MaintenanceMiddleware.IsUnderMaintenance = true;
        var context = CreateContext("/api/khoa-hoc");
        context.User = CreateUser("HocVien");
        var called = false;
        var middleware = new MaintenanceMiddleware(_ => { called = true; return Task.CompletedTask; });

        await middleware.InvokeAsync(context);

        Assert.False(called);
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, context.Response.StatusCode);
    }

    [Theory]
    [InlineData("/api/XacThuc/dang-nhap")]
    [InlineData("/api/quan-tri/cau-hinh/check-bao-tri")]
    public async Task UnderMaintenance_AllowsBootstrapPathsForAnonymous(string path)
    {
        MaintenanceMiddleware.IsUnderMaintenance = true;
        var context = CreateContext(path);
        var called = false;
        var middleware = new MaintenanceMiddleware(_ => { called = true; return Task.CompletedTask; });

        await middleware.InvokeAsync(context);

        Assert.True(called);
    }

    private static DefaultHttpContext CreateContext(string path)
    {
        var context = new DefaultHttpContext();
        context.Request.Method = "GET";
        context.Request.Path = path;
        context.Response.Body = new MemoryStream();
        return context;
    }

    private static ClaimsPrincipal CreateUser(string role)
    {
        var identity = new ClaimsIdentity(
            new[] { new Claim(ClaimTypes.Role, role) },
            authenticationType: "TestAuth",
            nameType: ClaimTypes.Name,
            roleType: ClaimTypes.Role);
        return new ClaimsPrincipal(identity);
    }

    private static async Task<string> ReadBodyAsync(HttpContext context)
    {
        context.Response.Body.Position = 0;
        return await new StreamReader(context.Response.Body).ReadToEndAsync();
    }
}
