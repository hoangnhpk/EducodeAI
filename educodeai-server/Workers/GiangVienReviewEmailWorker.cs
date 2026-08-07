using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;

namespace educodeai_server.Workers;

public sealed class GiangVienReviewEmailWorker : BackgroundService
{
    private readonly IGiangVienReviewEmailQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IDataProtector _protector;
    private readonly ILogger<GiangVienReviewEmailWorker> _logger;

    public GiangVienReviewEmailWorker(IGiangVienReviewEmailQueue queue, IServiceScopeFactory scopeFactory, IDataProtectionProvider protectionProvider, ILogger<GiangVienReviewEmailWorker> logger)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _protector = protectionProvider.CreateProtector("EduCodeAI.EmailQueue.v1");
        _logger = logger;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken) => Task.WhenAll(RunRedisAsync(stoppingToken), RunMemoryAsync(stoppingToken));

    private async Task RunRedisAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var redis = scope.ServiceProvider.GetRequiredService<IRedisService>();
                var jobs = await redis.LayTuDauListAsync(GiangVienReviewEmailQueue.RedisKey, 10);
                foreach (var raw in jobs) await ProcessAsync(raw, ct);
            }
            catch (Exception ex) { _logger.LogWarning(ex, "Không đọc được hàng đợi email Redis."); }
            await Task.Delay(TimeSpan.FromSeconds(1), ct);
        }
    }

    private async Task RunMemoryAsync(CancellationToken ct)
    {
        await foreach (var job in _queue.ReadMemoryAsync(ct)) await ProcessAsync(JsonSerializer.Serialize(job), ct);
    }

    private async Task ProcessAsync(string raw, CancellationToken ct)
    {
        GiangVienReviewEmailJob? job;
        try { job = JsonSerializer.Deserialize<GiangVienReviewEmailJob>(raw); } catch { return; }
        if (job is null || job.Attempt >= 3) return;
        GiangVienReviewEmailPayload? payload;
        try { payload = JsonSerializer.Deserialize<GiangVienReviewEmailPayload>(_protector.Unprotect(job.EncryptedPayload)); } catch { return; }
        if (payload is null || string.IsNullOrWhiteSpace(payload.Email)) return;
        for (var attempt = job.Attempt; attempt < 3; attempt++)
        {
            try { if (await EmailHelper.SendEmailAsync(payload.Email.Trim(), payload.Subject, payload.Body)) return; }
            catch (Exception ex) { _logger.LogWarning(ex, "Email review job {JobId} failed attempt {Attempt}.", job.Id, attempt + 1); }
            await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)), ct);
        }
        _logger.LogError("Email review job {JobId} exhausted retries.", job.Id);
    }
}
