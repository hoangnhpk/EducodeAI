using educodeai_server.DTOs.AI;

namespace educodeai_server.Services.Interface
{
    public interface IChatBotAIService
    {
        Task<string> TuVanHocTapAsync(YeuCauChatAIDTO yeuCau);
        Task<string> TomTatVideoAsync(YeuCauTomTatVideoDTO yeuCau);
    }
}
