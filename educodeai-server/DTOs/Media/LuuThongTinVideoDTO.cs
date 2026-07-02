namespace educodeai_server.DTOs.Media
{
    public class LuuThongTinVideoDTO
    {
        public int MaBaiHoc { get; set; }
        public string PublicId { get; set; } = string.Empty;
        public string SecureUrl { get; set; } = string.Empty;
        public int ThoiLuong { get; set; } // Thời lượng (giây)
        public int DungLuong { get; set; } // Dung lượng (bytes)
        public string TrangThaiVideo { get; set; } = "ready";
    }
}
