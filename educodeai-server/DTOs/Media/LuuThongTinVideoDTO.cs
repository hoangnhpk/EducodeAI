namespace educodeai_server.DTOs.Media
{
    public class LuuThongTinVideoDTO
    {
        public int MaBaiHoc { get; set; }
        public string PublicId { get; set; } = string.Empty;
        public string SecureUrl { get; set; } = string.Empty;
        public int ThoiLuong { get; set; } // Thời lượng (giây)
        public long DungLuong { get; set; } // Dung lượng (bytes) - long để không tràn với video >2GB
        public string TrangThaiVideo { get; set; } = "ready";
    }
}
