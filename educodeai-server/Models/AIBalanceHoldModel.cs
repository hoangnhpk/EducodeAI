using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class AIBalanceHoldModel
    {
        [Key]
        public int Id { get; set; }

        public int MaGiangVien { get; set; }

        public int MaBaiHoc { get; set; }

        [Column(TypeName = "decimal(10,4)")]
        public decimal AmountUsd { get; set; }

        [Required]
        [StringLength(20)]
        public required string Status { get; set; } // holding | committed | released

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SettledAt { get; set; }
    }
}
