using educodeai_server.DTOs.KhoaHoc;
using educodeai_server.Repository.Interface;
using educodeai_server.Services.Interface;

namespace educodeai_server.Services.Implementation
{
    public class KhoaHocService : IKhoaHocService
    {
        private readonly IKhoaHocRepository _khoaHocRepository;

        public KhoaHocService(IKhoaHocRepository khoaHocRepository)
        {
            _khoaHocRepository = khoaHocRepository;
        }

        // ============================================================
        // ĐÂY LÀ HÀM BẠN ĐANG THIẾU - COPY CHÍNH XÁC DÒNG NÀY
        // ============================================================
        public async Task<IEnumerable<KhoaHocDto>> GetAllKhoaHocsAsync()
        {
            return await _khoaHocRepository.GetAllKhoaHocsAsync();
        }

        // ============================================================
        // CÁC HÀM CÒN LẠI GIỮ NGUYÊN
        // ============================================================
        public async Task<KhoaHoc_NoiDungKhoaHocDTO?> GetKhoaHocByIdAsync(int maKhoaHoc, int maNguoiDung)
        {
            return await _khoaHocRepository.GetNoiDungKhoaHocAsync(maKhoaHoc, maNguoiDung);
        }

        public async Task<bool> LuuTienDoBaiHoc(TienDoBaiHocDTO dto)
        {
            return await _khoaHocRepository.LuuTienDoBaiHoc(dto);
        }

        public async Task<bool> LuuGhiChuBaiHoc(GhiChuBaiHocDTO dto)
        {
            return await _khoaHocRepository.LuuGhiChuBaiHoc(dto);
        }

        public async Task<List<GhiChuBaiHocDTO>> GetGhiChuBaiHocAsync(int maBaiHoc, int maNguoiDung)
        {
            return await _khoaHocRepository.GetGhiChuBaiHocAsync(maBaiHoc, maNguoiDung);
        }

        public async Task<bool> LuuKetQuaBaiTap(KetQuaQuizSubmitDTO dto)
        {
            return await _khoaHocRepository.LuuKetQuaBaiTap(dto);
        }
    }
}