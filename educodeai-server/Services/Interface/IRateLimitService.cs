using System.Threading.Tasks;

namespace educodeai_server.Services.Interface
{
    public interface IRateLimitService
    {
        Task<bool> ReserveQuotaAsync(int keyId, int rpmLimit, int tpmLimit, int rpdLimit, int estimatedTokens);
        Task<bool> CommitQuotaAsync(int keyId, int actualTokens, int estimatedTokens);
    }
}
