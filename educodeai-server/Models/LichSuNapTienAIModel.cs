using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class LichSuNapTienAIModel
    {
        [Key]
        public int MaGiaoDich { get; set; }

        public int MaGiangVien { get; set; }

        [ForeignKey("MaGiangVien")]
        public virtual NguoiDungModel GiangVien { get; set; } = null!;

        [Column(TypeName = "numeric(18,2)")]
        public decimal SoTienVnd { get; set; }

        [Column(TypeName = "decimal(10,4)")]
        public decimal SoTienUsd { get; set; }

        [Column(TypeName = "decimal(10,4)")]
        public decimal TyGiaApDung { get; set; }

        [StringLength(30)]
        public string TrangThai { get; set; } = "THANH_CONG";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
