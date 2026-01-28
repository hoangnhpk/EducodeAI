using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.NguoiDung
{
    public class UpdateHoSoHocVienDTO
    {
        [Required(ErrorMessage = "Họ tên không được để trống")]
        [MinLength(2, ErrorMessage = "Họ tên phải có ít nhất 2 ký tự")]
        public string HoTen { get; set; } = null!;

        public IFormFile? AnhDaiDien { get; set; }
    }
}
