namespace educodeai_server.Services.Interface
{
    /// <summary>
    /// Đẩy event realtime tới browser qua SignalR SessionHub (G.8).
    /// Chỉ gọi SAU khi đã commit DB + invalidate cache, không publish trước commit.
    /// </summary>
    public interface ISessionRealtimeNotifier
    {
        /// <summary>Một phiên cụ thể bị thu hồi (logout thiết bị/remote logout).</summary>
        Task SessionRevokedAsync(int maPhien);

        /// <summary>User bị khóa: mọi thiết bị phải đăng xuất.</summary>
        Task UserLockedAsync(int userId);

        /// <summary>Danh sách thiết bị/phiên của user thay đổi (để trang quản lý thiết bị refetch).</summary>
        Task SessionListChangedAsync(int userId);
    }
}
