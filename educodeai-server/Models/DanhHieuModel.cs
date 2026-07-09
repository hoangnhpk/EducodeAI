using System.ComponentModel.DataAnnotations;

namespace educodeai_server.Models
{
    public class DanhHieuModel
    {
        [Key]
        public int MaDanhHieu { get; set; }

        [StringLength(50)]
        public string MaCode { get; set; } = string.Empty;

        [StringLength(120)]
        public string TenDanhHieu { get; set; } = string.Empty;

        [StringLength(300)]
        public string? MoTa { get; set; }

        public int ExpYeuCau { get; set; }

        public int ThuTu { get; set; }
    }
}
