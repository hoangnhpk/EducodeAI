using System.Text;
using System.Text.Json;
using educodeai_server.Config;
using educodeai_server.Services.Interface;
using Microsoft.Extensions.Options;

namespace educodeai_server.Services.Implementation
{
    public class VietQrLookupApiService : IVietQrLookupApiService
    {
        private readonly HttpClient _httpClient;
        private readonly VietQrLookupOptions _opt;
        private readonly ILogger<VietQrLookupApiService> _logger;

        public VietQrLookupApiService(
            HttpClient httpClient,
            IOptions<VietQrLookupOptions> opt,
            ILogger<VietQrLookupApiService> logger)
        {
            _httpClient = httpClient;
            _opt = opt.Value;
            _logger = logger;
        }

        public async Task<VietQrTraCuuKetQua> TraCuuTaiKhoanAsync(
            int bin,
            string accountNumber,
            CancellationToken cancellationToken = default)
        {
            string so = accountNumber.Trim();
            var payload = new { bin, accountNumber = so };
            string json = JsonSerializer.Serialize(payload);
            using var request = new HttpRequestMessage(HttpMethod.Post, "lookup")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };

            request.Headers.TryAddWithoutValidation("x-client-id", _opt.ClientId);
            request.Headers.TryAddWithoutValidation("x-api-key", _opt.ApiKey);

            HttpResponseMessage response;
            try
            {
                response = await _httpClient.SendAsync(request, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gọi VietQR lookup thất bại");
                return new VietQrTraCuuKetQua
                {
                    ThanhCong = false,
                    MoTa = "Không kết nối được VietQR.io: " + ex.Message
                };
            }

            string body = await response.Content.ReadAsStringAsync(cancellationToken);

            if ((int)response.StatusCode == 429)
            {
                return new VietQrTraCuuKetQua
                {
                    ThanhCong = false,
                    MoTa = "VietQR.io báo vượt giới hạn gọi API (429). Thử lại sau."
                };
            }

            try
            {
                using JsonDocument doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(body) ? "{}" : body);
                JsonElement root = doc.RootElement;
                string? code = LayChuoi(root, "code");
                string? desc = LayChuoi(root, "desc");

                if (code == "00" && TryGetProperty(root, "data", out JsonElement data))
                {
                    string? accountName = null;
                    if (TryGetProperty(data, "accountName", out JsonElement an) && an.ValueKind == JsonValueKind.String)
                    {
                        accountName = an.GetString();
                    }

                    return new VietQrTraCuuKetQua
                    {
                        ThanhCong = true,
                        MaCode = code,
                        MoTa = desc,
                        AccountName = accountName
                    };
                }

                if (!response.IsSuccessStatusCode)
                {
                    return new VietQrTraCuuKetQua
                    {
                        ThanhCong = false,
                        MaCode = code,
                        MoTa = desc ?? $"VietQR.io HTTP {(int)response.StatusCode}"
                    };
                }

                return new VietQrTraCuuKetQua
                {
                    ThanhCong = false,
                    MaCode = code,
                    MoTa = desc ?? body
                };
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Phân tích JSON VietQR: {Body}", body.Length > 500 ? body[..500] : body);
                return new VietQrTraCuuKetQua
                {
                    ThanhCong = false,
                    MoTa = "Phản hồi VietQR.io không hợp lệ: " + ex.Message
                };
            }
        }

        private static string? LayChuoi(JsonElement el, string name)
        {
            return TryGetProperty(el, name, out JsonElement p) && p.ValueKind == JsonValueKind.String
                ? p.GetString()
                : null;
        }

        private static bool TryGetProperty(JsonElement el, string name, out JsonElement value)
        {
            if (el.ValueKind == JsonValueKind.Object && el.TryGetProperty(name, out value))
            {
                return true;
            }

            value = default;
            return false;
        }
    }
}
