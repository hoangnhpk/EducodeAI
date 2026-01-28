using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    [Table("ChuongHoc")]
    public class ChuongHocModel
    {
        [Key] 
        public int MaChuong { get; set; }

        public string TenChuong { get; set; } = null!;
        public int ThuTu { get; set; }

        public int MaKhoaHoc { get; set; }
        public KhoaHocModel KhoaHoc { get; set; } = null!;

        public ICollection<BaiHocModel> BaiHocs { get; set; }
            = new List<BaiHocModel>();
    }
}
