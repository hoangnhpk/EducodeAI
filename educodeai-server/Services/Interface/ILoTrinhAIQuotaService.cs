namespace educodeai_server.Services.Interface
{
    public interface ILoTrinhAIQuotaService
    {
        Task<AIQuotaResult> TryConsumeAsync(int maNguoiDung, string action);
    }

    public sealed record AIQuotaResult(bool Allowed, int Limit, long Used, DateTime ResetAt);
}