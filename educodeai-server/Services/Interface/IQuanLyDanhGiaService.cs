using educodeai_server.DTOs.QuanTriVien;

namespace educodeai_server.Services.Interface
{
    public interface IQuanLyDanhGiaService
    {
        Task<ThongKeDanhGiaAdminDTO> LayThongKeAsync();
        Task<PagedResultDTO<DanhGiaAdminItemDTO>> LayDanhSachAsync(DanhGiaAdminFilterDTO filter);
        Task<bool> CapNhatTrangThaiAsync(int id, string trangThai);
        Task<bool> XoaAsync(int id);
    }
}
