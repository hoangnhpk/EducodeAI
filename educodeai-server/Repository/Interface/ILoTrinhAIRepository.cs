using educodeai_server.Models;

namespace educodeai_server.Repository.Interface
{
    public interface ILoTrinhAIRepository
    {
        Task AddAsync(LoTrinhAIModel loTrinh);
    }
}
