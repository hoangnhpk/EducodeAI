using educodeai_server.DTOs.ThanhToan;

namespace educodeai_server.Services.Interface
{
    public interface IThanhToanKhoaHocService
    {
        Task<ThongTinMuaKhoaHocDTO?> LayThongTinMuaKhoaHocAsync(int maKhoaHoc, int maNguoiDung);
        Task<KetQuaMuaKhoaHocDTO> MuaKhoaHocAsync(YeuCauMuaKhoaHocDTO yeuCau, int maNguoiDung);
        Task<ThongTinMaQRThanhToanDTO> TaoMaQrThanhToanAsync(YeuCauTaoMaQRDTO yeuCau, int maNguoiDung);
        Task<TrangThaiThanhToanDTO> KiemTraTrangThaiThanhToanAsync(int maDonHang, int maNguoiDung);
        Task<bool> XuLyThongBaoSePayAsync(ThongBaoWebhookSePayDTO duLieuWebhook);
    }
}
