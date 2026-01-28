using System.Net.Http;

namespace educodeai_server.Helpers
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
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    //maxOutputTokens = 4000,   // 🔥 GIỚI HẠN OUTPUT
                    temperature = 0.7,
                    topP = 0.9
                }
            };

            var response = await _http.PostAsJsonAsync(
                "v1beta/models/gemini-2.5-flash:generateContent",
                requestBody);

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }
    }

}
