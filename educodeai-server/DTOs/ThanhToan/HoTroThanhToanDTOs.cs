using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.ThanhToan
{
    public class YeuCauHoTroThanhToanDTO
    {
        [Required(ErrorMessage = "Vui lòng nhập thông tin liên lạc.")]
        [StringLength(200, ErrorMessage = "Thông tin liên lạc tối đa 200 ký tự.")]
        public string ThongTinLienLac { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Nội dung bổ sung tối đa 500 ký tự.")]
        public string? NoiDungHocVien { get; set; }
    }

    public class XuLyYeuCauHoTroThanhToanDTO
    {
        [StringLength(500, ErrorMessage = "Ghi chú tối đa 500 ký tự.")]
        public string? GhiChuAdmin { get; set; }
    }

    public class HoTroThanhToanKhoaHocItemDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
    }

    public class HoTroThanhToanDanhSachItemDTO
    {
        public int MaGiaoDichHoTro { get; set; }
        public int MaDonHang { get; set; }
        public string NoiDungChuyenKhoan { get; set; } = string.Empty;
        public int MaNguoiDung { get; set; }
        public string TenHocVien { get; set; } = string.Empty;
        public string? EmailHocVien { get; set; }
        public decimal SoTienDonHang { get; set; }
        public string LoaiTien { get; set; } = "VND";
        public string TrangThaiHoTro { get; set; } = string.Empty;
        public string TrangThaiDonHang { get; set; } = string.Empty;
        public string ThongTinLienLac { get; set; } = string.Empty;
        public string? NoiDungHocVien { get; set; }
        public string? GhiChuAdmin { get; set; }
        public string? KhoaHocDaiDien { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? XuLyLuc { get; set; }
    }

    public class HoTroThanhToanChiTietDTO
    {
        public int MaGiaoDichHoTro { get; set; }
        public int MaDonHang { get; set; }
        public string NoiDungChuyenKhoan { get; set; } = string.Empty;
        public int MaNguoiDung { get; set; }
        public string TenHocVien { get; set; } = string.Empty;
        public string? EmailHocVien { get; set; }
        public decimal SoTienDonHang { get; set; }
        public string LoaiTien { get; set; } = "VND";
        public string TrangThaiHoTro { get; set; } = string.Empty;
        public string TrangThaiDonHang { get; set; } = string.Empty;
        public string ThongTinLienLac { get; set; } = string.Empty;
        public string? NoiDungHocVien { get; set; }
        public string? GhiChuAdmin { get; set; }
        public int? MaQuanTriVienXuLy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? XuLyLuc { get; set; }
        public List<HoTroThanhToanKhoaHocItemDTO> DanhSachKhoaHoc { get; set; } = new();
    }
}
