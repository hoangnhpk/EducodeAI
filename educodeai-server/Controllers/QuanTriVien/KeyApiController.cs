using educodeai_server.DTOs.AI;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace educodeai_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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
            var isCreated = await _keyApiService.CreateNewKeyAsync(dto);
            if (!isCreated) return BadRequest("Tạo key thất bại, check lại data nghen!");

            return Ok("Tạo key mượt mà thành công!");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateKey(int id, [FromBody] KeyAPIManageDto dto)
        {
            var isUpdated = await _keyApiService.UpdateKeyAsync(id, dto);
            if (!isUpdated) return BadRequest("Cập nhật key thất bại, kiểm tra lại dữ liệu!");

            return Ok("Cập nhật thành công!");
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> ToggleStatus(int id, [FromBody] bool status)
        {
            var isUpdated = await _keyApiService.ToggleKeyStatusAsync(id, status);
            if (!isUpdated) return BadRequest("Cập nhật trạng thái bị xịt rồi!");

            return Ok("Đổi trạng thái cái rụp!");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKey(int id)
        {
            var isDeleted = await _keyApiService.DeleteKeyAsync(id);
            if (!isDeleted) return BadRequest("Xóa không được rùi!");

            return Ok("Xóa sạch sẽ, không để lại dấu vết!");
        }

        [HttpPost("{id}/sync")]
        public async Task<IActionResult> SyncToRedis(int id)
        {
            var isSynced = await _keyApiService.SyncKeyToRedisAsync(id);
            if (!isSynced) return BadRequest("Đồng bộ Redis fail hoặc key đang tắt nha!");

            return Ok("Đồng bộ lên Redis ngon ơ!");
        }
    }
}