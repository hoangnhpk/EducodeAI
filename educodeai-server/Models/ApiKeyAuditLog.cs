using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class ApiKeyAuditLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Action { get; set; } = string.Empty;

        public int AdminId { get; set; }

        public int KeyApiId { get; set; }

        public string? BeforeJson { get; set; }

        public string? AfterJson { get; set; }

        public string? MetadataJson { get; set; }

        [StringLength(50)]
        public string? IpAddress { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
