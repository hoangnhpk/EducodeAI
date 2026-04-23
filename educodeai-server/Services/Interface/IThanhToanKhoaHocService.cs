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
        Task<HoTroThanhToanChiTietDTO> TaoYeuCauHoTroThanhToanAsync(int maDonHang, int maNguoiDung, YeuCauHoTroThanhToanDTO yeuCau);
        Task<IReadOnlyList<HoTroThanhToanDanhSachItemDTO>> LayDanhSachYeuCauHoTroChoAdminAsync(string? trangThai, string? tuKhoa);
        Task<HoTroThanhToanChiTietDTO> LayChiTietYeuCauHoTroChoAdminAsync(int maGiaoDichHoTro);
        Task<HoTroThanhToanChiTietDTO> ChapThuanYeuCauHoTroAsync(int maGiaoDichHoTro, int maQuanTriVien, XuLyYeuCauHoTroThanhToanDTO yeuCau);
        Task<HoTroThanhToanChiTietDTO> TuChoiYeuCauHoTroAsync(int maGiaoDichHoTro, int maQuanTriVien, XuLyYeuCauHoTroThanhToanDTO yeuCau);
    }
}
