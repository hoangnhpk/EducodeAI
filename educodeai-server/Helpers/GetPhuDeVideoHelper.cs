using System;
using System.Threading.Tasks;
using YoutubeExplode;

namespace educodeai_server.Helpers
{
    public static class GetPhuDeVideoHelper
    {
        public static async Task<string> LayPhuDeYoutube(string videoId)
        {
            var youtube = new YoutubeClient();
            try
            {
                // 1. Lấy thông tin các bản phụ đề có sẵn
                var manifest = await youtube.Videos.ClosedCaptions.GetManifestAsync(videoId);

                // 2. Ưu tiên lấy tiếng Việt (vi), nếu không có thì lấy tiếng Anh (en)
                // Thay vì TryGetTrack (bị xóa ở bản mới), ta dùng LINQ FirstOrDefault
                var trackInfo = manifest.Tracks.FirstOrDefault(t => t.Language.Code.StartsWith("vi"))
                             ?? manifest.Tracks.FirstOrDefault(t => t.Language.Code.StartsWith("en"));

                if (trackInfo != null)
                {
                    var track = await youtube.Videos.ClosedCaptions.GetAsync(trackInfo);
                    // Gộp tất cả các dòng phụ đề thành một đoạn văn bản
                    var text = string.Join(" ", track.Captions.Select(c => c.Text));
                    return text;
                }

                // Trả về chuỗi rỗng thay vì câu báo lỗi để API biết đường xử lý kịch bản dự phòng
                return string.Empty;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi lấy phụ đề: {ex.Message}");
                // Nếu video không tồn tại hoặc lỗi mạng, trả về rỗng để AI tự tóm tắt theo Tiêu đề
                return string.Empty;
            }
        }
    }
}