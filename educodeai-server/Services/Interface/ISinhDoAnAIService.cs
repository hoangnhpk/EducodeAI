using educodeai_server.DTOs.AI;
using System.Threading.Tasks;

namespace educodeai_server.Services.Interface
{
    public interface ISinhDoAnAIService
    {
        Task<SinhDoAnResponseDto> GenerateDoAnAsync(SinhDoAnRequestDto request);
    }
}
