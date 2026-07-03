using System;

namespace educodeai_server.DTOs//(k)
{
    // DTO cho Dropdown chọn Khóa học
    public class KhoaHocCuaGiangVienDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = null!;
        public string? HinhAnh { get; set; }
        public int SoLuongHocVien { get; set; }
    }

    // DTO cho Bảng Danh sách Học viên 
    public class ChiTietHocVienTrongKhoaDTO
    {
        public int MaNguoiDung { get; set; }
        public string HoTen { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? AnhDaiDien { get; set; }
        public DateTime NgayDangKy { get; set; }
        public string TenKhoaHoc { get; set; } = null!;
        public string? TrangThai { get; set; }
        public int PhanTramTienDo { get; set; }
        public int SoBaiDaHoc { get; set; }
        public int TongSoBai { get; set; }
        public DateTime? NgayHocCuoi { get; set; }
        public string? Tag { get; set; }
        public string? TagLabel { get; set; }
    }

    public class GuiMailHangLoatDTO
    {
        public int MaKhoaHoc { get; set; }
        public List<int> DanhSachMaNguoiDung { get; set; } = new();
        public string TieuDe { get; set; } = string.Empty;
        public string NoiDungHtml { get; set; } = string.Empty;
    }

    public class GuiMailHangLoatResultDTO
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int SoLuongDaXepHang { get; set; }
    }
}