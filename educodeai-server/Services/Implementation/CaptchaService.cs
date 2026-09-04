using System.Net.Http.Json;
using educodeai_server.Services.Interface;
using System.Text.Json;

namespace educodeai_server.Services.Implementation
{
    public class CaptchaService : ICaptchaService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public CaptchaService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
            _httpClient.Timeout = TimeSpan.FromSeconds(5);
        }

        public async Task<bool> XacNhanCaptchaAsync(string captchaToken)
        {
            var secretKey = _config["Captcha:SecretKey"];
            if (string.IsNullOrWhiteSpace(secretKey)
                || secretKey.Contains("SET_VIA", StringComparison.OrdinalIgnoreCase)
                || string.Equals(captchaToken, "SKIP_CAPTCHA", StringComparison.Ordinal)) return false;

            try
            {
                using var content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["secret"] = secretKey,
                    ["response"] = captchaToken
                });
                using var response = await _httpClient.PostAsync("https://www.google.com/recaptcha/api/siteverify", content);
                if (!response.IsSuccessStatusCode) return false;
                using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
                return document.RootElement.TryGetProperty("success", out var success) && success.ValueKind == JsonValueKind.True;
            }
            catch (HttpRequestException) { return false; }
            catch (TaskCanceledException) { return false; }
            catch (JsonException) { return false; }
        }
    }
}