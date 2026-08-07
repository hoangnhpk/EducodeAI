using System.Threading.Tasks;

namespace educodeai_server.Services.Interface
{
    public interface IRateLimitService
    {
        Task<QuotaReservation?> ReserveQuotaAsync(int keyId, int rpmLimit, int tpmLimit, int rpdLimit, int estimatedTokens);
        Task CommitQuotaAsync(QuotaReservation reservation, int actualTokens);
    }
}
