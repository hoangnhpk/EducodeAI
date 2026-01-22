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
    }
}
