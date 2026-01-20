using educodeai_server.DTOs.AI;

namespace educodeai_server.Services.Interface
{
    public interface ILoTrinhAIService
    {
        Task<LoTrinhAIResponseDto> TaoLoTrinhAsync(
        int maNguoiDung,
        CreateLoTrinhAIDto dto);

        // Task<LoTrinhAIResponseDto> CapNhatLoTrinhAsync(
        //     Guid maLoTrinh,
        //     string yeuCauMoi);
    }
}
