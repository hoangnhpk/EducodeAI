namespace educodeai_server.DTOs.ThuThach
{
    public class NhiemVuThuThachDTO
    {
        public int MaMau { get; set; }
        public string MaNhiemVu { get; set; } = string.Empty;
        public string TieuDe { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public string Icon { get; set; } = "book";
        public int GiaTriHienTai { get; set; }
        public int ChiTieu { get; set; }
        public int ExpThuong { get; set; }
        /// <summary>in_progress | completed | claimed</summary>
        public string TrangThai { get; set; } = "in_progress";
        public int PhanTramTienDo { get; set; }
    }

    public class DanhHieuDTO
    {
        public int MaDanhHieu { get; set; }
        public string MaCode { get; set; } = string.Empty;
        public string TenDanhHieu { get; set; } = string.Empty;
        public string? MoTa { get; set; }
        public int ExpYeuCau { get; set; }
        public bool DaMoKhoa { get; set; }
        public bool DangDeo { get; set; }
    }

    public class ThuThachTuanResponseDTO
    {
        public int TongExp { get; set; }
        public string HuyHieuHienTai { get; set; } = "Tân binh học tập";
        public int? MaDanhHieuDangDeo { get; set; }
        public DateTime NgayDauTuan { get; set; }
        public DateTime NgayKetThucTuan { get; set; }
        public long GiayConLaiDenLamMoi { get; set; }
        public List<NhiemVuThuThachDTO> DanhSachNhiemVu { get; set; } = new();
        public List<DanhHieuDTO> DanhSachDanhHieu { get; set; } = new();
    }

    public class NhanThuongResponseDTO
    {
        public int ExpNhanDuoc { get; set; }
        public int TongExp { get; set; }
        public string? DanhHieuMoiMoKhoa { get; set; }
        public ThuThachTuanResponseDTO BangNhiemVu { get; set; } = new();
        public BangXepHangResponseDTO BangXepHang { get; set; } = new();
    }

    public class BangXepHangItemDTO
    {
        public int Hang { get; set; }
        public int MaNguoiDung { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string? AnhDaiDien { get; set; }
        public int Exp { get; set; }
        public string? TenDanhHieu { get; set; }
        public string? MaCodeDanhHieu { get; set; }
        /// <summary>Tổng phút học trong tuần (chỉ BXH tuần, dùng khi hòa EXP).</summary>
        public int? GioHocPhut { get; set; }
        public bool LaToi { get; set; }
    }

    public class BangXepHangResponseDTO
    {
        /// <summary>tuan</summary>
        public string Loai { get; set; } = "tuan";
        public DateTime? NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; }
        public long GiayConLaiDenLamMoi { get; set; }
        public int? HangCuaToi { get; set; }
        public int ExpCuaToi { get; set; }
        public List<BangXepHangItemDTO> DanhSach { get; set; } = new();
    }
}
