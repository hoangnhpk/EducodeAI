using educodeai_server.DTOs.AI;
using educodeai_server.Models;

namespace educodeai_server.Repository.Interface
{
    public interface ILoTrinhAIGvRepository
    {
        Task LuuLichSuAIAsync(LoTrinhAIModel model);
        Task<bool> LuuKhoaHocChinhThucAsync(AIGeneratedKhoaHocDTO data, int maGiangVien);
    }
}