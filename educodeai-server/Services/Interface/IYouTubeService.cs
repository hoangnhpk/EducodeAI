using educodeai_server.DTOs;

namespace educodeai_server.Services.Interface
{
    public interface IYouTubeService
    {
        Task<YouTubePlaylistInfoDTO?> GetPlaylistInfoAsync(string playlistUrl);
        Task<List<YouTubeVideoDTO>> GetPlaylistVideosAsync(string playlistId);
        Task<YouTubeVideoDTO?> GetVideoInfoAsync(string videoId);
        bool IsValidPlaylistUrl(string url);
        string ExtractPlaylistId(string url);
        string ExtractVideoId(string url);
        
        // Quota monitoring
        int GetQuotaUsage();
        int GetQuotaLimit();
    }
}
