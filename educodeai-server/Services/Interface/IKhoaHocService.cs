using educodeai_server.DTOs.KhoaHoc;

namespace educodeai_server.Services.Interface
{
    public interface IKhoaHocService
    {
        Task<List<ChuongHocDTO>> GetKhoaHocByIdAsync(int maKhoaHoc);
    }
}
