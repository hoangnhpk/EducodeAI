namespace educodeai_server.DTOs.NapTienAI
{
    public class KetQuaNapTienAIDTO
    {
        public int MaGiaoDich { get; set; }
        public decimal SoTienVnd { get; set; }
        public decimal SoTienUsd { get; set; }
        public decimal TyGiaApDung { get; set; }
        public decimal SoDuAiBalanceUsdMoi { get; set; }
        public decimal SoDuVndKhaDungMoi { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
