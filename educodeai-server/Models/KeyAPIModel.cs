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

        // [DEPRECATED - Phase 7A] Sẽ xóa sau khi migrate xong sang RPMLimit/RPDLimit
        public int HanMucRequest { get; set; } = 0;

        // [DEPRECATED - Phase 7A] Sẽ xóa sau khi migrate xong sang TPMLimit
        public int HanMucToken { get; set; } = 0;

        // === Phase 7A: Rate Limit mới ===
        // Gemini free tier thường: 15 RPM, 1,000,000 TPM, 1500 RPD
        public int RPMLimit { get; set; } = 15;        // Request Per Minute

        public int TPMLimit { get; set; } = 1000000;   // Token Per Minute

        public int RPDLimit { get; set; } = 1500;      // Request Per Day (reset 00:00 UTC)

        // Model AI sẽ sử dụng cho key này (VD: "models/gemini-2.5-pro")
        public string ModelSuDung { get; set; } = string.Empty;

        public DateTime NgayTao { get; set; } = DateTime.UtcNow;

        public DateTime? DeletedAt { get; set; }
        public int? DeletedBy { get; set; }
        public DateTime? LastUsageResetAt { get; set; }

        // Relationship: Một Key có nhiều Nhật ký sử dụng
        public virtual ICollection<NhatKySuDungModel> NhatKySuDungs { get; set; } = new List<NhatKySuDungModel>();
    }
}
