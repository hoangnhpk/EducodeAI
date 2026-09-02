using educodeai_server.DTOs.GiangVienChungChi;

namespace educodeai_server.Services.Interface
{
    public interface IGiangVienChungChiService
    {
        Task<IReadOnlyList<DotGuiChungChiGiangVienDTO>> LayDanhSachAsync(int maGiangVien);
        Task<object> GuiYeuCauAsync(int maGiangVien, GuiYeuCauChungChiRequest request);
        Task<object> BoSungAsync(int maGiangVien, Guid maDotGui, BoSungDotChungChiRequest request);
        Task<object> CapNhatHienThiAsync(int maGiangVien, long maTaiLieu, bool hienThiCongKhai);
    }
}
