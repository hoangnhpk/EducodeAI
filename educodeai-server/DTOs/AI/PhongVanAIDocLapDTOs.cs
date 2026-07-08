using educodeai_server.Models;

namespace educodeai_server.DTOs.AI
{
    public class StartPhongVanRequestDto
    {
        public string ViTriUngTuyen { get; set; } = string.Empty;
        public string CapDo { get; set; } = string.Empty;
        public TinhCachAI TinhCachAI { get; set; } = TinhCachAI.Normal;
        public int SoLuongCauHoi { get; set; } = 3;
    }

    public class StartPhongVanResponseDto
    {
        public int MaPhongVan { get; set; }
        public string CauHoiDauTien { get; set; } = string.Empty;
    }

    public class AnswerPhongVanRequestDto
    {
        public int MaPhongVan { get; set; }
        public string CauTraLoi { get; set; } = string.Empty;
    }

    public class AnswerPhongVanResponseDto
    {
        public bool IsFinished { get; set; }
        public string NhanXetCauTruoc { get; set; } = string.Empty;
        public string CauHoiTiepTheo { get; set; } = string.Empty;
    }

    public class EndPhongVanResponseDto
    {
        public int DiemSo { get; set; }
        public string DanhGiaChung { get; set; } = string.Empty;
        public List<PhongVanDocLapTurnDto> LichSuChat { get; set; } = new();
    }

    public class PhongVanDocLapTurnDto
    {
        public string Role { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}

