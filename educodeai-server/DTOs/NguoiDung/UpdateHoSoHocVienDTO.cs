using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.NguoiDung
{
    public class UpdateHoSoHocVienDTO
    {
        [Required]
        public string HoTen { get; set; } = null!;

        public IFormFile? AnhDaiDien { get; set; }
    }
}
