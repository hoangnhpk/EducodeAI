using educodeai_server.Services.Implementation;
using educodeai_server.Services.Interface;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace educodeai_server.Tests.Security;

public sealed class PhaseDOtpRateLimiterTests
{
    // Phát OTP: 5 lần/identifier/window → lần thứ 6 bị chặn (D.3).
    [Fact]
    public async Task Send_BlocksAfterPerIdentifierLimit()
    {
        var limiter = NewLimiter();

        for (int i = 0; i < 5; i++)
            Assert.True(await limiter.TryConsumeSendAsync(OtpPurpose.Register, "a@x.com", "1.2.3.4"));

        Assert.False(await limiter.TryConsumeSendAsync(OtpPurpose.Register, "a@x.com", "1.2.3.4"));
    }

    // Ngưỡng identifier tách biệt theo email: user khác không bị ảnh hưởng bởi user đã vượt ngưỡng.
    [Fact]
    public async Task Send_LimitIsPerIdentifier_NotShared()
    {
        var limiter = NewLimiter();

        for (int i = 0; i < 5; i++)
            await limiter.TryConsumeSendAsync(OtpPurpose.Register, "a@x.com", null);

        Assert.False(await limiter.TryConsumeSendAsync(OtpPurpose.Register, "a@x.com", null));
        Assert.True(await limiter.TryConsumeSendAsync(OtpPurpose.Register, "b@x.com", null));
    }

    // Email chuẩn hóa: khác hoa/thường vẫn tính cùng một identifier.
    [Fact]
    public async Task Send_NormalizesIdentifierCase()
    {
        var limiter = NewLimiter();

        for (int i = 0; i < 5; i++)
            await limiter.TryConsumeSendAsync(OtpPurpose.Register, "A@X.com", null);

        Assert.False(await limiter.TryConsumeSendAsync(OtpPurpose.Register, "a@x.com", null));
    }

    // Ngưỡng purpose tách biệt: vượt ngưỡng Register không chặn ForgotPassword cùng email.
    [Fact]
    public async Task Send_LimitIsPerPurpose()
    {
        var limiter = NewLimiter();

        for (int i = 0; i < 5; i++)
            await limiter.TryConsumeSendAsync(OtpPurpose.Register, "a@x.com", null);

        Assert.False(await limiter.TryConsumeSendAsync(OtpPurpose.Register, "a@x.com", null));
        Assert.True(await limiter.TryConsumeSendAsync(OtpPurpose.ForgotPassword, "a@x.com", null));
    }

    // Verify có ngưỡng riêng, rộng hơn send: 10 lần/identifier.
    [Fact]
    public async Task Verify_BlocksAfterPerIdentifierLimit()
    {
        var limiter = NewLimiter();

        for (int i = 0; i < 10; i++)
            Assert.True(await limiter.TryConsumeVerifyAsync(OtpPurpose.ForgotPassword, "a@x.com", "1.2.3.4"));

        Assert.False(await limiter.TryConsumeVerifyAsync(OtpPurpose.ForgotPassword, "a@x.com", "1.2.3.4"));
    }

    // Send và verify đếm tách biệt: dùng hết quota send không ảnh hưởng verify.
    [Fact]
    public async Task SendAndVerify_CountedSeparately()
    {
        var limiter = NewLimiter();

        for (int i = 0; i < 5; i++)
            await limiter.TryConsumeSendAsync(OtpPurpose.Register, "a@x.com", null);

        Assert.False(await limiter.TryConsumeSendAsync(OtpPurpose.Register, "a@x.com", null));
        Assert.True(await limiter.TryConsumeVerifyAsync(OtpPurpose.Register, "a@x.com", null));
    }

    // Cache lỗi → fail-open: không chặn user hợp lệ khi hạ tầng trục trặc.
    [Fact]
    public async Task WhenCacheThrows_FailsOpen()
    {
        var limiter = new OtpRateLimiter(new ThrowingCache(), NullLogger<OtpRateLimiter>.Instance);

        Assert.True(await limiter.TryConsumeSendAsync(OtpPurpose.Register, "a@x.com", "1.2.3.4"));
        Assert.True(await limiter.TryConsumeVerifyAsync(OtpPurpose.Register, "a@x.com", "1.2.3.4"));
    }

    private static OtpRateLimiter NewLimiter()
    {
        var distributed = new MemoryDistributedCache(
            Options.Create(new MemoryDistributedCacheOptions()));
        return new OtpRateLimiter(distributed, NullLogger<OtpRateLimiter>.Instance);
    }

    private sealed class ThrowingCache : IDistributedCache
    {
        public byte[]? Get(string key) => throw new InvalidOperationException("cache down");
        public Task<byte[]?> GetAsync(string key, CancellationToken token = default) => throw new InvalidOperationException("cache down");
        public void Refresh(string key) => throw new InvalidOperationException("cache down");
        public Task RefreshAsync(string key, CancellationToken token = default) => throw new InvalidOperationException("cache down");
        public void Remove(string key) => throw new InvalidOperationException("cache down");
        public Task RemoveAsync(string key, CancellationToken token = default) => throw new InvalidOperationException("cache down");
        public void Set(string key, byte[] value, DistributedCacheEntryOptions options) => throw new InvalidOperationException("cache down");
        public Task SetAsync(string key, byte[] value, DistributedCacheEntryOptions options, CancellationToken token = default) => throw new InvalidOperationException("cache down");
    }
}
