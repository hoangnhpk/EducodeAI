using educodeai_server.DTOs.ThongKeAdmin;

namespace educodeai_server.Services.Interface
{
    public interface IThongKeAdminService
    {
        Task<ThongKeTongQuanDTO> LayTongQuanAsync();
        Task<List<DangKyTheoThangDTO>> LayDangKyTheo12ThangAsync();
        Task<List<DangKyTheoThangDTO>> LayDangKyTheoKhoangThangAsync(DateTime fromUtc, DateTime toUtcExclusive);
        Task<List<TopKhoaHocDangKyDTO>> LayTopKhoaHocDangKyAsync(DateTime fromUtc, DateTime toUtcExclusive, int top = 5);
        Task<List<TopGiangVienDangKyDTO>> LayTopGiangVienDangKyAsync(DateTime fromUtc, DateTime toUtcExclusive, int top = 5);
        Task<HoatDongHeThongDTO> LayHoatDongHeThongAsync(DateTime fromUtc, DateTime toUtcExclusive);
        Task<List<ChatLuongKhoaHocItemDTO>> LayChatLuongKhoaHocAsync(DateTime fromUtc, DateTime toUtcExclusive, int top = 10);

        Task<PagedResultDTO<HocVienItemDTO>> LayDanhSachHocVienAsync(int page, int pageSize, string? search);
        Task<PagedResultDTO<GiangVienItemDTO>> LayDanhSachGiangVienAsync(int page, int pageSize, string? search);
        Task<PagedResultDTO<KhoaHocItemDTO>> LayDanhSachKhoaHocAsync(int page, int pageSize, string? search);
        Task<PagedResultDTO<DangKyItemDTO>> LayDanhSachDangKyAsync(int page, int pageSize, string? search);
    }
}
