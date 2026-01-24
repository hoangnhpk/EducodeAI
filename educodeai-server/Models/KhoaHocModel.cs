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
        public string TrinhDo { get; set; } = "";
        public string LinhVuc { get; set; } = "";
        public string KyNangChinh { get; set; } = "";
        public int ThoiLuongGio { get; set; }

        
        public double DiemDanhGiaTB { get; set; }

        public DateTime NgayTao { get; set; }

        public int MaGiangVien { get; set; }
        public NguoiDungModel GiangVien { get; set; } = null!;

        public ICollection<ChuongHocModel> ChuongHocs { get; set; }
            = new List<ChuongHocModel>();
    }
}
