using educodeai_server.DTOs.NguoiDung;

namespace educodeai_server.Services.Interface
{
    public interface IHocVienService
    {
        HoSoHocVienDTO GetHoSoHocVien(int maNguoiDung);

        Task<HoSoHocVienDTO> UpdateHoSoHocVien(
            int maNguoiDung,
            UpdateHoSoHocVienDTO dto
        );

        Task<(bool IsSuccess, string Message)> DoiMatKhauAsync(
            int maNguoiDung,
            DoiMatKhauDTO dto
        );
    }
}
