using System.Collections.Generic;
using educodeai_server.DTOs.RutTienGiangVien;
using educodeai_server.DTOs.ThanhToan;

namespace educodeai_server.Services.Interface
{
    public interface IRutTienGiangVienService
    {
        Task<IReadOnlyList<NganHangItemDTO>> LayDanhMucNganHangAsync();
        Task<ThongTinViGiangVienDTO> LayThongTinViAsync(int maGiangVien);
        Task<ThongTinViGiangVienDTO> ThemTaiKhoanNhanTienAsync(int maGiangVien, CapNhatTaiKhoanRutTienDTO yeuCau);
        Task<ThongTinViGiangVienDTO> XoaTaiKhoanNhanTienAsync(int maGiangVien);
        Task<YeuCauRutTienChiTietDTO> TaoYeuCauRutTienAsync(int maGiangVien, YeuCauRutTienDTO yeuCau);
        Task<List<YeuCauRutTienChiTietDTO>> LayLichSuRutTienCuaGiangVienAsync(int maGiangVien);
        Task<List<YeuCauRutTienChiTietDTO>> LayDanhSachChoDoiSoatAsync(string? trangThai);
        Task<YeuCauRutTienChiTietDTO> LayChiTietChoQuanTriAsync(int maYeuCauRutTien);
        Task<YeuCauRutTienChiTietDTO> DuyetYeuCauVaTaoQrAsync(int maYeuCauRutTien, int maQuanTriVien, DuyetYeuCauRutTienDTO? yeuCau);
        Task<YeuCauRutTienChiTietDTO> XacNhanDaChuyenKhoanThuCongAsync(int maYeuCauRutTien, int maQuanTriVien);
        Task<YeuCauRutTienChiTietDTO> TuChoiYeuCauAsync(int maYeuCauRutTien, int maQuanTriVien, TuChoiYeuCauRutTienDTO yeuCau);
        Task<bool> XuLyWebhookRutTienAsync(ThongBaoWebhookSePayDTO duLieuWebhook);
    }
}
