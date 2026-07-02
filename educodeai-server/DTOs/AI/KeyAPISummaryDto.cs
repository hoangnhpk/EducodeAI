namespace educodeai_server.DTOs.AI
{
    // Dùng để hiển thị danh sách ở Table (Không trả về mã Key)
    public class KeyAPISummaryDto
    {
        public int ID { get; set; }
        public string TenKey { get; set; } = string.Empty;
        public string LoaiKey { get; set; } = string.Empty;
        public bool TrangThai { get; set; }
        public int ThuTuUuTien { get; set; }
        public string MaKeyMasked { get; set; } = string.Empty;
        public string ModelSuDung { get; set; } = string.Empty;

        // === Phase 7A: Rate Limit ===
        public int RPMLimit { get; set; }
        public int TPMLimit { get; set; }
        public int RPDLimit { get; set; }

        // Usage hôm nay (tính từ Redis/DB cho ngày hiện tại UTC)
        public int DaSuDungRequestHomNay { get; set; }
        public int DaSuDungTokenHomNay { get; set; }
        public double PhanTramRPD { get; set; } // % RPD đã dùng hôm nay

        // Trạng thái cooldown (bị block tạm thời vì vượt rate limit)
        public bool DangBiCooldown { get; set; }
    }

    // Dùng để tạo mới hoặc cập nhật
    public class KeyAPIManageDto
    {
        public string TenKey { get; set; } = string.Empty;
        public string MaKeyRaw { get; set; } = string.Empty; // Nhận key thô từ UI, BE sẽ mã hóa sau
        public string LoaiKey { get; set; } = string.Empty;
        public int ThuTuUuTien { get; set; }
        public string ModelSuDung { get; set; } = string.Empty;

        // === Phase 7A: Rate Limit mới (thay cho HanMucRequest/HanMucToken) ===
        public int RPMLimit { get; set; } = 15;
        public int TPMLimit { get; set; } = 1000000;
        public int RPDLimit { get; set; } = 1500;
    }

    // Dùng để trả danh sách model từ Google API (qua Proxy Backend)
    public class GeminiModelItemDto
    {
        public string Name { get; set; } = string.Empty;       // VD: "models/gemini-2.5-pro"
        public string DisplayName { get; set; } = string.Empty; // VD: "Gemini 2.5 Pro"
    }
}
