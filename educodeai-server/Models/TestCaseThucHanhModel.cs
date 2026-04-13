using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class TestCaseThucHanhModel
    {
        [Key]
        public int MaTestCase { get; set; }

        public int MaBaiTapThucHanh { get; set; }

        [ForeignKey("MaBaiTapThucHanh")]
        public virtual BaiTapThucHanhModel BaiTapThucHanh { get; set; } = null!;

        [Required]
        public string InputDuLieu { get; set; } = null!;

        [Required]
        public string OutputMongDoi { get; set; } = null!;

        public string? MoTa { get; set; }

        public bool LaTestAn { get; set; } = false;

        public int ThuTu { get; set; } = 0;

        public int Diem { get; set; } = 10;

        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
    }
}
