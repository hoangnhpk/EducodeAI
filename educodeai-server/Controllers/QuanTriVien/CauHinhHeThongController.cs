using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using educodeai_server.Data;
using educodeai_server.Models;
using educodeai_server.DTOs.QuanTriVien;
using Microsoft.AspNetCore.SignalR; // 1. Thêm cái này
using educodeai_server.Hubs;      // 2. Thêm cái này

namespace educodeai_server.Controllers.QuanTriVien
{
    [ApiController]
    [Route("api/quan-tri/cau-hinh")]
    // [Authorize(Roles = "Quản trị viên")] 
    public class CauHinhHeThongController : ControllerBase
    {
        private readonly EduCodeAIDbContext _context;
        private readonly IHubContext<SystemConfigHub> _hubContext; // 3. Khai báo Hub

        public CauHinhHeThongController(EduCodeAIDbContext context, IHubContext<SystemConfigHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext; // 4. Inject Hub vào
        }

        [HttpGet("lay-cau-hinh")]
        public async Task<IActionResult> GetCauHinh()
        {
            try
            {
                var configs = await _context.CauHinhs.ToListAsync();
                var dict = new Dictionary<string, string>();

                foreach (var item in configs)
                {
                    dict[item.MaKhoa] = item.GiaTri ?? "";
                }

                return Ok(new { success = true, data = dict });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        // API cho Frontend quét liên tục xem có đang bảo trì không
        [HttpGet("check-bao-tri")]
        [AllowAnonymous]
        public IActionResult CheckBaoTri()
        {
            return Ok(new { isMaintenance = Helpers.MaintenanceMiddleware.IsUnderMaintenance });
        }

        // API CÔNG TẮC: Chỗ này sếp gắn vào nút Bật/Tắt bảo trì ở giao diện Admin
        [HttpPost("toggle-bao-tri")]
        // [Authorize] -> (Nhớ phân quyền Admin chỗ này nhé)
        public IActionResult ToggleBaoTri([FromBody] bool status)
        {
            Helpers.MaintenanceMiddleware.IsUnderMaintenance = status;
            string msg = status ? "CẢNH BÁO: Đã BẬT bảo trì hệ thống!" : "Thành công: Đã TẮT bảo trì, hệ thống hoạt động bình thường!";
            return Ok(new { success = true, message = msg, currentStatus = status });
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

                // 5. PHÁT TÍN HIỆU REALTIME: Hét cho tất cả trình duyệt đang mở cập nhật ngay
                await _hubContext.Clients.All.SendAsync("ReceiveConfigUpdate");

                return Ok(new { success = true, message = "Đã lưu cấu hình hệ thống thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi khi lưu", error = ex.Message });
            }
        }
    }
}
