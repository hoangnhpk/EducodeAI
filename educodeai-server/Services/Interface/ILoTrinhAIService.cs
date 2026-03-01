using educodeai_server.DTOs.AI;

namespace educodeai_server.Services.Interface
{
    public interface ILoTrinhAIService
    {
        Task<LoTrinhAIResponseDto> TaoLoTrinhAsync(
        int maNguoiDung,
        CreateLoTrinhAIDto dto);

        Task<LoTrinhAIResponseDto> CapNhatLoTrinhAsync(
            int maNguoiDung,
            UpdateLoTrinhDto dto);

        Task<bool> XacNhanLoTrinhAsync(int maLoTrinh, int maNguoiDung);

        Task<List<LoTrinhAICuaToiResponseDTO>?> GetLoTrinhCuaToiAsync(int maNguoiDung);
        Task<LoTrinhAICuaToiResponseDTO?> GetChiTietLoTrinhAsync(int maLoTrinh, int maNguoiDung);
    }
}
