using educodeai_server.DTOs;
using educodeai_server.Services.Interface;
using System.Text.RegularExpressions;
using System.Web;

namespace educodeai_server.Services.Implementation
{
    public class YouTubeService : IYouTubeService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly int _dailyQuotaLimit;
        private static int _dailyUsage = 0;
        private static DateTime _lastReset = DateTime.UtcNow.Date;
        private static readonly SemaphoreSlim _semaphore = new(10, 10); // Max 10 concurrent requests

        public YouTubeService(IConfiguration configuration, HttpClient httpClient)
        {
            _httpClient = httpClient;
            _apiKey = configuration["YouTube:ApiKey"] ?? throw new InvalidOperationException("YouTube API Key not configured");
            _dailyQuotaLimit = configuration.GetValue<int>("YouTube:DailyQuotaLimit", 10000);
        }

        public async Task<YouTubePlaylistInfoDTO?> GetPlaylistInfoAsync(string playlistUrl)
        {
            if (!CheckQuota(1)) return null;
            
            var playlistId = ExtractPlaylistId(playlistUrl);
            if (string.IsNullOrEmpty(playlistId))
                return null;

            var url = $"https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id={playlistId}&key={_apiKey}";
            
            try
            {
                await _semaphore.WaitAsync();
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"YouTube API Error: {response.StatusCode} for playlist {playlistId}");
                    return null;
                }

                var json = await response.Content.ReadAsStringAsync();
                if (string.IsNullOrWhiteSpace(json))
                {
                    Console.WriteLine("YouTube API returned empty response");
                    return null;
                }

                using var document = System.Text.Json.JsonDocument.Parse(json);
                
                if (!document.RootElement.TryGetProperty("items", out var items) || items.GetArrayLength() == 0)
                {
                    Console.WriteLine($"No playlist found for ID: {playlistId}");
                    return null;
                }

                var item = items[0];
                if (!item.TryGetProperty("snippet", out var snippet))
                {
                    Console.WriteLine("Invalid playlist response: missing snippet");
                    return null;
                }

                var title = snippet.GetProperty("title").GetString() ?? "";
                var description = snippet.GetProperty("description").GetString() ?? "";
                var channelTitle = snippet.GetProperty("channelTitle").GetString() ?? "";
                var publishedAtStr = snippet.GetProperty("publishedAt").GetString();

                DateTime publishedAt;
                if (!DateTime.TryParse(publishedAtStr, out publishedAt))
                {
                    Console.WriteLine($"Invalid published date: {publishedAtStr}");
                    publishedAt = DateTime.UtcNow;
                }

                var thumbnailUrl = GetBestThumbnail(snippet.GetProperty("thumbnails"));
                
                int videoCount = 0;
                if (item.TryGetProperty("contentDetails", out var contentDetails))
                {
                    videoCount = contentDetails.GetProperty("itemCount").GetInt32();
                }

                return new YouTubePlaylistInfoDTO
                {
                    PlaylistId = playlistId,
                    Title = title,
                    Description = description,
                    ChannelTitle = channelTitle,
                    PublishedAt = publishedAt,
                    ThumbnailUrl = thumbnailUrl,
                    VideoCount = videoCount
                };
            }
            catch (System.Text.Json.JsonException ex)
            {
                Console.WriteLine($"JSON parsing error for playlist {playlistId}: {ex.Message}");
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error getting playlist {playlistId}: {ex.Message}");
                return null;
            }
            finally
            {
                _semaphore.Release();
            }
        }

        public async Task<List<YouTubeVideoDTO>> GetPlaylistVideosAsync(string playlistId)
        {
            if (!CheckQuota(1)) return new List<YouTubeVideoDTO>();
            
            var videos = new List<YouTubeVideoDTO>();
            var nextPageToken = "";

            do
            {
                var url = $"https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId={playlistId}&maxResults=50&key={_apiKey}";
                
                if (!string.IsNullOrEmpty(nextPageToken))
                    url += $"&pageToken={nextPageToken}";

                try
                {
                    await _semaphore.WaitAsync();
                    var response = await _httpClient.GetAsync(url);
                    if (!response.IsSuccessStatusCode)
                        break;

                    var json = await response.Content.ReadAsStringAsync();
                    using var document = System.Text.Json.JsonDocument.Parse(json);

                    if (document.RootElement.TryGetProperty("items", out var items))
                    {
                        foreach (var item in items.EnumerateArray())
                        {
                            try {
                                var snippet = item.GetProperty("snippet");
                                
                                // YouTube playlistItems returns title as "Deleted video" or "Private video" and omits thumbnails if unavailable
                                var title = snippet.TryGetProperty("title", out var titleProp) ? titleProp.GetString() ?? "" : "";
                                if (title == "Private video" || title == "Deleted video") continue;

                                var description = snippet.TryGetProperty("description", out var descProp) ? descProp.GetString() ?? "" : "";
                                var videoId = snippet.GetProperty("resourceId").TryGetProperty("videoId", out var vidProp) ? vidProp.GetString() ?? "" : "";
                                
                                var publishedAtStr = snippet.TryGetProperty("publishedAt", out var pubProp) ? pubProp.GetString() ?? "" : "";
                                var publishedAt = DateTime.TryParse(publishedAtStr, out var d) ? d : DateTime.UtcNow;

                                var thumbnailUrl = snippet.TryGetProperty("thumbnails", out var thumbProp) ? GetBestThumbnail(thumbProp) : "";
                                var position = snippet.TryGetProperty("position", out var posProp) ? (int)posProp.GetInt64() : 0;

                                var video = new YouTubeVideoDTO
                                {
                                    VideoId = videoId,
                                    Title = title,
                                    Description = description,
                                    PublishedAt = publishedAt,
                                    ThumbnailUrl = thumbnailUrl,
                                    Position = position,
                                    Duration = 0 // duration is not available in playlistItems
                                };

                                if (!string.IsNullOrEmpty(video.VideoId)) {
                                    videos.Add(video);
                                }
                            }
                            catch {
                                // Skip this malformed or deleted video without crashing the entire page
                                continue;
                            }
                        }
                    }

                    if (document.RootElement.TryGetProperty("nextPageToken", out var nextPageTokenElement))
                        nextPageToken = nextPageTokenElement.GetString() ?? "";
                    else
                        nextPageToken = "";
                }
                catch
                {
                    break;
                }
                finally
                {
                    _semaphore.Release();
                }
            } while (!string.IsNullOrEmpty(nextPageToken));

            // playlistItems không trả contentDetails.duration; lấy duration thật theo batch.
            foreach (var batch in videos.Select(v => v.VideoId).Distinct().Chunk(50))
            {
                if (!CheckQuota(1)) break;

                var ids = string.Join(",", batch);
                var durationUrl = $"https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id={ids}&key={_apiKey}";
                try
                {
                    await _semaphore.WaitAsync();
                    var durationResponse = await _httpClient.GetAsync(durationUrl);
                    if (!durationResponse.IsSuccessStatusCode) continue;

                    var durationJson = await durationResponse.Content.ReadAsStringAsync();
                    using var durationDocument = System.Text.Json.JsonDocument.Parse(durationJson);
                    if (!durationDocument.RootElement.TryGetProperty("items", out var durationItems)) continue;

                    var durations = durationItems.EnumerateArray()
                        .Where(item => item.TryGetProperty("id", out _))
                        .ToDictionary(
                            item => item.GetProperty("id").GetString() ?? "",
                            item => item.TryGetProperty("contentDetails", out var details) &&
                                    details.TryGetProperty("duration", out var value)
                                ? ParseDuration(value.GetString() ?? "")
                                : 0);

                    foreach (var video in videos)
                    {
                        if (durations.TryGetValue(video.VideoId, out var duration))
                            video.Duration = duration;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"YouTube duration lookup failed: {ex.Message}");
                }
                finally
                {
                    _semaphore.Release();
                }
            }

            return videos.OrderBy(v => v.Position).ToList();
        }

        public async Task<YouTubeVideoDTO?> GetVideoInfoAsync(string videoId)
        {
            if (!CheckQuota(1)) return null;
            
            var url = $"https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id={videoId}&key={_apiKey}";
            
            try
            {
                await _semaphore.WaitAsync();
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    return null;

                var json = await response.Content.ReadAsStringAsync();
                using var document = System.Text.Json.JsonDocument.Parse(json);
                
                if (document.RootElement.GetProperty("items").GetArrayLength() == 0)
                    return null;

                var item = document.RootElement.GetProperty("items")[0];
                var snippet = item.GetProperty("snippet");
                var contentDetails = item.GetProperty("contentDetails");

                var title = snippet.TryGetProperty("title", out var titleProp) ? titleProp.GetString() ?? "" : "";
                var description = snippet.TryGetProperty("description", out var descProp) ? descProp.GetString() ?? "" : "";
                
                var publishedAtStr = snippet.TryGetProperty("publishedAt", out var pubProp) ? pubProp.GetString() ?? "" : "";
                var publishedAt = DateTime.TryParse(publishedAtStr, out var d) ? d : DateTime.UtcNow;

                var thumbnailUrl = snippet.TryGetProperty("thumbnails", out var thumbProp) ? GetBestThumbnail(thumbProp) : "";
                
                var durationStr = contentDetails.TryGetProperty("duration", out var durProp) ? durProp.GetString() ?? "" : "";
                var duration = ParseDuration(durationStr);

                return new YouTubeVideoDTO
                {
                    VideoId = videoId,
                    Title = title,
                    Description = description,
                    PublishedAt = publishedAt,
                    ThumbnailUrl = thumbnailUrl,
                    Duration = duration
                };
            }
            catch
            {
                return null;
            }
            finally
            {
                _semaphore.Release();
            }
        }

        public bool IsValidPlaylistUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return false;

            var patterns = new[]
            {
                @"^https?://(www\.)?youtube\.com/playlist\?list=[\w-]+",
                @"^https?://youtu\.be/[\w-]+\?list=[\w-]+",
                @"^https?://(www\.)?youtube\.com/watch\?list=[\w-]+"
            };

            return patterns.Any(pattern => Regex.IsMatch(url, pattern, RegexOptions.IgnoreCase));
        }

        public string ExtractPlaylistId(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return "";

            try
            {
                var uri = new Uri(url);
                var query = HttpUtility.ParseQueryString(uri.Query);
                return query["list"] ?? "";
            }
            catch
            {
                return "";
            }
        }

        public string ExtractVideoId(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return "";

            var patterns = new[]
            {
                @"[?&]v=([^&]+)",
                @"youtu\.be/([^?&]+)",
                @"embed/([^?&]+)",
                @"shorts/([^?&]+)"
            };

            foreach (var pattern in patterns)
            {
                var match = Regex.Match(url, pattern);
                if (match.Success)
                    return match.Groups[1].Value;
            }

            return "";
        }

        private static string GetBestThumbnail(System.Text.Json.JsonElement thumbnails)
        {
            // Try to get the highest quality thumbnail available
            var qualities = new[] { "maxres", "high", "medium", "default" };
            
            foreach (var quality in qualities)
            {
                if (thumbnails.TryGetProperty(quality, out var thumbnail))
                {
                    return thumbnail.GetProperty("url").GetString() ?? "";
                }
            }

            return "";
        }

        private static int ParseDuration(string isoDuration)
        {
            // Parse ISO 8601 duration format (PT4M13S -> 253 seconds)
            var match = Regex.Match(isoDuration, @"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?");
            
            if (!match.Success)
                return 0;

            var hours = match.Groups[1].Success ? int.Parse(match.Groups[1].Value) : 0;
            var minutes = match.Groups[2].Success ? int.Parse(match.Groups[2].Value) : 0;
            var seconds = match.Groups[3].Success ? int.Parse(match.Groups[3].Value) : 0;

            return hours * 3600 + minutes * 60 + seconds;
        }

        private bool CheckQuota(int units)
        {
            // Reset quota daily
            if (DateTime.UtcNow.Date > _lastReset)
            {
                _dailyUsage = 0;
                _lastReset = DateTime.UtcNow.Date;
            }

            // Check if we have enough quota
            if (_dailyUsage + units > _dailyQuotaLimit)
            {
                Console.WriteLine($"YouTube API quota exceeded: {_dailyUsage}/{_dailyQuotaLimit}");
                return false;
            }

            _dailyUsage += units;
            Console.WriteLine($"YouTube API usage: {_dailyUsage}/{_dailyQuotaLimit}");
            return true;
        }

        public int GetQuotaUsage()
        {
            return _dailyUsage;
        }

        public int GetQuotaLimit()
        {
            return _dailyQuotaLimit;
        }
    }
}
