namespace educodeai_server.Services.Interface
{
    /// <summary>
    /// Cache trạng thái user/session cho hot-path middleware (G.1).
    /// Trả về null nghĩa là cache miss — caller phải truy DB rồi populate lại.
    /// Chạy trên IDistributedCache nên đồng bộ đa instance khi có Redis; dev fallback memory.
    /// </summary>
    public interface ISessionStateCache
    {
        Task<string?> GetUserStatusAsync(int userId);
        Task SetUserStatusAsync(int userId, string status);
        Task InvalidateUserStatusAsync(int userId);

        Task<bool?> GetSessionActiveAsync(int maPhien);
        Task SetSessionActiveAsync(int maPhien, bool active);
        Task InvalidateSessionAsync(int maPhien);
    }
}
