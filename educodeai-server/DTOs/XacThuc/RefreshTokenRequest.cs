using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.XacThuc;

public sealed class RefreshTokenRequest
{
    [Required]
    public string MaThietBi { get; set; } = string.Empty;
}
