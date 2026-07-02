using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class MaGiamGiaKhoaHocModel
    {
        [Key]
        public int MaLienKet { get; set; }

        public int MaVoucher { get; set; }

        [ForeignKey("MaVoucher")]
        public virtual MaGiamGiaModel Voucher { get; set; } = null!;

        public int MaKhoaHoc { get; set; }

        [ForeignKey("MaKhoaHoc")]
        public virtual KhoaHocModel KhoaHoc { get; set; } = null!;
    }
}
