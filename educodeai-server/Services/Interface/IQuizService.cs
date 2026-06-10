using educodeai_server.DTOs.BaiTap;

namespace educodeai_server.Services.Interface
{
    public interface IQuizService
    {
        Task<int> CreateQuizAsync(CreateQuizDTO dto, int maGiangVien);
        Task<bool> CapNhatQuizAsync(int maBaiTap, CreateQuizDTO dto, int maGiangVien);
        Task<string> GenerateQuizByAIAsync(GenerateQuizAIDTO dto, int maGiangVien);
    }
}
