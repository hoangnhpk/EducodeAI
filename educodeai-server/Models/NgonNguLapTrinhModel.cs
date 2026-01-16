using System.ComponentModel.DataAnnotations;
public class NgonNguLapTrinhModel {
    [Key]
    public int MaNgonNgu { get; set; }

    [Required]
    [StringLength(50)]
    public required string TenNgonNgu { get; set; }
}