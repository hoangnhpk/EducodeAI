namespace educodeai_server.Services.Interface
{
    public interface ICurrencyExchangeService
    {
        /// <summary>
        /// Lấy tỷ giá từ USD sang VND
        /// </summary>
        Task<decimal> GetUsdToVndRateAsync();

        /// <summary>
        /// Chuyển đổi từ VND sang USD
        /// </summary>
        Task<decimal> ConvertVndToUsdAsync(decimal amountVnd);

        /// <summary>
        /// Chuyển đổi từ USD sang VND
        /// </summary>
        Task<decimal> ConvertUsdToVndAsync(decimal amountUsd);
    }
}
