using System.ComponentModel.DataAnnotations;

namespace educodeai_server.Models
{
    public class KeyAPIModel
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [StringLength(100)]
        public string TenKey { get; set; } = string.Empty;

        [Required]
        public string MaKeyMaHoa { get; set; } = string.Empty; // Mã hóa của key thực tế

        [Required]
        [StringLength(20)]
        public string LoaiKey { get; set; } = "Chính"; // "Chinh" hoặc "Phu"

        public bool TrangThai { get; set; } = true;

        public int ThuTuUuTien { get; set; } = 0;

        public int HanMucRequest { get; set; } = 5000;

        public int HanMucToken { get; set; } = 2000000;

        public DateTime NgayTao { get; set; } = DateTime.Now;

        // Relationship: Một Key có nhiều Nhật ký sử dụng
        public virtual ICollection<NhatKySuDungModel> NhatKySuDungs { get; set; } = new List<NhatKySuDungModel>();
    }
}
