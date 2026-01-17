using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
public class ChuongHocModel {
    [Key]
    public int MaChuong { get; set; }

    public int MaKhoaHoc { get; set; }
    [ForeignKey("MaKhoaHoc")]
    public virtual KhoaHocModel KhoaHoc { get; set; } = null!;

    [Required]
    [StringLength(200)]
    public required string TenChuong { get; set; }

    public int ThuTu { get; set; }
}