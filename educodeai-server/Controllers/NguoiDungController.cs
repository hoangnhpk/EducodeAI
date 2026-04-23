using Microsoft.AspNetCore.Mvc;
using educodeai_server.Services.Interface;
using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using educodeai_server.Data;
using educodeai_server.Models;
using EduCodeAI.DTOs;

namespace educodeai_server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NguoiDungController : ControllerBase
    {
        private readonly INguoiDungService _userService;
        private readonly EduCodeAIDbContext _context;

        public NguoiDungController(INguoiDungService userService, EduCodeAIDbContext context)
        {
            _userService = userService;
            _context = context;
        }

        [HttpGet("check-email")]
        public async Task<IActionResult> CheckEmail([FromQuery] string email)
        {
            try
            {
                var userExists = await _userService.IsEmailExistAsync(email);
                return Ok(new { exists = userExists });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi kiểm tra email: " + ex.Message });
            }
        }

        /// <summary>
        /// API kiểm tra trạng thái tài khoản để đá người dùng ra nếu bị khóa (Real-time check)
        /// </summary>
        [HttpGet("/api/auth/check-trang-thai")] 
        [Authorize]
        public async Task<IActionResult> CheckTrangThaiTaiKhoan()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("id");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized();

            try
            {
                var user = await _context.NguoiDungs.FindAsync(userId);
                if (user == null) return Unauthorized();

                if (user.TrangThai == "Bị khóa" || user.TrangThai == "Khóa vĩnh viễn")
                {
                    return Ok(new { isBanned = true, reason = user.LyDoKhoa ?? "Vi phạm quy định hệ thống." });
                }

                return Ok(new { isBanned = false });
            }
            catch (Exception ex) when (
                ex is System.Net.Sockets.SocketException ||
                ex.InnerException is System.Net.Sockets.SocketException ||
                ex is Microsoft.EntityFrameworkCore.DbUpdateException)
            {
                // Lỗi kết nối DB tạm thời → trả về bình thường, không crash app
                return Ok(new { isBanned = false });
            }
        }
    }
}