using educodeai_server.Services.Interface;

namespace educodeai_server.Services.Implementation
{
    public sealed class LoTrinhAIQuotaService : ILoTrinhAIQuotaService
    {
        private readonly IRedisService _redis;
        private readonly IConfiguration _configuration;

        public LoTrinhAIQuotaService(IRedisService redis, IConfiguration configuration)
        {
            _redis = redis;
            _configuration = configuration;
        }

        public async Task<AIQuotaResult> TryConsumeAsync(int maNguoiDung, string action)
        {
            var limit = _configuration.GetValue<int?>("AI:Roadmap:DailyLimit") ?? 5;
            var now = DateTime.UtcNow;
            var reset = now.Date.AddDays(1);
            var key = $"EduCodeAI:RoadmapQuota:{maNguoiDung}:{now:yyyyMMdd}";
            var used = await _redis.TangGiaTriHashAsync(key, action);
            await _redis.LuuGiaTriAsync($"{key}:marker", "1", reset - now);
            if (used > limit)
            {
                await _redis.TangGiaTriHashAsync(key, action, -1);
                return new AIQuotaResult(false, limit, used - 1, reset);
            }
            return new AIQuotaResult(true, limit, used, reset);
        }
    }
}