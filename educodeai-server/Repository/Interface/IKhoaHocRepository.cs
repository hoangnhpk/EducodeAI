using educodeai_server.Models;
using educodeai_server.DTOs.AI;

namespace educodeai_server.Repository.Interface
{
    public interface IKhoaHocRepository
    {
        Task<List<KhoaHocAISnapshotDto>> GetKhoaHocPhuHopAsync(CreateLoTrinhAIDto dto);
    }
}
