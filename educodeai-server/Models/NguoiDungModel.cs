using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

[Table("NguoiDung")]
public class NguoiDungModel
{
    public int MaNguoiDung { get; set; }
    public string HoTen { get; set; }
    public string Email { get; set; }
    public string TaiKhoan { get; set; }

    public string? AnhDaiDien { get; set; } 
    public string PasswordHash { get; set; }

    public DateTime NgayThamGia { get; set; }
}

