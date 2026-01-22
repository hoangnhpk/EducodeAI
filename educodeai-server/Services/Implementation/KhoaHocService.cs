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

        public async Task<KhoaHoc_NoiDungKhoaHocDTO?> GetKhoaHocByIdAsync(int maKhoaHoc, int maNguoiDung)
        {
            var duLieu = await _khoaHocRepository.GetNoiDungKhoaHocAsync(maKhoaHoc, maNguoiDung);

            return duLieu;
        }

        public async Task<bool> LuuTienDoBaiHoc(TienDoBaiHocDTO dto)
        {
            var ketQua = await _khoaHocRepository.LuuTienDoBaiHoc(dto);
            return ketQua;
        }
    }
}
