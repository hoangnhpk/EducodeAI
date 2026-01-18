namespace educodeai_server.Services.Interface
{
    public interface IGeminiAIService
    {
        Task<string> GenerateAsync(string prompt);
    }
}
