using educodeai_server.Models;

public interface IQuanLyNguoiDungRepository
{
    Task<List<NguoiDungModel>> LayTatCaAsync();
    Task<NguoiDungModel?> LayTheoIdAsync(int MaNguoiDung);
    Task<bool> ThemMoiAsync(NguoiDungModel nguoiDung);
    Task<bool> CapNhatAsync(NguoiDungModel nguoiDung);
    Task<bool> XoaAsync(NguoiDungModel nguoiDung);
}
