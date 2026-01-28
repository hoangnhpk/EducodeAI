using educodeai_server.DTOs.KhoaHoc;

namespace educodeai_server.Services.Interface
{
    public interface IKhoaHocService
    {
        Task<KhoaHoc_NoiDungKhoaHocDTO?> GetKhoaHocByIdAsync(int maKhoaHoc, int maNguoiDung);
        Task<bool> LuuTienDoBaiHoc(TienDoBaiHocDTO dto);
        Task<bool> LuuGhiChuBaiHoc(GhiChuBaiHocDTO dto);
        Task<List<GhiChuBaiHocDTO>> GetGhiChuBaiHocAsync(int maBaiHoc, int maNguoiDung);
        Task<bool> LuuKetQuaBaiTap(KetQuaQuizSubmitDTO dto);
    }
}
