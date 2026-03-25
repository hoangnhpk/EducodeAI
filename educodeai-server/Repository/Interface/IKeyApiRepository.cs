using educodeai_server.DTOs.AI;
using educodeai_server.Models;

namespace educodeai_server.Repository.Interface
{
    public interface IKeyApiRepository
    {
        // Trả về list DTO sạch sẽ để hiện UI
        Task<IEnumerable<KeyAPISummaryDto?>> GetSummaryListAsync();

        // Trả về chi tiết (có thể dùng để Edit)
        Task<KeyAPISummaryDto?> GetByIdAsync(int id);

        // Thao tác nghiệp vụ
        Task<bool> CreateKeyAsync(KeyAPIManageDto dto);
        Task<bool> UpdateStatusAsync(int id, bool status);
        Task<bool> DeleteKeyAsync(int id);

        Task<KeyAPIModel?> GetRawKeyForRedisAsync(int id);
    }
}
