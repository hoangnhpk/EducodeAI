using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.KhoaHoc;

namespace educodeai_server.Services.Interface
{
    public interface ILoTrinhAIGvService
    {
        Task<AIGeneratedKhoaHocDTO> PhacThaoKhoaHocBangAIAsync(TaoLoTrinhRequest request, int maGiangVien);
        Task<bool> LuuKhoaHocChinhThucAsync(AIGeneratedKhoaHocDTO data, int maGiangVien);
    }
}