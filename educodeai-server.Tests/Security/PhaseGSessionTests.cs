using System.Security.Claims;
using System.Text.Json;
using educodeai_server.Helpers;
using educodeai_server.Services.Implementation;
using educodeai_server.Services.Interface;
using educodeai_server.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace educodeai_server.Tests.Security;

public sealed class PhaseGSessionTests
{
    // ---- SessionStateCache round-trips (G.1) ----

    [Fact]
    public async Task SessionStateCache_UserStatus_RoundTripsAndInvalidates()
    {
        var cache = NewCache();

        Assert.Null(await cache.GetUserStatusAsync(7));

        await cache.SetUserStatusAsync(7, "Hoạt động");
        Assert.Equal("Hoạt động", await cache.GetUserStatusAsync(7));

        await cache.InvalidateUserStatusAsync(7);
        Assert.Null(await cache.GetUserStatusAsync(7));
    }

    [Fact]
    public async Task SessionStateCache_SessionActive_RoundTripsAndInvalidates()
    {
        var cache = NewCache();

        Assert.Null(await cache.GetSessionActiveAsync(42));

        await cache.SetSessionActiveAsync(42, true);
        Assert.True(await cache.GetSessionActiveAsync(42));

        await cache.SetSessionActiveAsync(42, false);
        Assert.False(await cache.GetSessionActiveAsync(42));

        await cache.InvalidateSessionAsync(42);
        Assert.Null(await cache.GetSessionActiveAsync(42));
    }

    private static SessionStateCache NewCache()
    {
        var distributed = new MemoryDistributedCache(
            Options.Create(new MemoryDistributedCacheOptions()));
        return new SessionStateCache(distributed);
    }

    // ---- Middleware fail-closed khi không xác minh được trạng thái (G.2) ----

    [Fact]
    public async Task SessionMiddleware_WhenCacheThrows_FailsClosedWith503()
    {
        var context = CreateAuthenticatedContext(userId: 5, maPhien: 9);
        var called = false;
        var middleware = new SessionCheckMiddleware(
            _ => { called = true; return Task.CompletedTask; },
            NullLogger<SessionCheckMiddleware>.Instance);

        await middleware.InvokeAsync(context, CreateDbContext(), new ThrowingSessionStateCache());

        Assert.False(called);
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, context.Response.StatusCode);
        var body = await ReadBodyAsync(context);
        using var doc = JsonDocument.Parse(body);
        Assert.Equal("AUTH_STATE_UNAVAILABLE", doc.RootElement.GetProperty("error").GetProperty("code").GetString());
    }

    [Fact]
    public async Task SessionMiddleware_AnonymousRequest_PassesThrough()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        var called = false;
        var middleware = new SessionCheckMiddleware(
            _ => { called = true; return Task.CompletedTask; },
            NullLogger<SessionCheckMiddleware>.Instance);

        await middleware.InvokeAsync(context, CreateDbContext(), new ThrowingSessionStateCache());

        Assert.True(called);
    }

    // ---- Middleware quyết định theo cache (G.2/G.15) — không chạm DB khi cache hit ----

    [Fact]
    public async Task SessionMiddleware_WhenUserLockedInCache_Returns401Banned()
    {
        var context = CreateAuthenticatedContext(userId: 5, maPhien: 9);
        var cache = new FakeSessionStateCache { UserStatus = "Bị khóa", SessionActive = true };
        var called = false;
        var middleware = new SessionCheckMiddleware(
            _ => { called = true; return Task.CompletedTask; },
            NullLogger<SessionCheckMiddleware>.Instance);

        await middleware.InvokeAsync(context, CreateDbContext(), cache);

        Assert.False(called);
        Assert.Equal(StatusCodes.Status401Unauthorized, context.Response.StatusCode);
        var body = await ReadBodyAsync(context);
        using var doc = JsonDocument.Parse(body);
        Assert.True(doc.RootElement.GetProperty("isBanned").GetBoolean());
    }

    [Fact]
    public async Task SessionMiddleware_WhenSessionInactiveInCache_Returns401()
    {
        var context = CreateAuthenticatedContext(userId: 5, maPhien: 9);
        var cache = new FakeSessionStateCache { UserStatus = "Hoạt động", SessionActive = false };
        var called = false;
        var middleware = new SessionCheckMiddleware(
            _ => { called = true; return Task.CompletedTask; },
            NullLogger<SessionCheckMiddleware>.Instance);

        await middleware.InvokeAsync(context, CreateDbContext(), cache);

        Assert.False(called);
        Assert.Equal(StatusCodes.Status401Unauthorized, context.Response.StatusCode);
    }

    [Fact]
    public async Task SessionMiddleware_WhenActiveAndHealthyInCache_PassesThrough()
    {
        var context = CreateAuthenticatedContext(userId: 5, maPhien: 9);
        var cache = new FakeSessionStateCache { UserStatus = "Hoạt động", SessionActive = true };
        var called = false;
        var middleware = new SessionCheckMiddleware(
            _ => { called = true; return Task.CompletedTask; },
            NullLogger<SessionCheckMiddleware>.Instance);

        await middleware.InvokeAsync(context, CreateDbContext(), cache);

        Assert.True(called);
    }

    private static DefaultHttpContext CreateAuthenticatedContext(int userId, int maPhien)
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        var identity = new ClaimsIdentity(
            new[]
            {
                new Claim("id", userId.ToString()),
                new Claim("MaPhien", maPhien.ToString()),
            },
            authenticationType: "TestAuth");
        context.User = new ClaimsPrincipal(identity);
        return context;
    }

    private static Data.EduCodeAIDbContext CreateDbContext()
    {
        // Không kết nối thật: nhánh fail-closed ném ra từ cache trước khi chạm DB.
        var options = new DbContextOptionsBuilder<Data.EduCodeAIDbContext>()
            .UseNpgsql("Host=localhost;Database=unused;Username=unused;Password=unused")
            .Options;
        return new Data.EduCodeAIDbContext(options);
    }

    private static async Task<string> ReadBodyAsync(HttpContext context)
    {
        context.Response.Body.Position = 0;
        return await new StreamReader(context.Response.Body).ReadToEndAsync();
    }

    private sealed class ThrowingSessionStateCache : ISessionStateCache
    {
        public Task<string?> GetUserStatusAsync(int userId) => throw new InvalidOperationException("cache down");
        public Task SetUserStatusAsync(int userId, string status) => Task.CompletedTask;
        public Task InvalidateUserStatusAsync(int userId) => Task.CompletedTask;
        public Task<bool?> GetSessionActiveAsync(int maPhien) => throw new InvalidOperationException("cache down");
        public Task SetSessionActiveAsync(int maPhien, bool active) => Task.CompletedTask;
        public Task InvalidateSessionAsync(int maPhien) => Task.CompletedTask;
    }

    // Cache hit sẵn giá trị → middleware quyết định mà không chạm DB.
    private sealed class FakeSessionStateCache : ISessionStateCache
    {
        public string? UserStatus { get; set; }
        public bool? SessionActive { get; set; }

        public Task<string?> GetUserStatusAsync(int userId) => Task.FromResult(UserStatus);
        public Task SetUserStatusAsync(int userId, string status) => Task.CompletedTask;
        public Task InvalidateUserStatusAsync(int userId) => Task.CompletedTask;
        public Task<bool?> GetSessionActiveAsync(int maPhien) => Task.FromResult(SessionActive);
        public Task SetSessionActiveAsync(int maPhien, bool active) => Task.CompletedTask;
        public Task InvalidateSessionAsync(int maPhien) => Task.CompletedTask;
    }
}
