using educodeai_server.Common;
using educodeai_server.DTOs.NguoiDung;

namespace educodeai_server.Services.Interface
{
    public interface IQuanLyHocVienService
    {
        Task<PagedResult<ChiTietHocVienDTO>> LayDanhSachHocVienAsync(HocVienFilterDTO filter);
        Task<bool> ThemHocVienAsync(ThemNguoiDungDTO dto);
        Task<bool> SuaHocVienAsync(int id, CapNhatNguoiDungDTO dto);
        Task<bool> XoaHocVienAsync(int id);
    }
}