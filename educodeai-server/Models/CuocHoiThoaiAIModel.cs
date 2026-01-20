using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class CuocHoiThoaiAIModel {
        [Key]
        public int MaHoiThoai { get; set; }

        public int MaNguoiDung { get; set; }
        [ForeignKey("MaNguoiDung")]
        public virtual NguoiDungModel NguoiDung { get; set; } = null!;

        public DateTime NgayTao { get; set; } = DateTime.Now;

        // Navigation
        public virtual ICollection<TinNhanAIModel> TinNhanAIs { get; set; } = null!;
    }
}
