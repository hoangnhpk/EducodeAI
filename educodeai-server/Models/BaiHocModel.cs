using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class BaiHocModel {
    [Key]
    public int MaBaiHoc { get; set; }

    public int MaChuong { get; set; }
    [ForeignKey("MaChuong")]
    public virtual ChuongHocModel ChuongHoc { get; set; } = null!;

    [Required]
    [StringLength(200)]
    public required string TieuDe { get; set; }

    [StringLength(50)]
    public required string LoaiBaiHoc { get; set; } // Video, VanBan, BaiTap

    public string? NoiDung { get; set; } // HTML content nên để MAX

    [StringLength(500)]
    public string? LinkVideo { get; set; }

    public int ThuTu { get; set; }
}