namespace educodeai_server.Services.RefreshTokens;

public sealed class RefreshTokenCleanupOptions
{
    public bool Enabled { get; set; } = false;
    public int IntervalMinutes { get; set; } = 60;
    public int RetentionDays { get; set; } = 30;
    public int BatchSize { get; set; } = 250;
    public int MaxBatchesPerRun { get; set; } = 10;
}
