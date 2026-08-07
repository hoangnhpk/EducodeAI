using educodeai_server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace educodeai_server.Services.RefreshTokens;

public sealed class RefreshTokenCleanupService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly RefreshTokenCleanupOptions _options;
    private readonly ILogger<RefreshTokenCleanupService> _logger;
    private readonly TimeProvider _timeProvider;
    private readonly RefreshTokenCleanupMetrics _metrics;
    private int _isRunning;

    public RefreshTokenCleanupService(
        IServiceScopeFactory scopeFactory,
        IOptions<RefreshTokenCleanupOptions> options,
        ILogger<RefreshTokenCleanupService> logger,
        TimeProvider? timeProvider = null,
        RefreshTokenCleanupMetrics? metrics = null)
    {
        _scopeFactory = scopeFactory;
        _options = options.Value;
        _logger = logger;
        _timeProvider = timeProvider ?? TimeProvider.System;
        _metrics = metrics ?? new RefreshTokenCleanupMetrics();
    }

    public async Task<int> CleanupAsync(CancellationToken cancellationToken)
    {
        if (!_options.Enabled || Interlocked.CompareExchange(ref _isRunning, 1, 0) != 0) return 0;
        var started = _timeProvider.GetTimestamp();
        var batches = 0;
        var total = 0;
        try
        {
            var batchSize = Math.Clamp(_options.BatchSize, 1, 5000);
            var maxBatches = Math.Clamp(_options.MaxBatchesPerRun, 1, 1000);
            var cutoff = RefreshTokenCleanupPolicy.GetCutoff(_timeProvider, _options.RetentionDays);

            for (var batch = 0; batch < maxBatches; batch++)
            {
                cancellationToken.ThrowIfCancellationRequested();
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();
                var rows = await db.RefreshTokens
                    .Where(token => token.ThoiGianHetHan < cutoff &&
                                    (token.NgayThuHoi == null || token.NgayThuHoi < cutoff))
                    .OrderBy(token => token.MaRefreshToken)
                    .Take(batchSize)
                    .ToListAsync(cancellationToken);

                if (rows.Count == 0) break;
                db.RefreshTokens.RemoveRange(rows);
                await db.SaveChangesAsync(cancellationToken);
                batches++;
                total += rows.Count;
                if (rows.Count < batchSize) break;
            }

            if (total > 0)
                _logger.LogInformation("Refresh-token cleanup removed {Count} terminal rows before {CutoffUtc}.", total, cutoff);
            return total;
        }
        finally
        {
            _metrics.Record(_timeProvider.GetElapsedTime(started), batches, total);
            Volatile.Write(ref _isRunning, 0);
        }
    }
}
