using System;
using System.Collections.Generic;

namespace educodeai_server.DTOs.HocVien
{
    // DTO cho danh sách ngoài trang chủ
    public class LoTrinhKhamPhaDto
    {
        public int MaLoTrinh { get; set; }
        public string TieuDe { get; set; } = string.Empty;
        public DateTime? NgayTao { get; set; }
        public int MaGiangVien { get; set; }
        public string NoiDungJSON { get; set; } = "[]";
    }

    public class PagedResultDto<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
    }

    // DTO cho chi tiết lộ trình
    public class LoTrinhChiTietDto
    {
        public int MaLoTrinh { get; set; }
        public string TieuDe { get; set; } = string.Empty;
        public string TenGiangVien { get; set; } = string.Empty;
        public DateTime? NgayTao { get; set; }
        public List<ChangHocDto> CacChangHoc { get; set; } = new List<ChangHocDto>();
    }

    // ĐÃ CẬP NHẬT: Khớp 100% với cấu trúc JSON mới từ trang Giảng viên
    public class ChangHocDto
    {
        public int MaKhoaHoc { get; set; }
        public string Ten { get; set; } = string.Empty;
        public string HinhAnh { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
    }
}