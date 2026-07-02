using educodeai_server.DTOs.AI;
using educodeai_server.Models;

namespace educodeai_server.Repository.Interface
{
    public static class AuditAction
    {
        public const string RESET_USAGE = "RESET_USAGE";
        public const string REVEAL_KEY = "REVEAL_KEY";
        public const string UPDATE_KEY = "UPDATE_KEY";
        public const string TOGGLE_STATUS = "TOGGLE_STATUS";
        public const string SOFT_DELETE = "SOFT_DELETE";
        public const string SYNC_CONFIG = "SYNC_CONFIG";
    }

    public interface IKeyApiRepository
    {
        Task<IEnumerable<KeyAPISummaryDto?>> GetSummaryListAsync();

        Task<KeyAPISummaryDto?> GetByIdAsync(int id);

        Task<int> CreateKeyAsync(KeyAPIManageDto dto);
        Task<bool> UpdateKeyAsync(int id, KeyAPIManageDto dto, int adminId, string? ipAddress);
        Task<bool> UpdateStatusAsync(int id, bool status, int adminId, string? ipAddress);
        Task<bool> SoftDeleteKeyAsync(int id, int adminId, string? ipAddress);
        Task<bool> ResetKeyUsageAsync(int id, int adminId, string? ipAddress);
        Task<ApiKeyRevealDto?> RevealKeyAsync(int id, int adminId, string? ipAddress);
        Task AddAuditLogAsync(ApiKeyAuditLog log);

        Task<KeyAPIModel?> GetRawKeyForRedisAsync(int id);
        Task<IEnumerable<KeyAPIModel>> GetActiveKeysAsync();
    }
}
