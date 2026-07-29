using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace educodeai_server.Hubs
{
    /// <summary>
    /// Hub realtime cho auth/session (G.7). Tách riêng khỏi SystemConfigHub (maintenance/config).
    /// Connection bắt buộc đã xác thực JWT; join group theo claim đã verify, KHÔNG tin id/maPhien client gửi.
    /// Group: user:{userId} (mọi thiết bị của user) và session:{maPhien} (một phiên cụ thể).
    /// </summary>
    [Authorize]
    public class SessionHub : Hub
    {
        public static string UserGroup(int userId) => $"user:{userId}";
        public static string SessionGroup(int maPhien) => $"session:{maPhien}";

        public override async Task OnConnectedAsync()
        {
            var userIdClaim = Context.User?.FindFirst("id")?.Value
                           ?? Context.User?.FindFirst("MaNguoiDung")?.Value
                           ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdClaim, out var userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, UserGroup(userId));
            }

            var maPhienClaim = Context.User?.FindFirst("MaPhien")?.Value;
            if (int.TryParse(maPhienClaim, out var maPhien))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, SessionGroup(maPhien));
            }

            await base.OnConnectedAsync();
        }
    }
}
