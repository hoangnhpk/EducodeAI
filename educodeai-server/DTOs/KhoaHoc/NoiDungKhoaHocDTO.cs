namespace educodeai_server.DTOs.KhoaHoc
{
    public class BaiHoc_NoiDungKhoaHocDTO
    {
        public int Id { get; set; }
        public string TieuDe { get; set; } = null!;
        public string LoaiBaiHoc { get; set; } = null!; // "Video", "Quiz", "ThucHanh"
        public string? NoiDung { get; set; }
        public int? ThoiLuong { get; set; }
        public int ThuTu { get; set; }
        public string? LinkVideo { get; set; }
        public bool DaXem { get; set; } = false;

        public BaiTapQuizDTO? ThongTinQuiz { get; set; }

    }

    public class ChuongHoc_NoiDungKhoaHocDTO
    {
        public int Id { get; set; }
        public string TieuDe { get; set; } = null!;
        public int ThuTu { get; set; }
        public List<BaiHoc_NoiDungKhoaHocDTO> DanhSachBaiHoc { get; set; } = new List<BaiHoc_NoiDungKhoaHocDTO>();
    }

    public class KhoaHoc_NoiDungKhoaHocDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = null!;
        public string? Slug { get; set; }
        public List<ChuongHoc_NoiDungKhoaHocDTO> DanhSachChuongHoc { get; set; } = new List<ChuongHoc_NoiDungKhoaHocDTO>();
    }

    public class TienDoBaiHocDTO
    {
        public int MaBaiHoc { get; set; }
        public int MaNguoiDung { get; set; }
        public bool DaXem { get; set; }
        public int ThoiGianHoc { get; set; }
    }

    public class GhiChuBaiHocDTO
    {
        public int MaGhiChu { get; set; }
        public int MaBaiHoc { get; set; }
        public int MaNguoiDung { get; set; }
        public int ThoiGianVideo { get; set; }
        public string NoiDung { get; set; } = null!;
        public DateTime NgayTao { get; set; }
    }

    public class BaiTapQuizDTO
    {
        public int MaBaiTapQuiz { get; set; }
        public int MaBaiTap { get; set; }
        public int? ThoiGianLamBai { get; set; } 
        public double DiemCanDat { get; set; }  
        public bool ChoPhepLamLai { get; set; }
        public bool DaoCauHoi { get; set; }
        public string DuLieuCauHoiJSON { get; set; } = null!;
    }

    public class ChiTietCauTraLoiDTO
    {
        public int IdCauHoi { get; set; }   
        public int IndexLuaChon { get; set; } 
    }

    public class KetQuaQuizSubmitDTO
    {
        public int MaBaiHoc { get; set; }    // Để cập nhật tiến độ bài học
        public int MaBaiTap { get; set; }    // Để lưu vào bảng kết quả (Khóa ngoại)
        public int MaNguoiDung { get; set; }
        public float DiemSo { get; set; }    // Ví dụ: 80.0
        public int SoCauDung { get; set; }   // Ví dụ: 8
        public int TongSoCau { get; set; }   // Ví dụ: 10
        public bool DaDat { get; set; }      // True/False

        public List<ChiTietCauTraLoiDTO> ChiTietLamBai { get; set; } = new();
    }
}
