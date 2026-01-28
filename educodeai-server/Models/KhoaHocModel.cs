using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    [Table("KhoaHoc")]
    public class KhoaHocModel
    {
        [Key]
        public int MaKhoaHoc { get; set; }

        public string TenKhoaHoc { get; set; } = null!;
        public string? MoTa { get; set; }

        
        public string? HinhAnh { get; set; }

        public string TrangThai { get; set; } = "Hoạt động";
        public string LinhVuc { get; set; } = "";
        public double DiemDanhGiaTB { get; set; }


        public int MaGiangVien { get; set; }
        public NguoiDungModel GiangVien { get; set; } = null!;

        [StringLength(50)]
        public string TrinhDo { get; set; } = null!;  // Người mới, Trung cấp, Nâng cao

        public int ThoiLuongGio { get; set; }  // Tổng số giờ học

        [StringLength(500)]
        public string KyNangChinh { get; set; } = null!;  // Ví dụ: ["C#","SQL","REACT"]

        public DateTime NgayTao { get; set; } = DateTime.Now;

        // Navigation
        public virtual ICollection<ChuongHocModel> ChuongHocs { get; set; } = null!;
        public virtual ICollection<DangKyKhoaHocModel> DangKyKhoaHocs { get; set; } = null!;
        public virtual ICollection<DanhGiaModel> DanhGias { get; set; } = null!;
    }
}
