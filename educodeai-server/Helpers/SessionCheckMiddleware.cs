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
