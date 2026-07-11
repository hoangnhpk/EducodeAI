using System.Text.Json;
using educodeai_server.Config;
using educodeai_server.Services.Interface;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;

namespace educodeai_server.Services.Implementation
{
    public class CurrencyExchangeService : ICurrencyExchangeService
    {
        private readonly HttpClient _httpClient;
        private readonly IDistributedCache _cache;
        private readonly CurrencyExchangeConfig _config;
        private readonly ILogger<CurrencyExchangeService> _logger;
        private const string CACHE_KEY = "exchange_rate_usd_vnd";

        public CurrencyExchangeService(
            HttpClient httpClient,
            IDistributedCache cache,
            IOptions<CurrencyExchangeConfig> config,
            ILogger<CurrencyExchangeService> logger)
        {
            _httpClient = httpClient;
            _cache = cache;
            _config = config.Value;
            _logger = logger;
        }

        public async Task<decimal> GetUsdToVndRateAsync()
        {
            try
            {
                var cachedRate = await _cache.GetStringAsync(CACHE_KEY);
                if (!string.IsNullOrEmpty(cachedRate) && decimal.TryParse(cachedRate, out var rate))
                {
                    _logger.LogInformation("Using cached exchange rate: 1 USD = {Rate} VND", rate);
                    return rate;
                }

                var response = await _httpClient.GetStringAsync(_config.ApiUrl);
                var data = JsonSerializer.Deserialize<ExchangeRateResponse>(response);

                if (data?.Rates?.ContainsKey("VND") == true)
                {
                    var vndRate = data.Rates["VND"];

                    await _cache.SetStringAsync(
                        CACHE_KEY,
                        vndRate.ToString(),
                        new DistributedCacheEntryOptions
                        {
                            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(_config.CacheDurationHours)
                        });

                    _logger.LogInformation("Fetched new exchange rate from API: 1 USD = {Rate} VND", vndRate);
                    return vndRate;
                }

                throw new Exception("VND rate not found in API response");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to get exchange rate from API. Using default rate: {Rate}", _config.DefaultVndToUsdRate);
                return _config.DefaultVndToUsdRate;
            }
        }

        public async Task<decimal> ConvertVndToUsdAsync(decimal amountVnd)
        {
            var rate = await GetUsdToVndRateAsync();
            return amountVnd / rate;
        }

        public async Task<decimal> ConvertUsdToVndAsync(decimal amountUsd)
        {
            var rate = await GetUsdToVndRateAsync();
            return amountUsd * rate;
        }

        private class ExchangeRateResponse
        {
            public Dictionary<string, decimal>? Rates { get; set; }
        }
    }
}
