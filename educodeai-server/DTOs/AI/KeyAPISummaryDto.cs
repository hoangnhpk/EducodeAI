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
        public double PhanTramSuDung { get; set; } // Tính toán từ Request đã dùng / Hạn mức
    }

    // Dùng để tạo mới hoặc cập nhật
    public class KeyAPIManageDto
    {
        public string TenKey { get; set; } = string.Empty;
        public string MaKeyRaw { get; set; } = string.Empty; // Nhận key thô từ UI, BE sẽ mã hóa sau
        public string LoaiKey { get; set; } = string.Empty;
        public int ThuTuUuTien { get; set; }
        public int HanMucRequest { get; set; }
        public int HanMucToken { get; set; }
    }
}
