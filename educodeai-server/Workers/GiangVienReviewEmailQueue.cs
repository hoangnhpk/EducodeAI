using Microsoft.AspNetCore.DataProtection;
using System.Text.Json;
using System.Threading.Channels;
using educodeai_server.Services.Interface;

namespace educodeai_server.Workers;

public sealed record GiangVienReviewEmailJob(string Id, string EncryptedPayload, int Attempt = 0);

public sealed record GiangVienReviewEmailPayload(string Email, string Subject, string Body);

public interface IGiangVienReviewEmailQueue
{
    Task EnqueueAsync(GiangVienReviewEmailPayload payload, CancellationToken cancellationToken = default);
    IAsyncEnumerable<GiangVienReviewEmailJob> ReadMemoryAsync(CancellationToken cancellationToken);
}

public sealed class GiangVienReviewEmailQueue : IGiangVienReviewEmailQueue
{
    public const string RedisKey = "EduCodeAI:EmailQueue:GiangVienReview:v1";
    private readonly IRedisService _redis;
    private readonly Channel<GiangVienReviewEmailJob> _memory = Channel.CreateBounded<GiangVienReviewEmailJob>(new BoundedChannelOptions(500) { FullMode = BoundedChannelFullMode.Wait, SingleReader = false });
    private readonly IDataProtector _protector;
    private readonly ILogger<GiangVienReviewEmailQueue> _logger;

    public GiangVienReviewEmailQueue(IRedisService redis, IDataProtectionProvider protectionProvider, ILogger<GiangVienReviewEmailQueue> logger) { _redis = redis; _protector = protectionProvider.CreateProtector("EduCodeAI.EmailQueue.v1"); _logger = logger; }

    public async Task EnqueueAsync(GiangVienReviewEmailPayload payload, CancellationToken cancellationToken = default)
    {
        var job = new GiangVienReviewEmailJob(Guid.NewGuid().ToString("N"), _protector.Protect(JsonSerializer.Serialize(payload)));
        var serialized = JsonSerializer.Serialize(job);
        try
        {
            await _redis.DayVaoCuoiListAsync(RedisKey, serialized);
            // RedisService reports write failures through logging; fallback is used only on exceptions.
        }
        catch (Exception ex) { _logger.LogWarning(ex, "Redis queue unavailable for email job {JobId}; using memory fallback.", job.Id); }
        await _memory.Writer.WriteAsync(job, cancellationToken);
    }

    public IAsyncEnumerable<GiangVienReviewEmailJob> ReadMemoryAsync(CancellationToken cancellationToken) => _memory.Reader.ReadAllAsync(cancellationToken);
}
