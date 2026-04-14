namespace educodeai_server.DTOs.QuanTriVien
{
    public class DanhGiaAdminFilterDTO
    {
        public string? TrangThai { get; set; }
        public int? SoSao { get; set; }
        public string? Search { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class DanhGiaAdminNguoiDungDTO
    {
        public int Id { get; set; }
        public string Ten { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Avatar { get; set; }
    }

    public class DanhGiaAdminKhoaHocDTO
    {
        public int Id { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public string? GiangVien { get; set; }
    }

    public class DanhGiaAdminItemDTO
    {
        public int Id { get; set; }
        public int MaNguoiDung { get; set; }
        public int MaKhoaHoc { get; set; }
        public DanhGiaAdminNguoiDungDTO NguoiDung { get; set; } = new();
        public DanhGiaAdminKhoaHocDTO KhoaHoc { get; set; } = new();
        public int SoSao { get; set; }
        public string NoiDung { get; set; } = string.Empty;
        public DateTime NgayTao { get; set; }
        public string TrangThai { get; set; } = "ChoDuyet";
    }

    public class ThongKeDanhGiaAdminDTO
    {
        public int TongDanhGia { get; set; }
        public int ChoDuyet { get; set; }
        public int DaDuyet { get; set; }
        public int TuChoi { get; set; }
        public double DanhGiaTrungBinh { get; set; }
        public PhanBoSaoDTO PhanBoSao { get; set; } = new();
    }

    public class PhanBoSaoDTO
    {
        public int Star1 { get; set; }
        public int Star2 { get; set; }
        public int Star3 { get; set; }
        public int Star4 { get; set; }
        public int Star5 { get; set; }
    }

    public class PagedResultDTO<T>
    {
        public List<T> Data { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}
