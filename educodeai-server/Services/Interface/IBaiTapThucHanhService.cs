using educodeai_server.DTOs.BaiTapThucHanh;

namespace educodeai_server.Services.Interface
{
    public interface IBaiTapThucHanhService
    {
        Task<List<KhoaHocTreeDto>> GetCayDuLieuAsync(int maGiangVien);
        Task<BaiTapThucHanhPreviewDto> GeneratePracticeExerciseAsync(TaoBaiTapThucHanhAiRequestDto request, int maGiangVien);
        Task<BaiTapThucHanhPreviewDto> CreatePracticeExerciseAsync(BaiTapThucHanhPreviewDto dto, int maBaiHoc, int maGiangVien);
        Task<BaiTapThucHanhPreviewDto> GetDetailAsync(int maBaiTap, int maGiangVien);
        Task<bool> UpdateAsync(int maBaiTap, BaiTapThucHanhPreviewDto dto, int maGiangVien);
        Task<bool> DeleteAsync(int maBaiTap, int maGiangVien);
    }
}
