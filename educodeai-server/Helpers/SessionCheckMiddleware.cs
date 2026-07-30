using System.Security.Claims;
using educodeai_server.Data;
using educodeai_server.DTOs.Common;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Helpers
{
    /// <summary>
    /// Kiểm tra trạng thái user (khóa/mở) và session (còn hiệu lực) cho request đã xác thực.
    /// Hot-path đọc <see cref="ISessionStateCache"/> trước; DB chỉ khi cache miss rồi populate lại.
    /// Không fail-open: nếu không xác minh được trạng thái cho endpoint bảo vệ thì trả 503 (G.2).
    /// </summary>
    public class SessionCheckMiddleware
    {
        private const string LockedStatus = "Bị khóa";
        private const string PermanentlyLockedStatus = "Khóa vĩnh viễn";

        private readonly RequestDelegate _next;
        private readonly ILogger<SessionCheckMiddleware> _logger;

        public SessionCheckMiddleware(RequestDelegate next, ILogger<SessionCheckMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, EduCodeAIDbContext dbContext, ISessionStateCache cache)
        {
            // Chưa xác thực → để pipeline authorization tự quyết (anonymous vẫn qua được).
            if (context.User.Identity?.IsAuthenticated != true)
            {
                await _next(context);
                return;
            }

            var userIdClaim = context.User.FindFirst("id")?.Value
                          ?? context.User.FindFirst("MaNguoiDung")?.Value
                          ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
            {
                string userStatus;
                try
                {
                    userStatus = await LayTrangThaiUserAsync(dbContext, cache, userId);
                }
                catch (Exception ex)
                {
                    // Không tự coi "Hoạt động" khi lỗi — fail closed cho endpoint bảo vệ.
                    _logger.LogError(ex, "Không xác minh được trạng thái user {UserId}; từ chối request.", userId);
                    await WriteAuthStateUnavailableAsync(context);
                    return;
                }

                if (string.Equals(userStatus, LockedStatus, StringComparison.OrdinalIgnoreCase)
                    || string.Equals(userStatus, PermanentlyLockedStatus, StringComparison.OrdinalIgnoreCase))
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsJsonAsync(new
                    {
                        status = 401,
                        isBanned = true,
                        message = "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.",
                        error = new { code = ApiErrorCodes.AuthenticationFailed, message = "Tài khoản đã bị khóa." }
                    });
                    return;
                }
            }

            var maPhienClaim = context.User.FindFirst("MaPhien")?.Value;
            if (!string.IsNullOrEmpty(maPhienClaim) && int.TryParse(maPhienClaim, out int maPhien))
            {
                bool isActive;
                try
                {
                    isActive = await LaySessionActiveAsync(dbContext, cache, maPhien);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Không xác minh được session {MaPhien}; từ chối request.", maPhien);
                    await WriteAuthStateUnavailableAsync(context);
                    return;
                }

                if (!isActive)
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    context.Response.ContentType = "application/json";
                    await context.Response.WriteAsJsonAsync(new
                    {
                        status = 401,
                        message = "Phiên làm việc đã bị vô hiệu hóa từ thiết bị khác. Vui lòng đăng nhập lại.",
                        error = new { code = ApiErrorCodes.AuthenticationFailed, message = "Phiên đã bị vô hiệu hóa." }
                    });
                    return;
                }
            }

            await _next(context);
        }

        private static async Task<string> LayTrangThaiUserAsync(
            EduCodeAIDbContext dbContext, ISessionStateCache cache, int userId)
        {
            var cached = await cache.GetUserStatusAsync(userId);
            if (cached != null) return cached;

            var user = await dbContext.NguoiDungs
                .AsNoTracking()
                .Select(u => new { u.MaNguoiDung, u.TrangThai })
                .FirstOrDefaultAsync(u => u.MaNguoiDung == userId);

            // User không tồn tại → coi như bị vô hiệu (không cấp quyền cho id lạ).
            var status = user?.TrangThai ?? PermanentlyLockedStatus;
            await cache.SetUserStatusAsync(userId, status);
            return status;
        }

        private static async Task<bool> LaySessionActiveAsync(
            EduCodeAIDbContext dbContext, ISessionStateCache cache, int maPhien)
        {
            var cached = await cache.GetSessionActiveAsync(maPhien);
            if (cached.HasValue) return cached.Value;

            var phien = await dbContext.PhienDangNhaps
                .AsNoTracking()
                .Select(p => new { p.MaPhien, p.DangHoatDong })
                .FirstOrDefaultAsync(p => p.MaPhien == maPhien);

            var isActive = phien != null && phien.DangHoatDong;
            await cache.SetSessionActiveAsync(maPhien, isActive);
            return isActive;
        }

        private static async Task WriteAuthStateUnavailableAsync(HttpContext context)
        {
            if (context.Response.HasStarted) return;
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                message = "Không thể xác minh trạng thái đăng nhập. Vui lòng thử lại.",
                error = new
                {
                    code = ApiErrorCodes.AuthStateUnavailable,
                    message = "Không thể xác minh trạng thái đăng nhập. Vui lòng thử lại."
                }
            });
        }
    }

    public static class SessionCheckMiddlewareExtensions
    {
        public static IApplicationBuilder UseSessionCheck(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<SessionCheckMiddleware>();
        }
    }
}
