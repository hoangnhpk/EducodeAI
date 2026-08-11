namespace educodeai_server.DTOs.AI
{
    public class YeuCauTomTatVideoDTO
    {
        public int MaBaiHoc { get; set; }
        public string PhuDeVideo { get; set; } = string.Empty;
        public string? SubtitleUrl { get; set; }
        public string VideoId { get; set; } = string.Empty;
        public string TieuDe { get; set; } = string.Empty;
    }
}
