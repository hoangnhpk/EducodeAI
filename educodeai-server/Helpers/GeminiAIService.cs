using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using educodeai_server.Services.Interface;
using Microsoft.Extensions.Configuration;

namespace educodeai_server.Helpers
{
    public class GeminiAIService : IGeminiAIService
    {
        private readonly HttpClient _http;
        private readonly IRedisService _redisService;
        private readonly string _secretKey;

        // Dùng static để biến này tồn tại xuyên suốt ứng dụng, xoay vòng mượt mà
        private static int _currentKeyIndex = 0;
        private static readonly object _lock = new object();

        public GeminiAIService(HttpClient http, IConfiguration config, IRedisService redisService)
        {
            _http = http;
            _redisService = redisService;
            _secretKey = config["ApiSecurity:SecretKey"] ?? throw new Exception("Chưa cấu hình SecretKey!");
        }

        private async Task<List<string>> LayDanhSachKeyHopLeTuRedisAsync()
        {
            var validKeys = new List<string>();
            try
            {
                var keys = _redisService.LayDanhSachKeyTheoPattern("EduCodeAI:KeyPool:*").ToList();
                foreach (var k in keys)
                {
                    var trangThaiStr = await _redisService.LayHashAsync(k, "TrangThai");
                    if (bool.TryParse(trangThaiStr, out bool isOk) && isOk)
                    {
                        var reqMaxStr = await _redisService.LayHashAsync(k, "HanMucRequest");
                        var reqUsedStr = await _redisService.LayHashAsync(k, "RequestDaDung");
                        int.TryParse(reqMaxStr, out int max);
                        int.TryParse(reqUsedStr, out int used);
                        
                        // Chấp nhận key chưa chạm trần
                        if (max == 0 || used < max)
                        {
                            validKeys.Add(k);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Redis Error] Lỗi đọc Keys: {ex.Message}");
            }
            return validKeys.OrderBy(k => k).ToList();
        }

        private string NextRedisKey(List<string> keys)
        {
            lock (_lock)
            {
                if (keys.Count == 0) throw new Exception("Không có API Key nào hợp lệ trên Redis!");
                _currentKeyIndex = (_currentKeyIndex + 1) % keys.Count;
                return keys[_currentKeyIndex];
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

                // Bước 1: Quét Redis tìm các Key còn hạn mức
                var hopLeKeys = await LayDanhSachKeyHopLeTuRedisAsync();
                
                int soLanThuLai = 0;
                int toiDaSoLanThu = hopLeKeys.Count == 0 ? 1 : hopLeKeys.Count;

                // VÒNG LẶP RETRY: Thử gọi API, lỗi (429/403) thì đổi Key và gọi lại
                while (soLanThuLai < toiDaSoLanThu)
                {
                    if (hopLeKeys.Count == 0) 
                        throw new Exception("Tất cả API Key đều hết hạn mức hoặc bị khóa.");

                    // Lấy hash key Redis bằng thuật toán xoay vòng Round-Robin
                    string currentRedisKey = NextRedisKey(hopLeKeys);
                    
                    // Lôi chuỗi mã hoá AES từ Redis ra
                    string maHoa = await _redisService.LayHashAsync(currentRedisKey, "MaKeyMaHoa");
                    // Giải mã thành Key Google thô (sk-...)
                    string rawKey = MaHoaHelper.GiaiMa(maHoa, _secretKey);

                    // Gắn Raw Key vào URL gọi Google Gemini
                    string requestUrl = $"v1beta/models/gemma-3-27b-it:generateContent?key={rawKey}";
                    var response = await _http.PostAsJsonAsync(requestUrl, requestBody);

                    if (response.IsSuccessStatusCode)
                    {
                        var responseBody = await response.Content.ReadAsStringAsync();

                        // ++ THÀNH CÔNG: Cập nhật Request vào Redis ngay lập tức ++
                        await _redisService.TangGiaTriHashAsync(currentRedisKey, "RequestDaDung", 1);
                        
                        // ++ Cập nhật THỐNG KÊ TOKEN ++
                        try
                        {
                            string usageMetaString = ChuanHoaJsonTuAIHelper.usageMetadata(responseBody);
                            var metaObj = Newtonsoft.Json.Linq.JObject.Parse(usageMetaString);
                            int totalTokens = (int?)metaObj["totalTokenCount"] ?? 0;
                            
                            if (totalTokens > 0)
                            {
                                await _redisService.TangGiaTriHashAsync(currentRedisKey, "TokenDaDung", totalTokens);
                                Console.WriteLine($"[Gemini] Key {currentRedisKey} vừa chạy hết {totalTokens} tokens.");
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[Gemini Lỗi Token Tracker] {ex.Message}");
                        }

                        return responseBody;
                    }

                    // ++ THẤT BẠI QUÁ TẢI (429/403) ++
                    if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests ||
                        response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                    {
                        Console.WriteLine($"[Gemini] Key {currentRedisKey} bị 429/403. Đã tăng bộ đếm RequestDaDung và đang chuyển Key khác...");
                        
                        // Yêu cầu: "nếu thất bại mà bị kiểu chạm limit thì cũng cập nhập request"
                        await _redisService.TangGiaTriHashAsync(currentRedisKey, "RequestDaDung", 1);
                        
                        // Nghỉ ngơi 1 giây trước khi xoay vòng sang Key kế tiếp
                        soLanThuLai++;
                        await Task.Delay(1000);
                        continue;
                    }

                    // Nếu lỗi nghiêm trọng khác (Bad Request sửa form...) thì quăng exception luôn
                    response.EnsureSuccessStatusCode();
                }

                throw new Exception("Tất cả các API Key đều đã vượt quá giới hạn hoặc quá tải. Vui lòng nạp thêm Key.");
            });
        }
    }
}