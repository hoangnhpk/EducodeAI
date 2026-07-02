using educodeai_server.DTOs.AI;

namespace educodeai_server.Services.Interface
{
    public interface IKeyApiService
    {
        Task<IEnumerable<KeyAPISummaryDto?>> GetAllKeysAsync();

        Task<KeyAPISummaryDto?> GetKeyByIdAsync(int id);

        Task<bool> CreateNewKeyAsync(KeyAPIManageDto dto, int adminId, string? ipAddress);

        Task<bool> UpdateKeyAsync(int id, KeyAPIManageDto dto, int adminId, string? ipAddress);

        Task<bool> ToggleKeyStatusAsync(int id, bool status, int adminId, string? ipAddress);

        Task<bool> SoftDeleteKeyAsync(int id, int adminId, string? ipAddress);

        Task<bool> SyncKeyToRedisAsync(int id, int adminId, string? ipAddress);

        Task<bool> ResetKeyUsageAsync(int id, int adminId, string? ipAddress);
        Task<ApiKeyRevealDto?> RevealKeyAsync(int id, int adminId, string? ipAddress);
    }
}
