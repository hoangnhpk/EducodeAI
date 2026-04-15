namespace educodeai_server.DTOs
{
    // Playlist Information
    public class YouTubePlaylistInfoDTO
    {
        public string PlaylistId { get; set; } = "";
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string ChannelTitle { get; set; } = "";
        public DateTime PublishedAt { get; set; }
        public string ThumbnailUrl { get; set; } = "";
        public int VideoCount { get; set; }
    }

    // Video Information
    public class YouTubeVideoDTO
    {
        public string VideoId { get; set; } = "";
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public DateTime PublishedAt { get; set; }
        public string ThumbnailUrl { get; set; } = "";
        public int Duration { get; set; } // Duration in seconds
        public int Position { get; set; } // Position in playlist
    }

    // Request/Response DTOs
    public class YouTubePlaylistAnalyzeRequestDTO
    {
        public string PlaylistUrl { get; set; } = "";
    }

    public class YouTubePlaylistAnalyzeResponseDTO
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public YouTubePlaylistInfoDTO? PlaylistInfo { get; set; }
    }

    public class YouTubePlaylistVideosResponseDTO
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public List<YouTubeVideoDTO> Videos { get; set; } = new();
    }

    public class YouTubePlaylistImportRequestDTO
    {
        public string PlaylistId { get; set; } = "";
        public int MaChuong { get; set; }
        public List<string> SelectedVideoIds { get; set; } = new();
    }

    public class YouTubePlaylistImportResponseDTO
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public int ImportedCount { get; set; }
        public List<BaiHocVideoDetailDTO> ImportedLessons { get; set; } = new();
    }

    public class YouTubeVideoInfoRequestDTO
    {
        public string VideoUrl { get; set; } = "";
    }

    public class YouTubeVideoInfoResponseDTO
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public YouTubeVideoDTO? VideoInfo { get; set; }
    }
}
