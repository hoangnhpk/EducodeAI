using educodeai_server.DTOs.KhoaHoc;

namespace educodeai_server.Services.Interface
{
    public interface IKhoaHocCuaToiService
    {
        Task<List<DanhSachKhoaHocGiangVienDTO>> GetDanhSachKhoaHocGiangVienAsync(int maGiangVien);
        Task<ChiTietKhoaHocDTO?> GetChiTietKhoaHoc(int maKhoaHoc);
    }
}
