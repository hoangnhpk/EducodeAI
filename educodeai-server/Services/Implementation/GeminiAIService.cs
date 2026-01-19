using educodeai_server.Services.Interface;

namespace educodeai_server.Services.Implementation
{
    public class GeminiAIService : IGeminiAIService
    {
        private readonly HttpClient _http;

        public GeminiAIService(HttpClient http)
        {
            _http = http;
        }

        public async Task<string> GenerateAsync(string prompt)
        {
            var body = new
            {
                contents = new[]
                {
                new { parts = new[] { new { text = prompt } } }
            }
            };

            var res = await _http.PostAsJsonAsync(
                "v1beta/models/gemini-pro:generateContent", body);

            return await res.Content.ReadAsStringAsync();
        }
    }

}
