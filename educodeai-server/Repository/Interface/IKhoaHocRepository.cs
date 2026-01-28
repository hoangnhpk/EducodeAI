using educodeai_server.Models;
using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.KhoaHoc;

namespace educodeai_server.Repository.Interface
{
    public interface IKhoaHocRepository
    {
        Task<List<KhoaHocAISnapshotDto>> GetKhoaHocPhuHopAsync(CreateLoTrinhAIDto dto);
        Task<KhoaHoc_NoiDungKhoaHocDTO?> GetNoiDungKhoaHocAsync(int maKhoaHoc, int maNguoiDung);
        Task<List<KhoaHocAISnapshotDto>> GetKhoaHocTheoKeywordAsync(List<string> keywords);
        Task<bool> LuuTienDoBaiHoc(TienDoBaiHocDTO dto);
        Task<KhoaHocModel?> GetKhoaHocWithDetailsAsync(int maKhoaHoc);
        Task<List<KhoaHocModel>> GetKhoaHocsByGiangVienAsync(int maGiangVien);
        Task<List<KhoaHocModel>> GetAllKhoaHocsAsync();
        Task<bool> LuuGhiChuBaiHoc(GhiChuBaiHocDTO dto);
        Task<List<GhiChuBaiHocDTO>> GetGhiChuBaiHocAsync(int maBaiHoc, int maNguoiDung);
        Task<bool> LuuKetQuaBaiTap(KetQuaQuizSubmitDTO dto);
    }
}
