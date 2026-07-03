using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.AI
{
    // ============================================================
    // 1. NỘP ĐỒ ÁN – học viên gửi toàn bộ JSON đồ án lên server
    // ============================================================
    public class NopDoAnRequestDto
    {
        [Required] public string TenDoAn { get; set; } = string.Empty;
        [Required] public string MoTa { get; set; } = string.Empty;
        [Required] public List<string> YeuCauChucNang { get; set; } = new();
        [Required] public string CauTrucDatabase { get; set; } = string.Empty;
        public string MucTieuNgheNghiep { get; set; } = string.Empty;
        [Required] public string NgonNguCongNghe { get; set; } = string.Empty;
        public string GhiChuThayDoi { get; set; } = string.Empty; // Ghi chú thay đổi cấu trúc/công nghệ so với đề xuất
        public string KhoKhan { get; set; } = string.Empty; // Khó khăn gặp phải
        public string TienDoHoanThanh { get; set; } = string.Empty; // Báo cáo tiến độ (ví dụ: "Hoàn thành 4/5 chức năng")
    }

    public class NopDoAnResponseDto
    {
        public int MaDoAn { get; set; }          // giữ lại cho tương thích
        public string SessionId { get; set; } = string.Empty;  // key thực dùng cho Cache
        public string CauHoiDauTien { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    // ============================================================
    // 2. TRẢ LỜI PHỎNG VẤN – học viên gửi câu trả lời, AI trả câu hỏi tiếp
    // ============================================================
    public class TraLoiPhongVanRequestDto
    {
        [Required] public string SessionId { get; set; } = string.Empty;  // dùng cache key
        [Required] public int SoCauHienTai { get; set; }   // 1..5
        [Required] public string CauTraLoi { get; set; } = string.Empty;
    }

    public class TraLoiPhongVanResponseDto
    {
        public int SoCauHienTai { get; set; }
        public int TongSoCau { get; set; } = 3;
        public bool DaKetThuc { get; set; }
        /// <summary>Điểm AI chấm cho câu vừa trả lời (0–20)</summary>
        public int DiemCauVua { get; set; }
        /// <summary>Nhận xét ngắn của AI về câu trả lời vừa rồi</summary>
        public string NhanXet { get; set; } = string.Empty;
        /// <summary>Câu hỏi tiếp theo (null nếu đã kết thúc)</summary>
        public string? CauHoiTiepTheo { get; set; }
    }

    // ============================================================
    // 3. KẾT QUẢ CUỐI – trả về sau khi hoàn thành 5 câu
    // ============================================================
    public class KetQuaPhongVanDto
    {
        public int MaDoAn { get; set; }
        public int TongDiem { get; set; }       // 0–100
        public bool DaDat { get; set; }          // >= 60
        public string NhanXetTong { get; set; } = string.Empty;
        /// <summary>Mã chứng chỉ nếu đạt, null nếu chưa đạt</summary>
        public string? MaChungChi { get; set; }
        public List<ChiTietCauHoiDto> ChiTietCauHoi { get; set; } = new();
    }

    public class ChiTietCauHoiDto
    {
        public int SoCau { get; set; }
        public string CauHoi { get; set; } = string.Empty;
        public string CauTraLoi { get; set; } = string.Empty;
        public int Diem { get; set; }
        public string NhanXet { get; set; } = string.Empty;
    }

    // ============================================================
    // 4. LỊCH SỬ PHỎNG VẤN – lưu vào DB dưới dạng JSON
    // ============================================================
    public class PhongVanTurnDto
    {
        public int SoCau { get; set; }
        public string CauHoi { get; set; } = string.Empty;
        public string CauTraLoi { get; set; } = string.Empty;
        public int Diem { get; set; }
        public string NhanXet { get; set; } = string.Empty;
    }
    // ============================================================
    // 5. CHẤM ĐIỂM TỪNG TÍNH NĂNG
    // ============================================================
    public class ChamDiemTinhNangRequestDto
    {
        [Required] public int MaDoAn { get; set; }
        [Required] public int Ngay { get; set; } // Ngày của tính năng đang chấm
        [Required] public string TenDoAn { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        [Required] public string TenTinhNang { get; set; } = string.Empty;
        [Required] public string TenFile { get; set; } = string.Empty;
        [Required] public string NoiDungFile { get; set; } = string.Empty;
        public string KhoKhan { get; set; } = string.Empty;
        public string SuaDoi { get; set; } = string.Empty;
    }

    public class ChamDiemTinhNangResponseDto
    {
        public int Diem { get; set; }
        public string NhanXet { get; set; } = string.Empty;
    }

    public class ChungChiThucChienDto
    {
        public int MaChungChiDoAn { get; set; }
        public int MaDoAn { get; set; }
        public string TenDoAn { get; set; } = string.Empty;
        public string MaChungChi { get; set; } = string.Empty;
        public int DiemDat { get; set; }
        public DateTime NgayCap { get; set; }
        public string MucTieuNgheNghiep { get; set; } = string.Empty;
        public string NgonNguCongNghe { get; set; } = string.Empty;
    }
}
