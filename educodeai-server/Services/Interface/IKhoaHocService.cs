using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Models;

namespace educodeai_server.Services.Interface
{
    public interface IKhoaHocService
    {
        Task<List<KhoaHocModel>> GetAllKhoaHocsAsync();
        Task<KhoaHoc_NoiDungKhoaHocDTO?> GetKhoaHocByIdAsync(int maKhoaHoc, int maNguoiDung);
        Task<bool> LuuTienDoBaiHoc(TienDoBaiHocDTO dto);
    }
}
