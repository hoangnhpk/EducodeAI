using educodeai_server.DTOs.AI;
using educodeai_server.Models;

namespace educodeai_server.Repository.Interface
{
    public interface IKeyApiRepository
    {
        Task<IEnumerable<KeyAPISummaryDto?>> GetSummaryListAsync();

        Task<KeyAPISummaryDto?> GetByIdAsync(int id);

        Task<int> CreateKeyAsync(KeyAPIManageDto dto);
        Task<bool> UpdateKeyAsync(int id, KeyAPIManageDto dto);
        Task<bool> UpdateStatusAsync(int id, bool status);
        Task<bool> DeleteKeyAsync(int id);

        Task<KeyAPIModel?> GetRawKeyForRedisAsync(int id);
        Task<IEnumerable<KeyAPIModel>> GetActiveKeysAsync();
    }
}
