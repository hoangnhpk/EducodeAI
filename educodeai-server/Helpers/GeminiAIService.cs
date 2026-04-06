using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Text.Json;
using educodeai_server.Models;
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

                var hopLeKeys = await LayDanhSachKeyHopLeTuRedisAsync();
                
                int soLanThuLai = 0;
                int toiDaSoLanThu = hopLeKeys.Count == 0 ? 1 : hopLeKeys.Count;

                while (soLanThuLai < toiDaSoLanThu)
                {
                    if (hopLeKeys.Count == 0)
                        throw new Exception("Tất cả API Key đều hết hạn mức hoặc bị khóa.");

                    string currentRedisKey = NextRedisKey(hopLeKeys);

                    string maHoa = await _redisService.LayHashAsync(currentRedisKey, "MaKeyMaHoa");
                    string rawKey = MaHoaHelper.GiaiMa(maHoa, _secretKey);

                    string requestUrl = $"v1beta/models/gemma-3-27b-it:generateContent?key={rawKey}";

                    HttpResponseMessage response = null;

                    try
                    {
                        // Phải bọc try-catch ở đây để chống lỗi SocketException văng ra ngoài
                        response = await _http.PostAsJsonAsync(requestUrl, requestBody);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Gemini Lỗi Kết Nối] Google từ chối phũ phàng với key {currentRedisKey}. Chi tiết: {ex.Message}. Đang thử key khác...");
                        soLanThuLai++;
                        await Task.Delay(2000); // Delay 2 giây để nhịp thở ổn định lại rồi mới gọi tiếp
                        continue;
                    }

                    if (response.IsSuccessStatusCode)
                    {
                        var responseBody = await response.Content.ReadAsStringAsync();

                        await _redisService.TangGiaTriHashAsync(currentRedisKey, "RequestDaDung", 1);

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

                            // Lưu nhật ký thành công vào Redis để Worker xử lý đổ vào DB
                            await LuuLogVaoRedisQueue(currentRedisKey, totalTokens, (int)response.StatusCode, requestUrl);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[Gemini Lỗi Token Tracker] {ex.Message}");
                        }

                        return responseBody;
                    }

                    // Nếu không Success, check xem có phải do Rate Limit hoặc sập server AI không
                    if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests ||
                        response.StatusCode == System.Net.HttpStatusCode.Forbidden ||
                        response.StatusCode == System.Net.HttpStatusCode.InternalServerError)
                    {
                        Console.WriteLine($"[Gemini] Key {currentRedisKey} bị {response.StatusCode}. Đang chuyển Key khác...");

                        await _redisService.TangGiaTriHashAsync(currentRedisKey, "RequestDaDung", 1);

                        // Lưu nhật ký lỗi vào Redis để Worker xử lý đổ vào DB
                        await LuuLogVaoRedisQueue(currentRedisKey, 0, (int)response.StatusCode, requestUrl);

                        soLanThuLai++;
                        await Task.Delay(2000); // Cho nó nghỉ 2 giây rồi mới xoay vòng
                        continue;
                    }

                    // Nếu lỗi lạ lùng khác mà không catch được ở trên thì quăng lỗi
                    response.EnsureSuccessStatusCode();
                }

                throw new Exception("Tất cả các API Key đều đã vượt quá giới hạn hoặc quá tải. Vui lòng nạp thêm Key.");
            });
        }

        private async Task LuuLogVaoRedisQueue(string redisKey, int tokens, int statusCode, string url)
        {
            try
            {
                // Extract ID từ pattern "EduCodeAI:KeyPool:{ID}"
                var parts = redisKey.Split(':');
                if (parts.Length < 3 || !int.TryParse(parts[2], out int keyId)) return;

                var nhatKy = new NhatKySuDungModel
                {
                    ID_Key = keyId,
                    SoTokenTieuHao = tokens,
                    ThoiGianGoi = DateTime.Now,
                    MaTrangThai = statusCode,
                    DuongDanAPI = url
                };

                string jsonLog = JsonSerializer.Serialize(nhatKy);
                await _redisService.DayVaoCuoiListAsync("EduCodeAI:LogQueue", jsonLog);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Lỗi Lưu Log Redis] {ex.Message}");
            }
        }
    }
}