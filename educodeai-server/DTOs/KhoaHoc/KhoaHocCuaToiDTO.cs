public class KhoaHocGiangVienListDTO
{
    public int MaKhoaHoc { get; set; }
    public string TenKhoaHoc { get; set; } = null!;
    public string? HinhAnh { get; set; }

    public string LinhVuc { get; set; } = null!;
    public string TrinhDo { get; set; } = null!;
    public int ThoiLuongGio { get; set; }

    public int SoHocVien { get; set; }
    public double TienDoTrungBinh { get; set; }

    public double DiemDanhGiaTB { get; set; }
    public string? TrangThai { get; set; }
    public bool CoChungChi { get; set; }
    public bool DaCoDeThiChungChi { get; set; }
    public DateTime NgayTao { get; set; }
}

// ─── CHI TIẾT KHÓA HỌC ─────
public class KhoaHocGiangVienDetailDTO
{
    public int MaKhoaHoc { get; set; }
    public string TenKhoaHoc { get; set; } = null!;
    public string? MoTa { get; set; }
    public string? HinhAnh { get; set; }

    public string LinhVuc { get; set; } = null!;
    public string TrinhDo { get; set; } = null!;
    public int ThoiLuongGio { get; set; }

    public string? TrangThai { get; set; }
    public DateTime NgayTao { get; set; }
    public bool CoChungChi { get; set; }
    public string? TenChungChi { get; set; }
    public double DiemDatChungChi { get; set; }
    public int SoCauHoiChungChi { get; set; }
    public int ThoiGianLamBaiChungChi { get; set; }
    public bool DaCoDeThiChungChi { get; set; }
    public string? NguonDeChungChi { get; set; }
    public DateTime? NgayTaoDeChungChi { get; set; }

    public int SoHocVien { get; set; }
    public double TiLeHoanThanh { get; set; }
    public double DiemDanhGiaTB { get; set; }
    public string? KyNangChinh { get; set; }

    public List<HocVienTrongKhoaHocDTO> DanhSachHocVien { get; set; } = new();
    public List<ChuongHocDetailDTO> DanhSachChuong { get; set; } = new();
}

// ─── HỌC VIÊN ────
public class HocVienTrongKhoaHocDTO
{
    public int MaNguoiDung { get; set; }
    public string HoTen { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? AnhDaiDien { get; set; }

    public DateTime NgayDangKy { get; set; }
    public int TienDo { get; set; }
    public double? DiemTrungBinh { get; set; }
}
public class KhoaHocCreateUpdateDTO
{
    public string TenKhoaHoc { get; set; } = null!;
    public string? MoTa { get; set; }
    public string? HinhAnh { get; set; }

    public string LinhVuc { get; set; } = null!;
    public string TrinhDo { get; set; } = null!;
    public int ThoiLuongGio { get; set; }

    public string? TrangThai { get; set; }
    public string? KyNangChinh { get; set; }
    public bool CoChungChi { get; set; }
    public string? TenChungChi { get; set; }
    public double DiemDatChungChi { get; set; } = 80;
    public int SoCauHoiChungChi { get; set; } = 20;
    public int ThoiGianLamBaiChungChi { get; set; } = 30;
}

public class KetQuaTaoDeChungChiAIDTO
{
    public bool ThanhCong { get; set; }
    public string ThongBao { get; set; } = string.Empty;
    public int SoCauHoi { get; set; }
    public string? NguonDeChungChi { get; set; }
    public DateTime? NgayTaoDeChungChi { get; set; }
}

public class ChuongHocDTO
{
    public int MaChuong { get; set; }
    public string TenChuong { get; set; } = null!;
    public int ThuTu { get; set; }
}

public class ChuongHocDetailDTO
{
    public int MaChuong { get; set; }
    public string TenChuong { get; set; } = null!;
    public int ThuTu { get; set; }
    public List<BaiHocVideoDetailDTO> DanhSachBaiHoc { get; set; } = new();
}

public class ChuongHocCreateUpdateDTO
{
    public string TenChuong { get; set; } = null!;
    public int ThuTu { get; set; }
}

public class ThemChuongResponseDTO
{
    public int MaChuong { get; set; }
    public string TenChuong { get; set; } = null!;
    public int ThuTu { get; set; }
}

// ─── BÀI HỌC VIDEO ───
public class BaiHocVideoDTO
{
    public int MaBaiHoc { get; set; }
    public string TieuDe { get; set; } = null!;
    public string? MoTa { get; set; }
    public string? LinkVideo { get; set; }
    public int ThoiLuong { get; set; }
    public int ThuTu { get; set; }
}

public class BaiHocVideoDetailDTO
{
    public int MaBaiHoc { get; set; }
    public string TieuDe { get; set; } = null!;
    public string? MoTa { get; set; }
    public string? LinkVideo { get; set; }
    public int ThoiLuong { get; set; }
    public int ThuTu { get; set; }
}

public class BaiHocVideoCreateUpdateDTO
{
    public string TieuDe { get; set; } = null!;
    public string? MoTa { get; set; }
    public string? LinkVideo { get; set; }
    public int ThoiLuong { get; set; }
    public int ThuTu { get; set; }
}
public class ThemVideoResponseDTO
{
    public int MaBaiHoc { get; set; }
    public string TieuDe { get; set; } = null!;
    public string? MoTa { get; set; }
    public string? LinkVideo { get; set; }
    public int ThoiLuong { get; set; }
    public int ThuTu { get; set; }
}
