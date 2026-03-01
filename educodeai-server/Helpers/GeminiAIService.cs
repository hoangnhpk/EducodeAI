using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace educodeai_server.Helpers
{
    public class GeminiAIService : IGeminiAIService
    {
        private readonly HttpClient _http;
        private readonly List<string> _apiKeys;

        // Dùng static để biến này tồn tại xuyên suốt ứng dụng, giữ được vị trí Key đang dùng
        private static int _currentKeyIndex = 0;
        private static readonly object _lock = new object();

        public GeminiAIService(HttpClient http, IConfiguration config)
        {
            _http = http;
            // Đọc mảng ApiKeys từ appsettings.json
            _apiKeys = config.GetSection("GeminiAI:ApiKeys").Get<List<string>>() ?? new List<string>();

            if (_apiKeys.Count == 0)
            {
                throw new Exception("Chưa cấu hình Gemini API Keys trong appsettings.json!");
            }
        }

        // Hàm lấy Key và xoay vòng nếu cần
        private string LayKeyHienTai(bool chuyenKeyTiepTheo = false)
        {
            lock (_lock) // Lock để đảm bảo an toàn khi nhiều request chạy cùng lúc
            {
                if (chuyenKeyTiepTheo)
                {
                    // Chuyển sang key tiếp theo. Nếu hết danh sách thì quay lại từ đầu (xoay vòng)
                    _currentKeyIndex = (_currentKeyIndex + 1) % _apiKeys.Count;
                    Console.WriteLine($"[CẢNH BÁO] Đã đổi sang dùng API Key số {_currentKeyIndex + 1}");
                }
                return _apiKeys[_currentKeyIndex];
            }
        }

        public async Task<string> GenerateAsync(string prompt)
        {
            return await AiRequestQueueHelper.EnqueueAsync(async () =>
            {
                var requestBody = new
                {
                    contents = new[] { new { parts = new[] { new { text = prompt } } } },
                    generationConfig = new { temperature = 0.7, topP = 0.9 }
                };

                int soLanThuLai = 0;
                int toiDaSoLanThu = _apiKeys.Count; // Thử đúng bằng số lượng key mình có

                // VÒNG LẶP RETRY: Thử gọi API, lỗi thì đổi Key và gọi lại
                while (soLanThuLai < toiDaSoLanThu)
                {
                    string currentKey = LayKeyHienTai();
                    // Gắn Key vào trực tiếp URL
                    string requestUrl = $"v1beta/models/gemma-3-27b-it:generateContent?key={currentKey}";

                    var response = await _http.PostAsJsonAsync(requestUrl, requestBody);

                    if (response.IsSuccessStatusCode)
                    {
                        return await response.Content.ReadAsStringAsync();
                    }

                    // Nếu mã lỗi là 429 (Too Many Requests) hoặc 403 (Quota Exceeded) -> Xoay Key
                    if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests ||
                        response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                    {
                        Console.WriteLine($"Key đuôi ...{currentKey.Substring(currentKey.Length - 4)} bị quá tải (429/403). Đang xoay Key...");

                        // Yêu cầu chuyển sang Key tiếp theo
                        LayKeyHienTai(chuyenKeyTiepTheo: true);
                        soLanThuLai++;

                        // Nghỉ ngơi 1 giây trước khi thử lại cho đỡ ngợp mạng
                        await Task.Delay(1000);
                        continue;
                    }

                    // Nếu là lỗi khác (ví dụ 400 Bad Request do sai form), thì văng lỗi luôn không cần thử lại
                    response.EnsureSuccessStatusCode();
                }

                // Nếu thoát ra khỏi vòng lặp while mà vẫn xuống tới đây, nghĩa là mọi Key đều đã "chết"
                throw new Exception("Tất cả các API Key đều đã vượt quá giới hạn hoặc bị khóa. Vui lòng thử lại sau.");
            });
        }
    }
}