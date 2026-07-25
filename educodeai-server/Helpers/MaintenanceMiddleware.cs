using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace educodeai_server.Helpers
{
    public class MaintenanceMiddleware
    {
        private readonly RequestDelegate _next;
        public static bool IsUnderMaintenance = false;

        // Các đường dẫn bootstrap bắt buộc mở trong lúc bảo trì để Admin còn đăng nhập được
        // và frontend còn đọc được trạng thái bảo trì. Không mở toàn bộ /quan-tri như trước.
        private static readonly string[] BootstrapPaths =
        {
            "/api/xacthuc/dang-nhap",
            "/api/xacthuc/refresh-token",
            "/api/xacthuc/dang-xuat",
            "/api/quan-tri/cau-hinh/check-bao-tri",
            "/systemconfighub"
        };

        public MaintenanceMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // CORS preflight luôn phải đi qua: trình duyệt gửi trước khi kèm token/header.
            if (context.Request.Method.Equals("OPTIONS", System.StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }

            if (!IsUnderMaintenance)
            {
                await _next(context);
                return;
            }

            var path = context.Request.Path.Value?.ToLowerInvariant();

            // Bypass do server quyết định, không tin header/route từ client (J.2/J.4).
            // Khớp tuyệt đối HOẶC theo ranh giới segment (allowed + "/") để cho phép sub-path hợp lệ
            // của SignalR hub (vd /systemconfighub/negotiate) mà vẫn chặn hậu tố giả như .../dang-nhap-xyz.
            bool isBootstrapPath = path != null && System.Array.Exists(
                BootstrapPaths,
                allowed => path == allowed || path.StartsWith(allowed + "/", System.StringComparison.Ordinal));

            // Chỉ Admin đã xác thực (JWT đã validate ở UseAuthentication phía trước) mới được bypass.
            bool isAuthenticatedAdmin =
                context.User.Identity?.IsAuthenticated == true &&
                context.User.IsInRole("Admin");

            if (isBootstrapPath || isAuthenticatedAdmin)
            {
                await _next(context);
                return;
            }

            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                message = "Hệ thống đang bảo trì để nâng cấp!",
                error = new { code = "MAINTENANCE_MODE", message = "Hệ thống đang bảo trì để nâng cấp!" }
            });
        }
    }
}
