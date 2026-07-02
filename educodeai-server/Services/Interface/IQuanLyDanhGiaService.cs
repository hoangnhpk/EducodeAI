using educodeai_server.DTOs.QuanTriVien;

namespace educodeai_server.Services.Interface
{
    public interface IQuanLyDanhGiaService
    {
        Task<ThongKeDanhGiaAdminDTO> LayThongKeAsync(int? maKhoaHoc = null);
        Task<PagedResultDTO<DanhGiaAdminItemDTO>> LayDanhSachAsync(DanhGiaAdminFilterDTO filter);
        Task<bool> CapNhatTrangThaiAsync(int id, string trangThai);
        Task<bool> XoaAsync(int id);
        Task<List<DanhGiaAdminKhoaHocDTO>> LayDanhSachKhoaHocFilterAsync();
        // AI duyệt hàng loạt: lấy tất cả review đang Chờ Duyệt → nhờ Gemini phán xét → cập nhật DB
        Task<KetQuaAIDuyetDTO> DuyetHangLoatBangAIAsync();
    }
}
