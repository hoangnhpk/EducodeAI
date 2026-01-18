using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class KhoaHocModel
{
    [Key]
    public int MaKhoaHoc { get; set; }

    public int MaGiangVien { get; set; }

    [ForeignKey("MaGiangVien")]
    public virtual NguoiDungModel GiangVien { get; set; } = null!;

    [Required]
    [StringLength(200)]
    public string TenKhoaHoc { get; set; } = null!;

    public string? MoTa { get; set; }

    [StringLength(500)]
    public string? HinhAnh { get; set; }

    [StringLength(50)]
    public string? TrangThai { get; set; } = "Hoạt động";

    public double DiemDanhGiaTB { get; set; } = 0;

    // ====== CỘT MỚI ======

    [StringLength(100)]
    public string? LinhVuc { get; set; }   // Ví dụ: BackEnd, Database, System Design...

    [StringLength(50)]
    public string? TrinhDo { get; set; }   // Người mới, Trung cấp, Nâng cao

    public int ThoiLuongGio { get; set; }  // Tổng số giờ học

    [StringLength(50)]
    public string? KyNangChinh { get; set; } // Ví dụ: ["C#","SQL","REACT"]

    public DateTime NgayTao { get; set; } = DateTime.Now;
}
