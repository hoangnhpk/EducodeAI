using educodeai_server.DTOs.BaiTap;

namespace educodeai_server.Services.Interface
{
    public interface IQuizService
    {
        Task<int> CreateQuizAsync(CreateQuizDTO dto);
        Task<string> GenerateQuizByAIAsync(GenerateQuizAIDTO dto);
    }
}
