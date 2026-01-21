using educodeai_server.DTOs.KhoaHoc;

namespace educodeai_server.Services.Interface
{
    public interface IKhoaHocService
    {
        Task<KhoaHoc_NoiDungKhoaHocDTO?> GetKhoaHocByIdAsync(int maKhoaHoc);
    }
}
