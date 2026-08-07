using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using educodeai_server.Data;
using educodeai_server.Models;
using educodeai_server.DTOs.QuanTriVien;
using Microsoft.AspNetCore.SignalR; // 1. Thêm cái này
using educodeai_server.Hubs;      // 2. Thêm cái này
using educodeai_server.Services.Interface;
using System.Text.Json;

namespace educodeai_server.Controllers.QuanTriVien
{
    [ApiController]
    [Route("api/quan-tri/cau-hinh")]
    [Authorize(Roles = "Admin")]
    public class CauHinhHeThongController : ControllerBase
    {
        private readonly EduCodeAIDbContext _context;
        private readonly IHubContext<SystemConfigHub> _hubContext; // 3. Khai báo Hub
        private readonly IRedisService _redisService;
        private readonly ILogger<CauHinhHeThongController> _logger;
        private readonly IWebHostEnvironment _env;

        public CauHinhHeThongController(
            EduCodeAIDbContext context, 
            IHubContext<SystemConfigHub> hubContext,
            IRedisService redisService,
            ILogger<CauHinhHeThongController> logger,
            IWebHostEnvironment env)
        {
            _context = context;
            _hubContext = hubContext; // 4. Inject Hub vào
            _redisService = redisService;
            _logger = logger;
            _env = env;
        }

        [HttpGet("lay-cau-hinh")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCauHinh()
        {
            try
            {
                var cacheKey = "SystemConfig:All";
                var cachedData = await _redisService.LayGiaTriAsync(cacheKey);

                if (!string.IsNullOrEmpty(cachedData))
                {
                    try
                    {
                        var cachedDict = JsonSerializer.Deserialize<Dictionary<string, string>>(cachedData);
                        if (cachedDict != null)
                        {
                            _logger.LogDebug("[CACHE HIT] GetCauHinh - Cấu hình hệ thống lấy từ Redis.");
                            return Ok(new { success = true, data = cachedDict });
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "[CACHE ERROR] Lỗi parse JSON SystemConfig:All. Fallback sang DB.");
                    }
                }

                _logger.LogDebug("[CACHE MISS] GetCauHinh - Truy vấn DB...");
                var configs = await _context.CauHinhs.ToListAsync();
                var dict = new Dictionary<string, string>();

                foreach (var item in configs)
                {
                    dict[item.MaKhoa] = item.GiaTri ?? "";
                }

                await _redisService.LuuGiaTriAsync(cacheKey, JsonSerializer.Serialize(dict), TimeSpan.FromDays(30));

                return Ok(new { success = true, data = dict });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy cấu hình hệ thống.");
                return StatusCode(500, new { success = false, message = "Không thể lấy cấu hình hệ thống. Vui lòng thử lại sau." });
            }
        }
        // API cho Frontend quét liên tục xem có đang bảo trì không
        [HttpGet("check-bao-tri")]
        [AllowAnonymous]
        public IActionResult CheckBaoTri()
        {
            return Ok(new { isMaintenance = Helpers.MaintenanceMiddleware.IsUnderMaintenance });
        }

        // API CÔNG TẮC bật/tắt bảo trì — chỉ Admin (kế thừa [Authorize(Roles="Admin")] cấp controller).
        [HttpPost("toggle-bao-tri")]
        public IActionResult ToggleBaoTri([FromBody] bool status)
        {
            Helpers.MaintenanceMiddleware.IsUnderMaintenance = status;
            string msg = status ? "CẢNH BÁO: Đã BẬT bảo trì hệ thống!" : "Thành công: Đã TẮT bảo trì, hệ thống hoạt động bình thường!";
            return Ok(new { success = true, message = msg, currentStatus = status });
        }

        [HttpPost("upload-banner")]
        public async Task<IActionResult> UploadBanner(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "Vui lòng chọn một file hợp lệ." });

            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "system");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            var url = $"/uploads/system/{uniqueFileName}";
            return Ok(new { success = true, url = url });
        }

        [HttpPost("cap-nhat")]
        public async Task<IActionResult> UpdateCauHinh([FromBody] List<CauHinhUpdateDto> newConfigs)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, message = "Dữ liệu cấu hình không hợp lệ" });
            }

            try
            {
                foreach (var config in newConfigs)
                {
                    var existing = await _context.CauHinhs.FirstOrDefaultAsync(x => x.MaKhoa == config.MaKhoa);

                    if (existing != null)
                    {
                        existing.GiaTri = config.GiaTri;
                        existing.NgayCapNhat = DateTime.UtcNow;
                    }
                    else
                    {
                        _context.CauHinhs.Add(new CauHinhHeThongModel
                        {
                            MaKhoa = config.MaKhoa,
                            GiaTri = config.GiaTri,
                            NgayCapNhat = DateTime.UtcNow
                        });
                    }
                }

                await _context.SaveChangesAsync();

                // 5. XÓA CACHE TRƯỚC KHI PHÁT SIGNALR
                await _redisService.XoaKeyAsync("SystemConfig:All");
                _logger.LogInformation("[CACHE INVALIDATE] Đã xóa cache cấu hình hệ thống (SystemConfig:All).");

                // 6. PHÁT TÍN HIỆU REALTIME
                await _hubContext.Clients.All.SendAsync("ReceiveConfigUpdate");

                return Ok(new { success = true, message = "Đã lưu cấu hình hệ thống thành công!" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu cấu hình hệ thống.");
                return StatusCode(500, new { success = false, message = "Không thể lưu cấu hình hệ thống. Vui lòng thử lại sau." });
            }
        }
    }
}
