namespace educodeai_server.Helpers
{
    public interface IGeminiAIService
    {
        Task<string> GenerateAsync(string prompt);
    }
}
