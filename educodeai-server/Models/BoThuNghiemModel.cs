using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class BoThuNghiemModel {
    [Key]
    public int MaBoThu { get; set; }

    public int MaBaiTap { get; set; }
    [ForeignKey("MaBaiTap")]
    public virtual BaiTapModel BaiTap { get; set; } = null!;

    [Required]
    public required string DauVao { get; set; } // Input test case
    
    [Required]
    public required string DauRaMongMuon { get; set; } // Output expected

    public bool AnDanh { get; set; } = false;
}