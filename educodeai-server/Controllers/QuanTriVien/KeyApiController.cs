using educodeai_server.DTOs.AI;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace educodeai_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class KeyApiController : ControllerBase
    {
        private readonly IKeyApiService _keyApiService;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<KeyApiController> _logger;

        public KeyApiController(IKeyApiService keyApiService, IHttpClientFactory httpClientFactory, ILogger<KeyApiController> logger)
        {
            _keyApiService = keyApiService;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        // POST /api/KeyApi/fetch-models
        // Backend proxy: nhận key từ client, gọi Google để lấy danh sách model
        // Mục đích: tránh CORS và không để raw key xuất hiện trên Network Tab trực tiếp
        [HttpPost("fetch-models")]
        public async Task<IActionResult> FetchGeminiModels([FromBody] string apiKey)
        {
            if (string.IsNullOrWhiteSpace(apiKey))
                return BadRequest("API Key không được để trống.");

            try
            {
                var client = _httpClientFactory.CreateClient();
                // Đưa key qua header x-goog-api-key thay vì query string để key không lọt vào access log/proxy.
                var request = new HttpRequestMessage(HttpMethod.Get, "https://generativelanguage.googleapis.com/v1beta/models");
                request.Headers.Add("x-goog-api-key", apiKey);
                var response = await client.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    var errBody = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("[FetchModels] Call to Google API failed. Status: {StatusCode}, Body: {Body}", response.StatusCode, errBody);
                    return StatusCode((int)response.StatusCode,
                        new { message = "API Key không hợp lệ hoặc đã bị khóa từ phía Google." });
                }

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                var models = doc.RootElement
                    .GetProperty("models")
                    .EnumerateArray()
                    .Where(m => m.TryGetProperty("name", out _))
                    .Where(m => 
                    {
                        if (m.TryGetProperty("supportedGenerationMethods", out var methods))
                        {
                            return methods.EnumerateArray().Any(method => method.GetString() == "generateContent");
                        }
                        return false;
                    })
                    .Select(m => new GeminiModelItemDto
                    {
                        Name = m.GetProperty("name").GetString() ?? "",
                        DisplayName = m.TryGetProperty("displayName", out var dn)
                            ? dn.GetString() ?? ""
                            : m.GetProperty("name").GetString() ?? ""
                    })
                    .OrderBy(m => m.Name)
                    .ToList();

                return Ok(models);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[FetchModels] Error connecting to Google API");
                return StatusCode(500, new { message = "Lỗi khi kết nối Google API." });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllKeys()
        {
            var keys = await _keyApiService.GetAllKeysAsync();
            return Ok(keys);
        }

        private int GetAdminId()
        {
            var claim = User.FindFirst("id") ?? User.FindFirst("Id") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            return int.TryParse(claim?.Value, out var id) ? id : 0;
        }

        private string? GetIpAddress()
        {
            return HttpContext.Connection.RemoteIpAddress?.ToString();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetKeyById(int id)
        {
            var key = await _keyApiService.GetKeyByIdAsync(id);
            if (key == null) return NotFound("Hong tìm thấy key này nha!");

            return Ok(key);
        }

        [HttpPost]
        public async Task<IActionResult> CreateKey([FromBody] KeyAPIManageDto dto)
        {
            var adminId = GetAdminId();
            var ipAddress = GetIpAddress();

            var isCreated = await _keyApiService.CreateNewKeyAsync(dto, adminId, ipAddress);
            if (!isCreated) return BadRequest("Tạo key thất bại, check lại data nghen!");

            return Ok("Tạo key mượt mà thành công!");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateKey(int id, [FromBody] KeyAPIManageDto dto)
        {
            var ipAddress = GetIpAddress();
            var adminId = GetAdminId();

            var isUpdated = await _keyApiService.UpdateKeyAsync(id, dto, adminId, ipAddress);
            if (!isUpdated) return BadRequest("Cập nhật key thất bại, kiểm tra lại dữ liệu!");

            return Ok("Cập nhật thành công!");
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> ToggleStatus(int id, [FromBody] bool status)
        {
            var ipAddress = GetIpAddress();
            var adminId = GetAdminId();

            var isUpdated = await _keyApiService.ToggleKeyStatusAsync(id, status, adminId, ipAddress);
            if (!isUpdated) return BadRequest("Cập nhật trạng thái bị xịt rồi!");

            return Ok("Đổi trạng thái cái rụp!");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKey(int id)
        {
            var ipAddress = GetIpAddress();
            var adminId = GetAdminId();
            var isDeleted = await _keyApiService.SoftDeleteKeyAsync(id, adminId, ipAddress);
            if (!isDeleted) return BadRequest("Xóa không được rùi!");

            return Ok("Xóa sạch sẽ, không để lại dấu vết!");
        }

        [HttpPost("{id}/sync-config")]
        public async Task<IActionResult> SyncToRedis(int id)
        {
            var ipAddress = GetIpAddress();
            var adminId = GetAdminId();

            var isSynced = await _keyApiService.SyncKeyToRedisAsync(id, adminId, ipAddress);
            if (!isSynced) return BadRequest("Đồng bộ Redis fail hoặc key đang tắt nha!");

            return Ok("Đồng bộ lên Redis ngon ơ!");
        }

        [HttpPost("{id}/reset-usage")]
        public async Task<IActionResult> ResetUsage(int id)
        {
            var ipAddress = GetIpAddress();
            var adminId = GetAdminId();

            var isReset = await _keyApiService.ResetKeyUsageAsync(id, adminId, ipAddress);
            if (!isReset) return BadRequest("Reset mức sử dụng thất bại!");

            return Ok("Đã reset mức sử dụng về 0!");
        }

        [HttpGet("{id}/reveal")]
        public async Task<IActionResult> RevealKey(int id)
        {
            var ipAddress = GetIpAddress();
            var adminId = GetAdminId();

            var revealData = await _keyApiService.RevealKeyAsync(id, adminId, ipAddress);
            if (revealData == null) return NotFound("Không tìm thấy key để hiển thị!");

            return Ok(revealData);
        }
    }
}