using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class KetQuaKiemTraChungChiModel
    {
        [Key]
        public int MaKetQuaKiemTraChungChi { get; set; }

        public int MaKhoaHoc { get; set; }

        [ForeignKey("MaKhoaHoc")]
        public virtual KhoaHocModel KhoaHoc { get; set; } = null!;

        public int MaNguoiDung { get; set; }

        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        public double DiemSo { get; set; }
        public int SoCauDung { get; set; }
        public int TongSoCau { get; set; }
        public bool DaDat { get; set; }
        public string ChiTietLamBaiJSON { get; set; } = string.Empty;
        public DateTime NgayThi { get; set; } = DateTime.UtcNow;
    }
}
