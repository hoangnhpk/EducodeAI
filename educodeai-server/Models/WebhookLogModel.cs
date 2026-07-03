using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace educodeai_server.Models
{
    public class WebhookLogModel
    {
        [Key]
        [StringLength(128)]
        public required string NotificationId { get; set; }

        [Required]
        [StringLength(50)]
        public required string NotificationType { get; set; }

        [Required]
        [Column(TypeName = "jsonb")]
        public required string Payload { get; set; }

        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    }
}
