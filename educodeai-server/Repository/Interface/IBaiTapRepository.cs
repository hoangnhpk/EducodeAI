using educodeai_server.DTOs.BaiTap;
using educodeai_server.Models;

namespace educodeai_server.Repository.Interface
{
    public interface IBaiTapRepository
    {
        Task<List<DanhSachBaiTapDTO>> LayDanhSachBaiTapCuaGiangVienAsync(int maNguoiDung);
        Task<int> CreateQuizAsync(BaiTapModel baiTap, BaiTap_QuizModel quiz);
        Task<BaiTap_QuizModel?> GetQuizDetailAsync(int quizId);

        Task<string?> GetNoiDungBaiHocAsync(int maBaiHoc);

        Task<List<KhoaHocModel>> GetKhoaHocModelsByGiangVienAsync(int maGiangVien);
        Task<List<ChuongHocModel>> GetChuongHocModelsByKhoaHocAsync(int maKhoaHoc);
        Task<List<BaiHocModel>> GetBaiHocModelsByChuongHocAsync(int maChuongHoc);

        Task<bool> XoaBaiTapAsync(int maBaiTapQuiz);
    }
}
