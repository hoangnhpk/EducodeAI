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

        public int MaNguoiTao { get; set; }

        [ForeignKey("MaNguoiTao")]
        public virtual NguoiDungModel NguoiTao { get; set; } = null!;

        [StringLength(20)]
        public string LoaiNguoiTao { get; set; } = "ADMIN";

        [StringLength(30)]
        public string PhamViApDung { get; set; } = "SPECIFIC_COURSES"; // ALL_TEACHER_COURSES | SPECIFIC_COURSES

        public bool ChoPhepApDungChoQuaTang { get; set; } = true;

        public int SoLuongToiDa { get; set; } = 0;
        public int SoLuongDaDung { get; set; } = 0;
        public bool KichHoat { get; set; } = true;

        public DateTime BatDauAt { get; set; } = DateTime.UtcNow;
        public DateTime KetThucAt { get; set; } = DateTime.UtcNow.AddMonths(1);

        public virtual ICollection<MaGiamGiaKhoaHocModel> DanhSachKhoaHocApDung { get; set; } = new List<MaGiamGiaKhoaHocModel>();
        public virtual ICollection<DonHangKhoaHocModel> DonHangSuDung { get; set; } = new List<DonHangKhoaHocModel>();
    }
}
