using educodeai_server.Models;

namespace educodeai_server.Repository.Interface
{
    public interface IKhoaHocCuaToiRepository
    {
        // ===== KHÓA HỌC =====
        Task<List<KhoaHocModel>> GetKhoaHocByGiangVienAsync(int maGiangVien);
        Task<KhoaHocModel?> GetKhoaHocDetailAsync(int maKhoaHoc, int maGiangVien);
        Task AddKhoaHocAsync(KhoaHocModel khoaHoc);
        Task UpdateKhoaHocAsync(KhoaHocModel khoaHoc);
        Task DeleteKhoaHocAsync(KhoaHocModel khoaHoc);

        // ===== CHƯƠNG =====
        Task<ChuongHocModel?> GetChuongByIdAsync(int maChuong);
        Task<ChuongHocModel?> GetChuongWithKhoaHocAsync(int maChuong);

        Task AddChuongAsync(ChuongHocModel chuong);
        Task UpdateChuongAsync(ChuongHocModel chuong);
        Task DeleteChuongAsync(ChuongHocModel chuong);

        // ===== VIDEO =====
        Task<BaiHocModel?> GetBaiHocByIdAsync(int maBaiHoc);
        Task<BaiHocModel?> GetBaiHocWithChuongAsync(int maBaiHoc);

        Task AddBaiHocAsync(BaiHocModel baiHoc);
        Task UpdateBaiHocAsync(BaiHocModel baiHoc);
        Task DeleteBaiHocAsync(BaiHocModel baiHoc);

        Task SaveChangesAsync();
    }
}

