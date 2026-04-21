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
                // 1. Lấy ID của user đang đăng nhập (Kiểm tra nhiều loại claim)
                var userIdClaim = context.User.FindFirst("id")?.Value 
                              ?? context.User.FindFirst("MaNguoiDung")?.Value
                              ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out int userId))
                {
                    // 2. Tìm user trong DB để kiểm tra trạng thái khóa
                    var user = await dbContext.NguoiDungs
                        .AsNoTracking()
                        .FirstOrDefaultAsync(u => u.MaNguoiDung == userId);

                    if (user != null && (string.Equals(user.TrangThai, "Bị khóa", StringComparison.OrdinalIgnoreCase) 
                                     || string.Equals(user.TrangThai, "Khóa vĩnh viễn", StringComparison.OrdinalIgnoreCase)))
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        context.Response.ContentType = "application/json";
                        await context.Response.WriteAsJsonAsync(new
                        {
                            status = 401,
                            isBanned = true,
                            reason = user.LyDoKhoa ?? "Tài khoản của bạn đã bị khóa bởi quản trị viên.",
                            message = "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên."
                        });
                        return;
                    }
                }

                // 3. Tìm claim MaPhien (kiểm tra cả tên tùy chỉnh và tên đầy đủ)
                var maPhienClaim = context.User.FindFirst("MaPhien")?.Value;

                if (!string.IsNullOrEmpty(maPhienClaim) && int.TryParse(maPhienClaim, out int maPhien))
                {
                    var cacheKey = $"session_{maPhien}";

                    // Lấy từ cache trước — tránh query DB mỗi request
                    if (!_cache.TryGetValue(cacheKey, out bool isActive))
                    {
                        var phien = await dbContext.PhienDangNhaps
                            .AsNoTracking()
                            .FirstOrDefaultAsync(p => p.MaPhien == maPhien);

                        isActive = phien != null && phien.DangHoatDong;

                        // Cache 60 giây — giảm 60x số lần query DB
                        _cache.Set(cacheKey, isActive, TimeSpan.FromSeconds(60));
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
