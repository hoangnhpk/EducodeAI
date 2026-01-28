using System.ComponentModel.DataAnnotations;

public class RegisterDto
{
    [Required(ErrorMessage = "Họ tên không được để trống")]
    public string HoTen { get; set; }

    [Required]
    [EmailAddress(ErrorMessage = "Định dạng Email không hợp lệ")]
    public string Email { get; set; }

    [Required]
    [StringLength(20, MinimumLength = 3, ErrorMessage = "Tài khoản từ 3-20 ký tự")]
    public string TaiKhoan { get; set; }

    [Required]
    [MinLength(8, ErrorMessage = "Mật khẩu phải từ 8 ký tự trở lên")]
    public string MatKhau { get; set; }
}