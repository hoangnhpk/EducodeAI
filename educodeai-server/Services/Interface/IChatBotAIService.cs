using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.VideoAI;

namespace educodeai_server.Services.Interface
{
    public interface IChatBotAIService
    {
        Task<string> TuVanHocTapAsync(YeuCauChatAIDTO yeuCau);
        Task<string> TomTatVideoAsync(YeuCauTomTatVideoDTO yeuCau);
        Task<VideoAnalysisResultDTO?> PhanTichVideoAsync(string linkVideo, string tieuDeBaiHoc);
    }
}
