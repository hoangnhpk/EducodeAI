using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    [Table("BaiHoc")]
    public class BaiHocModel
    {
        [Key]
        public int MaBaiHoc { get; set; }

        public string TieuDe { get; set; } = null!;
        public string LoaiBaiHoc { get; set; } = "";
        public string? NoiDung { get; set; }
        public int ThoiLuong { get; set; }
        public int ThuTu { get; set; }
        public string? LinkVideo { get; set; }

        // Navigation
        public virtual ICollection<BaiTapModel> BaiTaps { get; set; } = null!;
        public virtual ICollection<TienDoBaiHocModel> TienDoBaiHocs { get; set; } = null!;
        public virtual ICollection<BinhLuanModel> BinhLuans { get; set; } = null!;
        public virtual ICollection<GhiChuBaiHocModel> GhiChuBaiHocs { get; set; } = null!;
    }
}
