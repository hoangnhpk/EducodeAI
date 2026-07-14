using educodeai_server.DTOs.NapTienAI;

namespace educodeai_server.Services.Interface
{
    public interface INapTienAIService
    {
        Task<ThongTinViAIDTO> LayThongTinViAIAsync(int maGiangVien);
        Task<KetQuaNapTienAIDTO> NapTienVaoViAIAsync(int maGiangVien, YeuCauNapTienAIDTO yeuCau);
        Task<List<LichSuNapTienAIItemDTO>> LayLichSuNapTienAIAsync(int maGiangVien);
    }
}
