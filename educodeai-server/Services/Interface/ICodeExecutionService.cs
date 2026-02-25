using educodeai_server.DTOs.BaiTap;

namespace educodeai_server.Services.Interface
{
    public interface ICodeExecutionService
    {
        Task<CodeExecutionResultDTO> ExecuteCodeAsync(string code, string language, string input);
    }
}
