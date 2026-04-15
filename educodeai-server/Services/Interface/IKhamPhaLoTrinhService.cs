using educodeai_server.DTOs.HocVien;

namespace educodeai_server.Services.Interface
{
    public interface IKhamPhaLoTrinhService
    {
        // 1. Hàm lấy danh sách lộ trình (kèm tìm kiếm và phân trang)
        Task<PagedResultDto<LoTrinhKhamPhaDto>> LayDanhSachAsync(string tuKhoa, int pageIndex, int pageSize);

        // 2. Hàm lấy chi tiết một lộ trình (để bóc tách JSON hiện lên Modal)
        Task<LoTrinhChiTietDto?> LayChiTietLoTrinhAsync(int maLoTrinh);

        // 3. Hàm lưu lộ trình gốc của Giảng viên/AI vào kho của Học viên
        Task<bool> LuuLoTrinhVaoTaiKhoanAsync(int maLoTrinhGoc, int maHocVien);
    }
}