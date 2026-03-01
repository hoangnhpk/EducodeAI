using educodeai_server.DTOs;

namespace educodeai_server.Services.Interface
{
    public interface IKhoaHocCuaToiService
    {
        Task<List<KhoaHocGiangVienListDTO>> GetDanhSachKhoaHocAsync(int maGiangVien);
        Task<KhoaHocGiangVienDetailDTO?> GetChiTietKhoaHocAsync(int maKhoaHoc, int maGiangVien);

        Task<bool> TaoKhoaHocAsync(int maGiangVien, KhoaHocCreateUpdateDTO dto);
        Task<bool> CapNhatKhoaHocAsync(int maKhoaHoc, int maGiangVien, KhoaHocCreateUpdateDTO dto);
        Task<bool> XoaKhoaHocAsync(int maKhoaHoc, int maGiangVien);
        Task<ThemChuongResponseDTO> ThemChuongAsync(int maKhoaHoc, ChuongHocCreateUpdateDTO dto);
        Task<bool> CapNhatChuongAsync(int maChuong, int maGiangVien, ChuongHocCreateUpdateDTO dto);
        Task<bool> XoaChuongAsync(int maChuong, int maGiangVien);
        Task<ThemVideoResponseDTO> ThemVideoAsync(int maChuong, int maGiangVien, BaiHocVideoCreateUpdateDTO dto);
        Task<bool> CapNhatVideoAsync(int maBaiHoc, int maGiangVien, BaiHocVideoCreateUpdateDTO dto);
        Task<bool> XoaVideoAsync(int maBaiHoc, int maGiangVien);
    }
}
