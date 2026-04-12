using System.Collections.Generic;

namespace educodeai_server.DTOs.VideoAI
{
    public class VideoAnalysisResultDTO
    {
        public List<VideoChapterDTO> Chapters { get; set; } = new List<VideoChapterDTO>();
    }

    public class VideoChapterDTO
    {
        public int ThoiGianBatDau { get; set; } // Giây
        public int ThoiGianKetThuc { get; set; } // Giây
        public string KienThucChinh { get; set; } = null!;
        public bool BatBuoc { get; set; } = false;
        public List<VideoQuizDTO> Quizzes { get; set; } = new List<VideoQuizDTO>();
    }

    public class VideoQuizDTO
    {
        public string CauHoi { get; set; } = null!;
        public string DapAnA { get; set; } = null!;
        public string DapAnB { get; set; } = null!;
        public string? DapAnC { get; set; }
        public string? DapAnD { get; set; }
        public string DapAnDung { get; set; } = null!;
    }
}
