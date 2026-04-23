using System.Security.Claims;
using educodeai_server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace educodeai_server.Helpers
{
    public class SessionCheckMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IMemoryCache _cache;

        public SessionCheckMiddleware(RequestDelegate next, IMemoryCache cache)
        {
            _next = next;
            _cache = cache;
        }

        public async Task InvokeAsync(HttpContext context, EduCodeAIDbContext dbContext)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                // 1. Lấy ID của user đang đăng nhập
                var userIdClaim = context.User.FindFirst("id")?.Value 
                              ?? context.User.FindFirst("MaNguoiDung")?.Value
                              ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
                {
                    // 2. Kiểm tra trạng thái user — cache 60s để tránh query DB liên tục
                    var userCacheKey = $"user_status_{userId}";
                    if (!_cache.TryGetValue(userCacheKey, out string? userStatus))
                    {
                        try
                        {
                            var user = await dbContext.NguoiDungs
                                .AsNoTracking()
                                .Select(u => new { u.MaNguoiDung, u.TrangThai, u.LyDoKhoa })
                                .FirstOrDefaultAsync(u => u.MaNguoiDung == userId);

                            userStatus = user?.TrangThai ?? "Hoạt động";
                            _cache.Set(userCacheKey, userStatus, TimeSpan.FromSeconds(60));
                        }
                        catch (Exception ex) when (
                            ex is System.Net.Sockets.SocketException ||
                            ex is Microsoft.EntityFrameworkCore.DbUpdateException ||
                            ex.InnerException is System.Net.Sockets.SocketException)
                        {
                            // Lỗi mất kết nối tạm thời → bỏ qua kiểm tra, cho request đi tiếp
                            // tránh việc lỗi DB làm sập toàn bộ request pipeline
                            userStatus = "Hoạt động";
                        }
                    }

                    if (string.Equals(userStatus, "Bị khóa", StringComparison.OrdinalIgnoreCase)
                        || string.Equals(userStatus, "Khóa vĩnh viễn", StringComparison.OrdinalIgnoreCase))
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsJsonAsync(new
                        {
                            status = 401,
                            isBanned = true,
                            message = "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên."
                        });
                        return;
                    }
                }

                // 3. Kiểm tra session (phiên đăng nhập)
                var maPhienClaim = context.User.FindFirst("MaPhien")?.Value;

                if (!string.IsNullOrEmpty(maPhienClaim) && int.TryParse(maPhienClaim, out int maPhien))
                {
                    var cacheKey = $"session_{maPhien}";

                    if (!_cache.TryGetValue(cacheKey, out bool isActive))
                    {
                        try
                        {
                            var phien = await dbContext.PhienDangNhaps
                                .AsNoTracking()
                                .FirstOrDefaultAsync(p => p.MaPhien == maPhien);

                            isActive = phien != null && phien.DangHoatDong;
                            _cache.Set(cacheKey, isActive, TimeSpan.FromSeconds(60));
                        }
                        catch (Exception ex) when (
                            ex is System.Net.Sockets.SocketException ||
                            ex is Microsoft.EntityFrameworkCore.DbUpdateException ||
                            ex.InnerException is System.Net.Sockets.SocketException)
                        {
                            // Lỗi mất kết nối tạm thời → coi session còn hiệu lực, cho đi tiếp
                            isActive = true;
                        }
                    }

                    if (!isActive)
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsJsonAsync(new {
                            status = 401,
                            message = "Phiên làm việc đã bị vô hiệu hóa từ thiết bị khác. Vui lòng đăng nhập lại."
                        });
                        return;
                    }
                }
            }

            await _next(context);
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
