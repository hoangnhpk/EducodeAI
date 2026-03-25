using educodeai_server.DTOs.AI;

namespace educodeai_server.Services.Interface
{
    public interface IKeyApiService
    {
        Task<IEnumerable<KeyAPISummaryDto?>> GetAllKeysAsync();

        Task<KeyAPISummaryDto?> GetKeyByIdAsync(int id);

        Task<bool> CreateNewKeyAsync(KeyAPIManageDto dto);

        Task<bool> UpdateKeyAsync(int id, KeyAPIManageDto dto);

        Task<bool> ToggleKeyStatusAsync(int id, bool status);

        Task<bool> DeleteKeyAsync(int id);

        Task<bool> SyncKeyToRedisAsync(int id);
    }
}
