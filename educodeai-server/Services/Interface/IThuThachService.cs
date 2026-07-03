using educodeai_server.DTOs.ThuThach;

namespace educodeai_server.Services.Interface
{
    public interface IThuThachService
    {
        Task<ThuThachTuanResponseDTO> LayThuThachTuanAsync(int maNguoiDung);
        Task<NhanThuongResponseDTO> NhanThuongAsync(int maNguoiDung, int maMau);
        Task<ThuThachTuanResponseDTO> DeoDanhHieuAsync(int maNguoiDung, int maDanhHieu);
        Task<BangXepHangResponseDTO> LayBangXepHangTuanAsync(int maNguoiDung, int top = 20);
        Task<BangXepHangResponseDTO> LayBangXepHangToanWebAsync(int maNguoiDung, int top = 50);
    }
}
