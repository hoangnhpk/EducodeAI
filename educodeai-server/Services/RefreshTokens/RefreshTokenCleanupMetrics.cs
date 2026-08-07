using System.Diagnostics.Metrics;

namespace educodeai_server.Services.RefreshTokens;

public sealed class RefreshTokenCleanupMetrics : IDisposable
{
    private readonly Meter _meter = new("EduCodeAI.RefreshTokenCleanup");
    private readonly Histogram<double> _duration;
    private readonly Histogram<int> _batches;
    private readonly Counter<long> _deleted;

    public RefreshTokenCleanupMetrics()
    {
        _duration = _meter.CreateHistogram<double>("refresh_token_cleanup.duration", "ms");
        _batches = _meter.CreateHistogram<int>("refresh_token_cleanup.batches");
        _deleted = _meter.CreateCounter<long>("refresh_token_cleanup.deleted");
    }

    public void Record(TimeSpan duration, int batches, int deleted)
    {
        _duration.Record(duration.TotalMilliseconds);
        _batches.Record(batches);
        _deleted.Add(deleted);
    }

    public void Dispose() => _meter.Dispose();
}
