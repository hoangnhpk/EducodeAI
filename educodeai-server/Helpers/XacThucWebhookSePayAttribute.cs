using System.Security.Cryptography;
using System.Text;
using educodeai_server.DTOs.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace educodeai_server.Helpers
{
    /// <summary>
    /// Xác thực webhook SePay bằng API Key khai báo ở tab <b>Bảo mật</b> của webhook trên my.sepay.vn.
    /// <para>
    /// Hai endpoint webhook buộc phải <c>[AllowAnonymous]</c> (SePay không gửi JWT của hệ thống),
    /// nên đây là lớp chặn duy nhất giữa Internet và luồng ghi nhận thanh toán.
    /// </para>
    /// <para>
    /// Mặc định <b>TẮT</b> (<c>SePayWebhook:BatBuocApiKey = false</c>) để deploy không làm gián đoạn
    /// thanh toán đang chạy. Quy trình bật: đặt key ở SePay → set biến môi trường
    /// <c>SEPAY_WEBHOOK_API_KEY</c> → đổi <c>SEPAY_WEBHOOK_REQUIRE_API_KEY=true</c> → restart backend.
    /// </para>
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public sealed class XacThucWebhookSePayAttribute : Attribute, IAsyncActionFilter
    {
        private const string KhoaCauHinhBatBuoc = "SePayWebhook:BatBuocApiKey";
        private const string KhoaCauHinhApiKey = "SePayWebhook:ApiKey";

        // SePay gửi key ở header Authorization kèm scheme "Apikey". Chấp nhận thêm vài biến thể
        // để không phụ thuộc vào cách viết hoa/thường hay thay đổi nhỏ phía nhà cung cấp.
        private static readonly string[] CacSchemeChoPhep = { "Apikey ", "ApiKey ", "Bearer " };

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var cauHinh = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();

            if (!cauHinh.GetValue(KhoaCauHinhBatBuoc, false))
            {
                await next();
                return;
            }

            var logger = context.HttpContext.RequestServices
                .GetRequiredService<ILoggerFactory>()
                .CreateLogger(nameof(XacThucWebhookSePayAttribute));

            var keyMongDoi = cauHinh[KhoaCauHinhApiKey];
            if (string.IsNullOrWhiteSpace(keyMongDoi))
            {
                // Fail-closed: đã bật kiểm tra mà thiếu key là lỗi cấu hình. Cho qua sẽ tạo cảm giác
                // an toàn giả; từ chối kèm log rõ ràng để phát hiện ngay khi deploy.
                logger.LogError(
                    "Đã bật {KhoaBatBuoc} nhưng {KhoaApiKey} rỗng; từ chối toàn bộ webhook SePay.",
                    KhoaCauHinhBatBuoc, KhoaCauHinhApiKey);
                context.Result = TaoKetQuaTuChoi("Webhook chưa được cấu hình API Key.");
                return;
            }

            var keyNhanDuoc = LayKeyTuRequest(context.HttpContext.Request);
            if (string.IsNullOrEmpty(keyNhanDuoc) || !SoSanhAnToan(keyNhanDuoc, keyMongDoi))
            {
                logger.LogWarning(
                    "Từ chối webhook SePay tới {Path}: API Key không hợp lệ (IP {DiaChiIp}).",
                    context.HttpContext.Request.Path,
                    context.HttpContext.Connection.RemoteIpAddress);
                context.Result = TaoKetQuaTuChoi("API Key không hợp lệ.");
                return;
            }

            await next();
        }

        private static string? LayKeyTuRequest(HttpRequest request)
        {
            var giaTri = request.Headers.Authorization.ToString();

            if (string.IsNullOrWhiteSpace(giaTri))
            {
                // Một số cấu hình gửi key ở header riêng thay vì Authorization.
                giaTri = request.Headers["X-Api-Key"].ToString();
            }

            if (string.IsNullOrWhiteSpace(giaTri)) return null;

            giaTri = giaTri.Trim();

            foreach (var scheme in CacSchemeChoPhep)
            {
                if (giaTri.StartsWith(scheme, StringComparison.OrdinalIgnoreCase))
                {
                    return giaTri[scheme.Length..].Trim();
                }
            }

            return giaTri;
        }

        /// <summary>So sánh thời gian cố định để không rò rỉ độ dài/nội dung key qua timing.</summary>
        private static bool SoSanhAnToan(string nhanDuoc, string mongDoi)
        {
            var byteNhanDuoc = Encoding.UTF8.GetBytes(nhanDuoc);
            var byteMongDoi = Encoding.UTF8.GetBytes(mongDoi);
            return CryptographicOperations.FixedTimeEquals(byteNhanDuoc, byteMongDoi);
        }

        private static UnauthorizedObjectResult TaoKetQuaTuChoi(string thongBao) =>
            new(new
            {
                success = false,
                message = thongBao,
                error = new { code = ApiErrorCodes.AuthenticationFailed, message = thongBao }
            });
    }
}
