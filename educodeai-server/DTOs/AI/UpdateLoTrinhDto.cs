namespace educodeai_server.DTOs.AI
{
    public class UpdateLoTrinhDto
    {
        public int MaLoTrinh { get; set; }

        // Yêu cầu mới của user
        public string YeuCauMoi { get; set; } = null!;
    }
}
