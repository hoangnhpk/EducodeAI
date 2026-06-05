using educodeai_server.DTOs.ThongKeHocTap;
using educodeai_server.Common;

namespace educodeai_server.Services.Interface
{
    public interface IThongKeHocTapService
    {
        Task<ThongKeOverviewDTO> GetOverviewAsync(int maGiangVien);

        Task<List<TrangThaiHocVienDTO>> GetTrangThaiHocVienAsync(int maGiangVien);

        Task<List<TienDoTheoThoiGianDTO>> GetTienDoTheoThoiGianAsync(int maGiangVien);

        Task<ThuNhapTongQuanDTO> GetThuNhapTongQuanAsync(int maGiangVien);

        Task<List<ThuNhapTheoThoiGianDTO>> GetThuNhapTheoThoiGianAsync(int maGiangVien, string? nhomTheo);

        Task<List<ThuNhapTheoKhoaHocDTO>> GetThuNhapTheoKhoaHocAsync(int maGiangVien, int top);

        Task GuiCanhBaoHocVienNguyCoBoHocAsync(int maGiangVien, int maHocVien);

        Task<PagedResult<HocVienThongKeDTO>> GetHocVienAsync(
            int maGiangVien,
            int page,
            int pageSize,
            string? search
        );
    }
}
