namespace educodeai_server.Helpers
{
    public interface IGeminiAIService
    {
        Task<string> GenerateAsync(string prompt, bool isJsonMode = false);
        Task<bool> IsAIAvailableAsync();
    }
}
