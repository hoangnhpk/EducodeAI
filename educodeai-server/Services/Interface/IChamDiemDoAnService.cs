using System.Threading.Tasks;
using educodeai_server.DTOs.AI;
using Microsoft.AspNetCore.Http;

namespace educodeai_server.Services.Interface
{
    public interface IChamDiemDoAnService
    {
        Task<KetQuaChamDiemDoAnDto> ChamDiemDoAnZipAsync(int userId, NopDoAnZipRequestDto request);
    }
}
