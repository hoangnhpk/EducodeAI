using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Models;

namespace educodeai_server.Services.Interface
{
    public interface IKhoaHocService
    {
        Task<KhoaHoc_NoiDungKhoaHocDTO?> GetKhoaHocByIdAsync(int maKhoaHoc, int maNguoiDung);
        Task<bool> LuuTienDoBaiHoc(TienDoBaiHocDTO dto);
        Task<bool> LuuGhiChuBaiHoc(GhiChuBaiHocDTO dto);
        Task<List<GhiChuBaiHocDTO>> GetGhiChuBaiHocAsync(int maBaiHoc, int maNguoiDung);
        Task<bool> LuuKetQuaBaiTap(KetQuaQuizSubmitDTO dto);
        Task<IEnumerable<KhoaHocDto>> GetAllKhoaHocsAsync(int maNguoiDung);
        Task<List<GhiChuAIModel>> LayGhiChuAI(int maNguoiDung);
        Task<bool> LuuGhiChuAI(LuuGhiChuAIRequest yeuCau, int maNguoiDung);
        Task<bool> UpdateGhiChuAI(UpdateGhiChuAIDTO dto);
        Task<bool> DeleteGhiChuAI(int id);
        Task<object> LayThongKeVaDanhSachAsync(int maKhoaHoc, int maNguoiDung);
        Task<bool> TaoDanhGiaMoiAsync(DanhGiaDTO yeuCau);
    }
}
