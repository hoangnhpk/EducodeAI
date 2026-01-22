public class DanhSachKhoaHocGiangVienDTO
{
    public int MaKhoaHoc { get; set; }
    public required string TenKhoaHoc { get; set; }
    public string? HinhAnh { get; set; }
    public string? TenLop { get; set; }
    public int SoHocVien { get; set; }
    public double TienDoTrungBinh { get; set; }
    public DateTime NgayTao { get; set; }
    public string? TrangThai { get; set; }
}
public class ChiTietKhoaHocDTO
{
    public int MaKhoaHoc { get; set; }
    public string TenKhoaHoc { get; set; } = null!;
    public string SiSo { get; set; } = "0/0";
    public double TiLeHoanThanh { get; set; }
    public int BaiTapChuaCham { get; set; }
    public double DiemDanhGia { get; set; }
    public List<HocVienTrongLopDTO> DanhSachHocVien { get; set; } = new();
}
public class HocVienTrongLopDTO
{
    public int MaNguoiDung { get; set; }
    public string HoTen { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? AnhDaiDien { get; set; }
    public DateTime NgayDangKy { get; set; }
    public int TienDo { get; set; }
    public double DiemTrungBinh { get; set; }
}