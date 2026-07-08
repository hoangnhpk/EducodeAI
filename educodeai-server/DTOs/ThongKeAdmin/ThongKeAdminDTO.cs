namespace educodeai_server.DTOs.ThongKeAdmin
{
    public class ThongKeTongQuanDTO
    {
        public int TongHocVien { get; set; }
        public int TongGiangVien { get; set; }
        public int TongKhoaHoc { get; set; }
        public int TongLuotDangKy { get; set; }
    }

    public class PagedResultDTO<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public List<T> Items { get; set; } = new();
    }

    public class HocVienItemDTO
    {
        public int MaNguoiDung { get; set; }
        public string TaiKhoan { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public DateTime NgayThamGia { get; set; }
    }

    public class GiangVienItemDTO
    {
        public int MaNguoiDung { get; set; }
        public string TaiKhoan { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public DateTime NgayThamGia { get; set; }
    }

    public class KhoaHocItemDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public string LinhVuc { get; set; } = string.Empty;
        public string TrinhDo { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public int ThoiLuongGio { get; set; }
        public DateTime NgayTao { get; set; }
        public int MaGiangVien { get; set; }
        public string TenGiangVien { get; set; } = string.Empty;
    }

    public class DangKyItemDTO
    {
        public int MaDangKy { get; set; }
        public DateTime NgayDangKy { get; set; }
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public int MaHocVien { get; set; }
        public string TenHocVien { get; set; } = string.Empty;
        public string EmailHocVien { get; set; } = string.Empty;
    }

    public class TopKhoaHocDangKyDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public int SoLuotDangKy { get; set; }
    }

    public class TopGiangVienDangKyDTO
    {
        public int MaGiangVien { get; set; }
        public string TenGiangVien { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int SoLuotDangKy { get; set; }
    }

    public class HoatDongChiSoDTO
    {
        public int DAU { get; set; }
        public int WAU { get; set; }
        public int MAU { get; set; }
    }

    public class HoatDongHeThongDTO
    {
        // Mốc tính (as-of) để đồng bộ khi lọc theo tháng (thường là ngày cuối của "Đến tháng")
        public DateTime AsOfUtc { get; set; }
        public HoatDongChiSoDTO HocThat { get; set; } = new();
        public HoatDongChiSoDTO DangNhap { get; set; } = new();
    }

    public class ChatLuongKhoaHocItemDTO
    {
        public int MaKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; } = string.Empty;
        public int MaGiangVien { get; set; }
        public string TenGiangVien { get; set; } = string.Empty;

        public int SoDangKy { get; set; }
        public double TienDoTrungBinh { get; set; } // 0-100
        public double TyLeHoanThanh { get; set; } // 0-1

        public int SoDanhGia { get; set; }
        public double DiemDanhGiaTrungBinh { get; set; } // 0-5
        public int SoBinhLuan { get; set; }

        public double DiemChatLuong { get; set; } // 0-1 (điểm tổng hợp để xếp hạng)
    }

    public class DangKyTheoThangDTO
    {
        public int Nam { get; set; }
        public int Thang { get; set; } // 1-12
        public string Nhan { get; set; } = string.Empty; // VD: "04/2026"
        public int SoLuotDangKy { get; set; }
        public decimal TongTien { get; set; } = 0; // Hiện chưa có thanh toán
    }

    public class DoanhThuTongQuanDTO
    {
        public decimal TongDoanhThu { get; set; }
        public decimal TongPhiNenTang { get; set; }
        public decimal TongThucNhanGV { get; set; }
        public decimal DoanhThuThangNay { get; set; }
        public int TongDonHang { get; set; }
    }

    public class DoanhThuTheoThoiGianDTO
    {
        public string Nhan { get; set; } = string.Empty;
        public decimal TongDoanhThu { get; set; }
        public decimal PhiNenTang { get; set; }
        public decimal ThucNhanGV { get; set; }
    }
}
