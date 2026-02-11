using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class BoThuNghiemModel {
        [Key]
        public int MaBoThu { get; set; }

        public int MaBaiTapThucHanh { get; set; }

        [ForeignKey("MaBaiTapThucHanh")]
        public virtual BaiTap_ThucHanhIDEModel BaiTap_ThucHanh { get; set; } = null!;

        [Required]
        public required string DauVao { get; set; } // Input test case

        [Required]
        public required string DauRaMongMuon { get; set; } // Output expected
        [Required]
        public int GioiHanThoiGian { get; set; } = 1000; // Time limit in milliseconds
        [Required]
        public int GioiHanBoNho { get; set; } = 128; // Memory limit in MB

        public bool AnDanh { get; set; } = false;

        public int Diem { get; set; } = 1;

        public bool LaEdgeCase { get; set; } = false;
    }
}
