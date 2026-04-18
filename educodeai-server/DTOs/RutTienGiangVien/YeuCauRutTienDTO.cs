using System.ComponentModel.DataAnnotations;

namespace educodeai_server.DTOs.RutTienGiangVien
{
    public class YeuCauRutTienDTO
    {
        [Range(10000, 1000000000)]
        public decimal SoTienYeuCau { get; set; }
    }
}
