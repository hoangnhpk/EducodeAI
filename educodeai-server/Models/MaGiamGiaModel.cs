using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class MaGiamGiaModel
    {
        [Key]
        public int MaVoucher { get; set; }

        [StringLength(40)]
        public string Code { get; set; } = null!;

        [StringLength(100)]
        public string TenChuongTrinh { get; set; } = null!;

        [StringLength(20)]
        public string LoaiGiamGia { get; set; } = "PERCENT";

        [Column(TypeName = "numeric(18,2)")]
        public decimal GiaTriGiam { get; set; }

        [Column(TypeName = "numeric(18,2)")]
        public decimal? GiamToiDa { get; set; }

        [Column(TypeName = "numeric(18,2)")]
        public decimal DonHangToiThieu { get; set; } = 0;

        public int SoLuongToiDa { get; set; } = 0;
        public int SoLuongDaDung { get; set; } = 0;
        public bool KichHoat { get; set; } = true;

        public DateTime BatDauAt { get; set; } = DateTime.UtcNow;
        public DateTime KetThucAt { get; set; } = DateTime.UtcNow.AddMonths(1);
    }
}
