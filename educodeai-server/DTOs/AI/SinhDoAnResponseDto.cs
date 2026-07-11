using System.Collections.Generic;

namespace educodeai_server.DTOs.AI
{
    public class SinhDoAnResponseDto
    {
        public int MaDoAn { get; set; } // Will be returned if saved to DB
        public string TenDoAn { get; set; }
        public string MoTa { get; set; }
        public List<YeuCauChucNangDto> YeuCauChucNang { get; set; }
        public string CauTrucDatabase { get; set; }
    }

    public class YeuCauChucNangDto
    {
        public int Ngay { get; set; }
        public string TenChucNang { get; set; }
        public string TrangThai { get; set; } = "Locked";
        public System.DateTime? NgayHoanThanh { get; set; }
        public int Diem { get; set; } = 0;
        public string NhanXet { get; set; } = "";
        public string ChiTietYeuCau { get; set; } // Chi tiết công việc cần làm
        public string GoiYFileNop { get; set; } // Gợi ý tên file quan trọng nhất cần nộp để AI chấm
    }
}
