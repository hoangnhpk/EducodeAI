using educodeai_server.DTOs.AI;
using System.Threading.Tasks;

namespace educodeai_server.Services.Interface
{
    public interface ISinhDoAnAIService
    {
        // === CHỨC NĂNG CŨ ===
        Task<SinhDoAnResponseDto> GenerateDoAnAsync(int maNguoiDung, SinhDoAnRequestDto request);

        // === TRẠM HỎI CUNG (dùng MemoryCache, không cần DB/migration) ===
        Task<NopDoAnResponseDto> NopDoAnAsync(int maNguoiDung, NopDoAnRequestDto request);
        Task<TraLoiPhongVanResponseDto> TraLoiPhongVanAsync(int maNguoiDung, TraLoiPhongVanRequestDto request);
        Task<KetQuaPhongVanDto> LayKetQuaPhongVanAsync(int maDoAn, int maNguoiDung, string? sessionId = null);
        
        // === CHẤM ĐIỂM THEO GIAI ĐOẠN ===
        Task<ChamDiemTinhNangResponseDto> ChamDiemTinhNangAsync(int maNguoiDung, ChamDiemTinhNangRequestDto request);

        // === QUẢN LÝ CHỨNG CHỈ ===
        Task<System.Collections.Generic.List<ChungChiThucChienDto>> LayDanhSachChungChiAsync(int maNguoiDung);
    }
}
