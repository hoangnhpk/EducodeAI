using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class GiangVienQuotaModel
    {
        [Key]
        public int MaGiangVien { get; set; }

        public long StorageUsedMb { get; set; } = 0;
        
        public long StorageLimitMb { get; set; } = 51200; // Mặc định 50GB
        
        [Column(TypeName = "decimal(10,4)")]
        public decimal AiBalanceUsd { get; set; } = 0;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
