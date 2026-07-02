using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class BaiTapModel {
        [Key]
        public int MaBaiTap { get; set; }

        public int MaBaiHoc { get; set; }

        [ForeignKey("MaBaiHoc")]
        public virtual BaiHocModel BaiHoc { get; set; } = null!;

        public virtual ICollection<KetQuaLamBaiModel> KetQuaBaiTaps { get; set; } = null!;
        public virtual BaiTapThucHanhModel BaiTapThucHanh { get; set; } = null!;
        public virtual BaiTap_QuizModel BaiTap_Quiz { get; set; } = null!;
    }
}
