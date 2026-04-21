using educodeai_server.Models;
using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.KhoaHoc;

namespace educodeai_server.Repository.Interface
{
    public interface IKhoaHocRepository
    {
        // 1. Thêm hàm này để lấy danh sách cho trang chủ
        Task<IEnumerable<KhoaHocDto>> GetAllKhoaHocsAsync(int maNguoiDung);

        // 2. Các hàm AI và tìm kiếm
        Task<List<KhoaHocAISnapshotDto>> GetKhoaHocPhuHopAsync(CreateLoTrinhAIDto dto);
        Task<List<KhoaHocAISnapshotDto>> GetKhoaHocTheoKeywordAsync(List<string> keywords);

        // 3. Nội dung chi tiết và quản lý khóa học
        Task<KhoaHoc_NoiDungKhoaHocDTO?> GetNoiDungKhoaHocAsync(int maKhoaHoc, int maNguoiDung);
        Task<KhoaHocModel?> GetKhoaHocWithDetailsAsync(int maKhoaHoc);
        Task<List<KhoaHocModel>> GetKhoaHocsByGiangVienAsync(int maGiangVien);

        // 4. Tiến độ, ghi chú và bài tập
        Task<bool> LuuTienDoBaiHoc(TienDoBaiHocDTO dto);
        Task<bool> LuuGhiChuBaiHoc(GhiChuBaiHocDTO dto);
        Task<List<GhiChuBaiHocDTO>> GetGhiChuBaiHocAsync(int maBaiHoc, int maNguoiDung);
        Task<bool> LuuKetQuaBaiTap(KetQuaQuizSubmitDTO dto);
        Task<KetQuaNopBaiKiemTraChungChiDTO> NopBaiKiemTraChungChiAsync(NopBaiKiemTraChungChiDTO dto);
        Task CapNhatTrangThaiGuiEmailChungChiAsync(int maKhoaHoc, int maNguoiDung, bool trangThai);

        Task<List<int>> GetMaKhoaHocDaDangKyAsync(int maNguoiDung,List<int> danhSachMaKhoaHoc);

        Task<List<DangKyKhoaHocModel>> GetDangKyKhoaHocAsync(int maNguoiDung);

        Task AddDangKyKhoaHocAsync(List<DangKyKhoaHocModel> dangKyKhoaHocs);
        Task<List<GhiChuAIModel>> LayDanhSachGhiChuAI(int maNguoiDung);
        Task<bool> LuuGhiChuAI(GhiChuAIModel duLieu);
        Task<bool> UpdateGhiChuAI(int id, string noiDung);
        Task<bool> DeleteGhiChuAI(int id);
        Task<List<DanhGiaModel>> LayDanhSachTheoKhoaHocAsync(int maKhoaHoc, int maNguoiDung);
        Task<bool> KiemTraDaDanhGiaAsync(int maKhoaHoc, int maNguoiDung);
        Task<bool> ThemDanhGiaAsync(DanhGiaModel danhGia);
        Task<bool> KiemTraHoanThanhKhoaHocAsync(int maKhoaHoc, int maNguoiDung);
    }
}
