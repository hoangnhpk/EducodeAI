using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class TienDoBaiHocModel {
    [Key]
    public int MaTienDo { get; set; }

    public int MaNguoiDung { get; set; }
    [ForeignKey("MaNguoiDung")]
    public virtual NguoiDungModel NguoiDung { get; set; } = null!;

    public int MaBaiHoc { get; set; }
    [ForeignKey("MaBaiHoc")]
    public virtual BaiHocModel BaiHoc { get; set; } = null!;

    public bool DaXem { get; set; } = false;
    public int ThoiGianHoc { get; set; } = 0;
    public DateTime NgayCapNhat { get; set; } = DateTime.Now;
}