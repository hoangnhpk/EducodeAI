namespace educodeai_server.Services.Interface
{
    public interface IRedisService
    {
        Task LuuGiaTriAsync(string key, string giaTri, TimeSpan? expiry = null);
        Task<string?> LayGiaTriAsync(string key);
        Task XoaKeyAsync(string key);

        Task LuuHashAsync(string key, string thuocTinh, string giaTri);
        Task<string> LayHashAsync(string key, string thuocTinh);
        Task<long> TangGiaTriHashAsync(string key, string thuocTinh, long mucTang = 1);
        Task DayVaoCuoiListAsync(string key, string giaTri);
        Task<IEnumerable<string>> LayTuDauListAsync(string key, int soLuong);
        IEnumerable<string> LayDanhSachKeyTheoPattern(string pattern);

        // Course Cache Versioning
        Task<long> LayVersionKhoaHocAsync(int maKhoaHoc);
        Task TangVersionKhoaHocAsync(int maKhoaHoc);

        // Lua Scripting for Rate Limit Atomic Operations
        Task<dynamic> ThucThiLuaScriptAsync(string script, string[] keys, string[] args);
    }
}
