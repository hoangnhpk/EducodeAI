using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace educodeai_server.Models
{
    public class NhatKySuDungModel
    {
        [Key]
        public long ID { get; set; }

        public int ID_Key { get; set; }

        public int SoTokenTieuHao { get; set; }

        public DateTime ThoiGianGoi { get; set; } = DateTime.UtcNow;

        public int MaTrangThai { get; set; } // 200, 429, 500...

        [StringLength(255)]
        public string DuongDanAPI { get; set; } = string.Empty;

        // Navigation property
        [ForeignKey("ID_Key")]
        public virtual KeyAPIModel KeyAPI { get; set; } = null!;
    }
}
