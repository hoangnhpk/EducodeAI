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
    }
}