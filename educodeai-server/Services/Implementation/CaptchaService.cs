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
        }

        public async Task<bool> XacNhanCaptchaAsync(string captchaToken)
        {
            // Trong thực tế, bạn sẽ lấy SecretKey từ appsettings.json
            // Tạm thời để trống hoặc điền secret key của Google reCAPTCHA vào đây
            var secretKey = _config["Captcha:SecretKey"] ?? "YOUR_GOOGLE_SECRET_KEY";

            var response = await _httpClient.PostAsync($"https://www.google.com/recaptcha/api/siteverify?secret={secretKey}&response={captchaToken}", null);

            if (response.IsSuccessStatusCode)
            {
                var jsonString = await response.Content.ReadAsStringAsync();
                using var document = JsonDocument.Parse(jsonString);
                return document.RootElement.GetProperty("success").GetBoolean();
            }
            return false;
        }
    }
}