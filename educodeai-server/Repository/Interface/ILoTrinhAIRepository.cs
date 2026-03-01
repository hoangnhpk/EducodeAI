using educodeai_server.DTOs.AI;
using educodeai_server.Models;

namespace educodeai_server.Repository.Interface
{
    public interface ILoTrinhAIRepository
    {
        Task AddAsync(LoTrinhAIModel loTrinh);
        Task<LoTrinhAIModel?> GetByIdAsync(int maLoTrinh);
        Task UpdateAsync(LoTrinhAIModel loTrinh);

        Task<List<LoTrinhAIModel>> GetByUserIdAsync(int maNguoiDung);
    }
}
