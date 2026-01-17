using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class LoTrinhAIModel {
    [Key]
    public int MaLoTrinh { get; set; }

    public int MaNguoiDung { get; set; }
    [ForeignKey("MaNguoiDung")]
    public virtual NguoiDungModel NguoiDung { get; set; } = null!;

    [Required]
    public required string YeuCau { get; set; }

    public string? NoiDungJSON { get; set; } 

    [StringLength(50)]
    public string? TrangThai { get; set; }

    public DateTime NgayTao { get; set; } = DateTime.Now;
}