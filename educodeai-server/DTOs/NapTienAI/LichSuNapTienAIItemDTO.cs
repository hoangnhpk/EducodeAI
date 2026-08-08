namespace educodeai_server.DTOs.NapTienAI
{
    public class LichSuNapTienAIItemDTO
    {
        public int MaGiaoDich { get; set; }
        public decimal SoTienVnd { get; set; }
        public decimal SoTienUsd { get; set; }
        public decimal TyGiaApDung { get; set; }
        public string TrangThai { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
}
