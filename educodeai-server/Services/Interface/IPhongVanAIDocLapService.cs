using educodeai_server.DTOs.AI;
using educodeai_server.Models;

namespace educodeai_server.Services.Interface
{
    public interface IPhongVanAIDocLapService
    {
        Task<StartPhongVanResponseDto> StartInterviewAsync(int userId, StartPhongVanRequestDto request);
        Task<AnswerPhongVanResponseDto> AnswerQuestionAsync(int userId, AnswerPhongVanRequestDto request);
        Task<EndPhongVanResponseDto> EndInterviewAsync(int userId, int maPhongVan);
        Task<List<LichSuPhongVanModel>> GetInterviewHistoryAsync(int userId);
    }
}
