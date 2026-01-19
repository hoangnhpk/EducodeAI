using educodeai_server.Models;
using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.KhoaHoc;

namespace educodeai_server.Repository.Interface
{
    public interface IKhoaHocRepository
    {
        Task<List<KhoaHocModel>> GetKhoaHocPhuHopAsync(CreateLoTrinhAIDto dto);
        Task<List<ChuongHocDTO>> GetKhoaHocByIdAsync(int maKhoaHoc);
    }
}
