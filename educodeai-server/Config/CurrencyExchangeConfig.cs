namespace educodeai_server.Config
{
    public class CurrencyExchangeConfig
    {
        public string ApiUrl { get; set; } = "https://api.exchangerate-api.com/v4/latest/USD";
        public decimal DefaultVndToUsdRate { get; set; } = 25000;
        public int CacheDurationHours { get; set; } = 24;
    }
}
