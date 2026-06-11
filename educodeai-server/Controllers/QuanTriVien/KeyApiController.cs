using educodeai_server.DTOs.AI;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class KeyApiController : ControllerBase
    {
        private readonly IKeyApiService _keyApiService;

        public KeyApiController(IKeyApiService keyApiService)
        {
            _keyApiService = keyApiService;
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