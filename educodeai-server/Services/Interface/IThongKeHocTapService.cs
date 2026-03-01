using educodeai_server.DTOs.ThongKeHocTap;
using educodeai_server.Common;

namespace educodeai_server.Services.Interface
{
    public interface IThongKeHocTapService
    {
        Task<ThongKeOverviewDTO> GetOverviewAsync(int maGiangVien);

        Task<List<TrangThaiHocVienDTO>> GetTrangThaiHocVienAsync(int maGiangVien);

        Task<List<TienDoTheoThoiGianDTO>> GetTienDoTheoThoiGianAsync(int maGiangVien);

        Task<PagedResult<HocVienThongKeDTO>> GetHocVienAsync(
            int maGiangVien,
            int page,
            int pageSize,
            string? search
        );
    }
}
