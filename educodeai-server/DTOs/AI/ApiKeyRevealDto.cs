namespace educodeai_server.DTOs.AI
{
    public class ApiKeyRevealDto
    {
        public int Id { get; set; }
        public string MaKeyFull { get; set; } = string.Empty;
        public DateTime RevealedAt { get; set; }
    }
}
