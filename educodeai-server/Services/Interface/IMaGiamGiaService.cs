using educodeai_server.DTOs.MaGiamGia;

namespace educodeai_server.Services.Interface
{
    public interface IMaGiamGiaService
    {
        Task<MaGiamGiaItemDTO> TaoMaGiamGiaChoAdminAsync(TaoMaGiamGiaDTO yeuCau, int maAdmin);
        Task<MaGiamGiaItemDTO> TaoMaGiamGiaChoGiangVienAsync(TaoMaGiamGiaDTO yeuCau, int maGiangVien);
        Task<IReadOnlyList<MaGiamGiaItemDTO>> LayDanhSachChoAdminAsync();
        Task<IReadOnlyList<MaGiamGiaItemDTO>> LayDanhSachChoGiangVienAsync(int maGiangVien);
        Task<IReadOnlyList<KhoaHocApDungOptionDTO>> LayKhoaHocChoAdminAsync();
        Task<IReadOnlyList<KhoaHocApDungOptionDTO>> LayKhoaHocChoGiangVienAsync(int maGiangVien);
    }
}
