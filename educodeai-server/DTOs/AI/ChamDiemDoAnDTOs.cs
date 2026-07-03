using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace educodeai_server.DTOs.AI
{
    public class NopDoAnZipRequestDto
    {
        [Required]
        public string YeuCauDoAn { get; set; } // The requirement that the project should meet

        [Required]
        public IFormFile ZipFile { get; set; } // The zip file containing the project

        public string MatKhau { get; set; } // Optional password for the zip file
    }

    public class KetQuaChamDiemDoAnDto
    {
        public double Diem { get; set; }
        public string NhanXet { get; set; }
    }
}
