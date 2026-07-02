using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.KhoaHoc 
{
    public class TaoLoTrinhRequest
    {
        [Required]
        public string ChuDe { get; set; } = string.Empty;

        public string TrinhDo { get; set; } = "Cơ bản";

        public string LinhVuc { get; set; } = "Web Development";

        public int SoChuongDuKien { get; set; } = 5;
    }
}