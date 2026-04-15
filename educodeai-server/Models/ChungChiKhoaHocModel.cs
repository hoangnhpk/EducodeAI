using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class ChungChiKhoaHocModel
    {
        [Key]
        public int MaChungChiKhoaHoc { get; set; }

        [StringLength(50)]
        public string MaChungChi { get; set; } = string.Empty;

        public int MaKhoaHoc { get; set; }

        [ForeignKey("MaKhoaHoc")]
        public virtual KhoaHocModel KhoaHoc { get; set; } = null!;

        public int MaNguoiDung { get; set; }

        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        public int? MaKetQuaKiemTraChungChi { get; set; }

        [ForeignKey("MaKetQuaKiemTraChungChi")]
        public virtual KetQuaKiemTraChungChiModel? KetQuaKiemTraChungChi { get; set; }

        [StringLength(200)]
        public string? HoTenHienThi { get; set; }

        [StringLength(200)]
        public string? EmailNhan { get; set; }

        public bool DaGuiEmail { get; set; }

        public DateTime? NgayGuiEmail { get; set; }

        public DateTime NgayCap { get; set; } = DateTime.UtcNow;
    }
}
