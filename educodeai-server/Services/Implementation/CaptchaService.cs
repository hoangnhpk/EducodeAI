using educodeai_server.Services.Interface;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace educodeai_server.Services.Implementation;

public sealed class CaptchaService : ICaptchaService
{
    private const string VerifyEndpoint = "https://www.google.com/recaptcha/api/siteverify";
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<CaptchaService> _logger;

    public CaptchaService(HttpClient httpClient, IConfiguration config, ILogger<CaptchaService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    public async Task<bool> XacNhanCaptchaAsync(string captchaToken)
    {
        var secretKey = _config["Captcha:SecretKey"]?.Trim();
        if (string.IsNullOrWhiteSpace(secretKey)
            || secretKey.Contains("SET_VIA_", StringComparison.OrdinalIgnoreCase)
            || secretKey.Contains("YOUR_", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogError("CAPTCHA secret is not configured; rejecting verification.");
            return false;
        }

        if (string.IsNullOrWhiteSpace(captchaToken)
            || string.Equals(captchaToken, "SKIP_CAPTCHA", StringComparison.Ordinal))
        {
            return false;
        }

        try
        {
            using var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["secret"] = secretKey,
                ["response"] = captchaToken
            });
            using var response = await _httpClient.PostAsync(VerifyEndpoint, content);
            if (!response.IsSuccessStatusCode)
                return false;

            var result = await response.Content.ReadFromJsonAsync<CaptchaVerificationResponse>();
            return result?.Success == true;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "CAPTCHA verification provider request failed.");
            return false;
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "CAPTCHA verification provider returned malformed JSON.");
            return false;
        }
    }

    private sealed class CaptchaVerificationResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }
    }
}
