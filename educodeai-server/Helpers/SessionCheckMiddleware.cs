using System.Security.Claims;
using educodeai_server.Data;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Helpers
{
    public class SessionCheckMiddleware
    {
        private readonly RequestDelegate _next;

        public SessionCheckMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, EduCodeAIDbContext dbContext)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                // Tìm claim MaPhien (kiểm tra cả tên tùy chỉnh và tên đầy đủ)
                var maPhienClaim = context.User.FindFirst("MaPhien")?.Value;
                
                if (!string.IsNullOrEmpty(maPhienClaim) && int.TryParse(maPhienClaim, out int maPhien))
                {
                    // Kiểm tra xem phiên này còn hoạt động trong DB không
                    var phien = await dbContext.PhienDangNhaps
                        .AsNoTracking()
                        .FirstOrDefaultAsync(p => p.MaPhien == maPhien);

                    if (phien == null || !phien.DangHoatDong)
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
