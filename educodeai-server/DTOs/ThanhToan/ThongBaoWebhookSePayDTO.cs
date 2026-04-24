namespace educodeai_server.DTOs.ThanhToan
{
    public class ThongBaoWebhookSePayDTO
    {
        public long id { get; set; }
        public string gateway { get; set; } = string.Empty;
        public string transactionDate { get; set; } = string.Empty;
        public string accountNumber { get; set; } = string.Empty;
        public string content { get; set; } = string.Empty;
        public decimal transferAmount { get; set; }
        public string transferType { get; set; } = string.Empty;
    }
}
