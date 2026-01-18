public interface IGeminiAIService
{
    Task<string> GenerateAsync(string prompt);
}