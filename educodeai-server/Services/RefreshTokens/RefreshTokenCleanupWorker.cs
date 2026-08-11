using Microsoft.Extensions.Options;

namespace educodeai_server.Services.RefreshTokens;

public sealed class RefreshTokenCleanupWorker : BackgroundService
{
    private readonly RefreshTokenCleanupService _cleanup;
    private readonly IOptions<RefreshTokenCleanupOptions> _options;
    private readonly ILogger<RefreshTokenCleanupWorker> _logger;

    public RefreshTokenCleanupWorker(
        RefreshTokenCleanupService cleanup,
        IOptions<RefreshTokenCleanupOptions> options,
        ILogger<RefreshTokenCleanupWorker> logger)
    {
        _cleanup = cleanup;
        _options = options;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try { await _cleanup.CleanupAsync(stoppingToken); }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested) { break; }
            catch (Exception ex) { _logger.LogError(ex, "Refresh-token cleanup failed."); }

            var minutes = Math.Clamp(_options.Value.IntervalMinutes, 1, 1440);
            try { await Task.Delay(TimeSpan.FromMinutes(minutes), stoppingToken); }
            catch (OperationCanceledException) { break; }
        }
    }
}
