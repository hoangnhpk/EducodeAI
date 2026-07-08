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
        private readonly IRateLimitService _rateLimitService;
        private readonly ILogger<GeminiAIService> _logger;
        private readonly string _secretKey;
        private readonly string _modelName;

        private static int _currentKeyIndex = 0;
        private static readonly object _lock = new object();

        public GeminiAIService(HttpClient http, IConfiguration config, IRedisService redisService, IKeyApiRepository keyApiRepo, IRateLimitService rateLimitService, ILogger<GeminiAIService> logger)
        {
            _http = http;
            _redisService = redisService;
            _keyApiRepo = keyApiRepo;
            _rateLimitService = rateLimitService;
            _logger = logger;
            _secretKey = config["ApiSecurity:SecretKey"] ?? throw new Exception("Chưa cấu hình SecretKey!");
            _modelName = config["GeminiAI:Model"] ?? "gemini-1.5-flash";
        }

        private async Task<List<string>> LayDanhSachKeyHopLeTuRedisAsync()
        {
            var validKeys = new List<string>();
            var keys = new List<string>();
            try
            {
                keys = _redisService.LayDanhSachKeyTheoPattern("EduCodeAI:KeyPool:*").ToList();
                foreach (var k in keys)
                {
                    var trangThaiStr = await _redisService.LayHashAsync(k, "TrangThai");
                    if (bool.TryParse(trangThaiStr, out bool isOk) && isOk)
                    {
                        var reqMaxStr = await _redisService.LayHashAsync(k, "RPDLimit");
                        int.TryParse(reqMaxStr, out int max);

                        var parts = k.Split(':');
                        if (parts.Length >= 3 && int.TryParse(parts[2], out int keyId))
                        {
                            string homNaySuffix = DateTime.UtcNow.ToString("yyyyMMdd");
                            var reqUsedStr = await _redisService.LayGiaTriAsync($"EduCodeAI:Usage:RPD:{keyId}:{homNaySuffix}");
                            int.TryParse(reqUsedStr ?? "0", out int used);
                            
                            if (max > 0 && used < max)
                            {
                                validKeys.Add(k);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[Redis Error] Lỗi đọc Keys: {Message}", ex.Message);
            }

            // Nếu không có keys từ Redis, thử lấy từ database
            if (keys.Count == 0)
            {
                try
                {
                    var dbKeys = await _keyApiRepo.GetActiveKeysAsync();
                    foreach (var key in dbKeys)
                    {
                        if (key.TrangThai && key.RPDLimit > 0)
                        {
                            var redisKey = $"EduCodeAI:KeyPool:{key.ID}";
                            
                            // Äông bá key vào Redis/MemoryCache
                            await _redisService.LuuHashAsync(redisKey, "MaKeyMaHoa", key.MaKeyMaHoa);
                            await _redisService.LuuHashAsync(redisKey, "RPMLimit", key.RPMLimit.ToString());
                            await _redisService.LuuHashAsync(redisKey, "TPMLimit", key.TPMLimit.ToString());
                            await _redisService.LuuHashAsync(redisKey, "RPDLimit", key.RPDLimit.ToString());
                            await _redisService.LuuHashAsync(redisKey, "ModelSuDung", key.ModelSuDung);
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

        public async Task<bool> IsAIAvailableAsync()
        {
            var validKeys = await LayDanhSachKeyHopLeTuRedisAsync();
            return validKeys != null && validKeys.Count > 0;
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

        public async Task<string> GenerateAsync(string prompt, bool isJsonMode = false)
        {
            return await AiRequestQueueHelper.EnqueueAsync(async () =>
            {
                object config = isJsonMode 
                    ? new { temperature = 0.7, topP = 0.9, maxOutputTokens = 8192, responseMimeType = "application/json" }
                    : new { temperature = 0.7, topP = 0.9, maxOutputTokens = 8192 };

                var requestBody = new
                {
                    contents = new[] { new { parts = new[] { new { text = prompt } } } },
                    generationConfig = config
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


                    string modelSuDung = await _redisService.LayHashAsync(currentRedisKey, "ModelSuDung");
                    if (string.IsNullOrWhiteSpace(modelSuDung)) modelSuDung = _modelName;
                    else if (modelSuDung.StartsWith("models/")) modelSuDung = modelSuDung.Substring(7);

                    string requestUrl = $"v1beta/models/{modelSuDung}:generateContent?key={rawKey}";

                    var parts = currentRedisKey.Split(':');
                    int.TryParse(parts.Length >= 3 ? parts[2] : "0", out int keyId);

                    int.TryParse(await _redisService.LayHashAsync(currentRedisKey, "RPMLimit"), out int rpmLimit);
                    int.TryParse(await _redisService.LayHashAsync(currentRedisKey, "TPMLimit"), out int tpmLimit);
                    int.TryParse(await _redisService.LayHashAsync(currentRedisKey, "RPDLimit"), out int rpdLimit);

                    // Estimate Tokens: roughly 0.3 tokens per char for prompt
                    int estimatedTokens = (int)Math.Ceiling(prompt.Length * 0.3) + 200; // 200 overhead

                    if (!await _rateLimitService.ReserveQuotaAsync(keyId, rpmLimit, tpmLimit, rpdLimit, estimatedTokens))
                    {
                        Console.WriteLine($"[RateLimit] Key {currentRedisKey} bị giới hạn (RPM/TPM/RPD). Đang chuyển Key khác...");
                        soLanThuLai++;
                        continue;
                    }


                    HttpResponseMessage response = null;
                    int actualTokens = 0;

                    try
                    {
                        response = await _http.PostAsJsonAsync(requestUrl, requestBody);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Gemini Lỗi Kết Nối] Google từ chối phũ phàng với key {currentRedisKey}. Chi tiết: {ex.Message}. Đang thử key khác...");
                        await _rateLimitService.CommitQuotaAsync(keyId, 0, estimatedTokens);
                        soLanThuLai++;
                        await Task.Delay(2000);
                        continue;
                    }

                    if (response.IsSuccessStatusCode)
                    {
                        var responseBody = await response.Content.ReadAsStringAsync();

                        try
                        {
                            string usageMetaString = ChuanHoaJsonTuAIHelper.usageMetadata(responseBody);
                            var metaObj = Newtonsoft.Json.Linq.JObject.Parse(usageMetaString);
                            actualTokens = (int?)metaObj["totalTokenCount"] ?? 0;

                            if (actualTokens > 0)
                            {
                                Console.WriteLine($"[Gemini] Key {currentRedisKey} vừa chạy hết {actualTokens} tokens.");
                            }

                            await LuuLogVaoRedisQueue(currentRedisKey, actualTokens, (int)response.StatusCode, requestUrl);
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[Gemini Lỗi Token Tracker] {ex.Message}");
                        }

                        await _rateLimitService.CommitQuotaAsync(keyId, actualTokens, estimatedTokens);

                        return responseBody;
                    }

                    if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized ||
                        response.StatusCode == System.Net.HttpStatusCode.TooManyRequests ||
                        response.StatusCode == System.Net.HttpStatusCode.Forbidden ||
                        response.StatusCode == System.Net.HttpStatusCode.InternalServerError ||
                        response.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable ||
                        response.StatusCode == System.Net.HttpStatusCode.BadGateway)
                    {
                        Console.WriteLine($"[Gemini] Key {currentRedisKey} bị {response.StatusCode}. Đang chuyển Key khác...");

                        await _rateLimitService.CommitQuotaAsync(keyId, 0, estimatedTokens);
                        await LuuLogVaoRedisQueue(currentRedisKey, 0, (int)response.StatusCode, requestUrl);

                        soLanThuLai++;
                        await Task.Delay(2000);
                        continue;
                    }


                    if (!response.IsSuccessStatusCode)
                    {
                        string errorContent = await response.Content.ReadAsStringAsync();
                        
                        string msg = "Lỗi kết nối đến máy chủ AI. Vui lòng thử lại.";

                        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                            msg = "Lỗi (401): API Key bị thiếu hoặc sai. Vui lòng kiểm tra lại cấu hình Key trong hệ thống.";
                        else if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                            msg = "Lỗi (429): API Key đã dùng hết lượt hoặc bị gọi quá nhanh. Vui lòng thử lại sau 1 phút hoặc thêm Key mới.";
                        else if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                            msg = "Lỗi (403): API Key bị từ chối truy cập (có thể do sai quyền hoặc bị khóa).";
                        else if (response.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable || response.StatusCode == System.Net.HttpStatusCode.BadGateway)
                            msg = $"Lỗi ({response.StatusCode}): Máy chủ AI của Google đang bị nghẽn mạng. Vui lòng nhấn Thử lại sau ít phút.";
                        else
                            msg = $"Lỗi không xác định từ AI ({response.StatusCode}). Vui lòng báo cho Admin.";

                        // Chỉ in chi tiết lỗi ra Console cho Dev đọc, còn ném ra UI thông báo tiếng Việt
                        Console.WriteLine($"[Gemini Error] {response.StatusCode} - {errorContent}");
                        throw new Exception(msg);
                    }

                    if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        await _rateLimitService.CommitQuotaAsync(keyId, 0, estimatedTokens);
                        var body = await response.Content.ReadAsStringAsync();
                        _logger.LogError("[Gemini] Model/API endpoint không tồn tại. Model={Model}, Body={Body}", modelSuDung, body);
                        throw new Exception($"Model AI '{modelSuDung}' không tồn tại hoặc chưa được Google hỗ trợ. Vui lòng kiểm tra cấu hình.");
                    }

                    await _rateLimitService.CommitQuotaAsync(keyId, 0, estimatedTokens);
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
                    ThoiGianGoi = DateTime.UtcNow,
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