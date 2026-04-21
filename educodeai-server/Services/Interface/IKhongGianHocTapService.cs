using educodeai_server.DTOs;

namespace educodeai_server.Services.Interface
{
    public interface IKhongGianHocTapService
    {
        Task<List<KhongGianHocTapItemDTO>> LayDanhSachTheoNguoiDungAsync(int maNguoiDung);
    }
}
