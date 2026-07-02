using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace educodeai_server.Helpers // Hoặc namespace của sếp
{
    public class MaintenanceMiddleware
    {
        private readonly RequestDelegate _next;
        public static bool IsUnderMaintenance = false;

        public MaintenanceMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // 👉 Cho phép các request "Hỏi đường" (CORS Preflight) đi qua an toàn
            // Trình duyệt gửi cái này trước khi gửi token/header, nên phải cho qua 100%
            if (context.Request.Method.Equals("OPTIONS", System.StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }

            var path = context.Request.Path.Value?.ToLower();

            // 1. Kiểm tra "Thẻ Bài Miễn Tử" từ Axios gửi lên
            bool isBypass = context.Request.Headers.ContainsKey("X-Bypass-Maintenance");

            // 👉 2. ĐÃ THÊM: Các đường dẫn VIP luôn luôn được đi qua (Cứu cánh cho Admin)
            bool isVipRoute = path != null && (
                path.Contains("/check-bao-tri") ||
                path.Contains("/quan-tri") // Mở đường vĩnh viễn cho toàn bộ API của Admin
            );

            // 3. CHẶN NẾU: Đang bảo trì VÀ Không có thẻ bài VÀ Không phải VIP
            if (IsUnderMaintenance && !isBypass && !isVipRoute)
            {
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new { success = false, message = "Hệ thống đang bảo trì để nâng cấp!" });
                return;
            }

            await _next(context);
        }
    }
}
