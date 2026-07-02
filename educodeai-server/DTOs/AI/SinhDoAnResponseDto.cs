using System.Collections.Generic;

namespace educodeai_server.DTOs.AI
{
    public class SinhDoAnResponseDto
    {
        public string TenDoAn { get; set; }
        public string MoTa { get; set; }
        public List<string> YeuCauChucNang { get; set; }
        public string CauTrucDatabase { get; set; }
    }
}
