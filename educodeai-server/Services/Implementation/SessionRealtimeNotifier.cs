using educodeai_server.Hubs;
using educodeai_server.Services.Interface;
using Microsoft.AspNetCore.SignalR;

namespace educodeai_server.Services.Implementation
{
    /// <summary>
    /// Publish event tới SessionHub theo group user/session (G.8).
    /// Không nuốt lỗi âm thầm ở tầng cao: nếu SignalR lỗi, log lại — cache invalidation + middleware
    /// vẫn là lớp enforcement backend nên event mất không mở được quyền truy cập.
    /// </summary>
    public sealed class SessionRealtimeNotifier : ISessionRealtimeNotifier
    {
        private readonly IHubContext<SessionHub> _hub;
        private readonly ILogger<SessionRealtimeNotifier> _logger;

        public SessionRealtimeNotifier(IHubContext<SessionHub> hub, ILogger<SessionRealtimeNotifier> logger)
        {
            _hub = hub;
            _logger = logger;
        }

        public async Task SessionRevokedAsync(int maPhien)
        {
            try
            {
                await _hub.Clients.Group(SessionHub.SessionGroup(maPhien)).SendAsync("SessionRevoked", new { maPhien });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Không publish được SessionRevoked cho phiên {MaPhien}.", maPhien);
            }
        }

        public async Task UserLockedAsync(int userId)
        {
            try
            {
                await _hub.Clients.Group(SessionHub.UserGroup(userId)).SendAsync("UserLocked", new { userId });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Không publish được UserLocked cho user {UserId}.", userId);
            }
        }

        public async Task SessionListChangedAsync(int userId)
        {
            try
            {
                await _hub.Clients.Group(SessionHub.UserGroup(userId)).SendAsync("SessionListChanged", new { userId });
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Không publish được SessionListChanged cho user {UserId}.", userId);
            }
        }
    }
}
