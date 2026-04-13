using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Text.Json;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using educodeai_server.Repository.Interface;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace educodeai_server.Helpers
{
    public class GeminiAIService : IGeminiAIService
    {
        private readonly HttpClient _http;
        private readonly IRedisService _redisService;
        private readonly IKeyApiRepository _keyApiRepo;
        private readonly ILogger<GeminiAIService> _logger;
        private readonly string _secretKey;

        private static int _currentKeyIndex = 0;
        private static readonly object _lock = new object();

        public GeminiAIService(HttpClient http, IConfiguration config, IRedisService redisService, IKeyApiRepository keyApiRepo, ILogger<GeminiAIService> logger)
        {
            _http = http;
            _redisService = redisService;
            _keyApiRepo = keyApiRepo;
            _logger = logger;
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
                        
                        if (max == 0 || used < max)
                        {
                            validKeys.Add(k);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[Redis Error] Lỗi đọc Keys: {Message}", ex.Message);
            }

            // Nếu không có keys từ Redis, thử lấy từ database
            if (validKeys.Count == 0)
            {
                try
                {
                    var dbKeys = await _keyApiRepo.GetActiveKeysAsync();
                    foreach (var key in dbKeys)
                    {
                        if (key.TrangThai) // Chá kiá tra trang thái vì không có fields DaSuDungRequest
                        {
                            var redisKey = $"EduCodeAI:KeyPool:{key.ID}";
                            
                            // Äông bá key vào Redis/MemoryCache
                            await _redisService.LuuHashAsync(redisKey, "MaKeyMaHoa", key.MaKeyMaHoa);
                            await _redisService.LuuHashAsync(redisKey, "HanMucRequest", key.HanMucRequest.ToString());
                            await _redisService.LuuHashAsync(redisKey, "HanMucToken", key.HanMucToken.ToString());
                            await _redisService.LuuHashAsync(redisKey, "RequestDaDung", "0"); // Bát dáu tù 0
                            await _redisService.LuuHashAsync(redisKey, "TokenDaDung", "0");  // Bát dáu tù 0
                            await _redisService.LuuHashAsync(redisKey, "TrangThai", "true");
                            
                            validKeys.Add(redisKey);
                        }
                    }
                    
                    if (validKeys.Count > 0)
                    {
                        _logger.LogInformation("[Fallback] Đã tải {Count} keys từ database vào Redis/MemoryCache", validKeys.Count);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[Fallback Error] Không thể lấy keys từ database: {Message}", ex.Message);
                }
            }

            // Sáp xep theo uu tiên: Key Chính (LoaiKey="Chinh") có ThuTuUuTien thap hon
                var keyPriorities = new List<(string Key, int Priority)>();
                
                foreach (var k in validKeys)
                {
                    var parts = k.Split(':');
                    if (parts.Length < 3 || !int.TryParse(parts[2], out int keyId)) 
                    {
                        keyPriorities.Add((k, int.MaxValue));
                        continue;
                    }
                    
                    try
                    {
                        var dbKey = await _keyApiRepo.GetByIdAsync(keyId);
                        if (dbKey == null) 
                        {
                            keyPriorities.Add((k, int.MaxValue));
                            continue;
                        }
                        
                        // Key Chính có uu tiên cao hán (LoaiKey="Chinh" -> priority = 0)
                        // Key Phú có uu tiên tháp hán (LoaiKey="Phu" -> priority = 1)
                        int loaiKeyPriority = dbKey.LoaiKey == "Chinh" ? 0 : 1;
                        
                        // Tong priority = loaiKeyPriority * 1000 + ThuTuUuTien
                        // Dáa này Key Chính luôn có uu tiên cao hán Key Phú
                        int totalPriority = loaiKeyPriority * 1000 + dbKey.ThuTuUuTien;
                        
                        keyPriorities.Add((k, totalPriority));
                    }
                    catch
                    {
                        keyPriorities.Add((k, int.MaxValue));
                    }
                }
                
                var sortedKeys = keyPriorities
                    .OrderBy(x => x.Priority)
                    .Select(x => x.Key)
                    .ToList();
                
                // Log thu tu uu tien de debug
                if (sortedKeys.Any())
                {
                    _logger.LogInformation("[Key Priority] Sáp xep {Count} keys theo uu tiên:", sortedKeys.Count);
                    foreach (var (key, priority) in keyPriorities.OrderBy(x => x.Priority))
                    {
                        var parts = key.Split(':');
                        var keyId = parts.Length >= 3 ? parts[2] : "unknown";
                        _logger.LogInformation("  Key {KeyId} - Priority: {Priority}", keyId, priority);
                    }
                }
                
                return sortedKeys;
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
                        response = await _http.PostAsJsonAsync(requestUrl, requestBody);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Gemini Lỗi Kết Nối] Google từ chối phũ phàng với key {currentRedisKey}. Chi tiết: {ex.Message}. Đang thử key khác...");
                        soLanThuLai++;
                        await Task.Delay(2000);
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

                            await LuuLogVaoRedisQueue(currentRedisKey, totalTokens, (int)response.StatusCode, requestUrl);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[Gemini Lỗi Token Tracker] {ex.Message}");
                        }

                        return responseBody;
                    }

                    if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests ||
                        response.StatusCode == System.Net.HttpStatusCode.Forbidden ||
                        response.StatusCode == System.Net.HttpStatusCode.InternalServerError)
                    {
                        Console.WriteLine($"[Gemini] Key {currentRedisKey} bị {response.StatusCode}. Đang chuyển Key khác...");

                        await _redisService.TangGiaTriHashAsync(currentRedisKey, "RequestDaDung", 1);

                        await LuuLogVaoRedisQueue(currentRedisKey, 0, (int)response.StatusCode, requestUrl);

                        soLanThuLai++;
                        await Task.Delay(2000);
                        continue;
                    }

                    response.EnsureSuccessStatusCode();
                }

                throw new Exception("Tất cả các API Key đều đã vượt quá giới hạn hoặc quá tải. Vui lòng nạp thêm Key.");
            });
        }

        private async Task LuuLogVaoRedisQueue(string redisKey, int tokens, int statusCode, string url)
        {
            try
            {
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