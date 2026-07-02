using educodeai_server.DTOs.QuaTang;

namespace educodeai_server.Services.Interface
{
    public interface IQuaTangKhoaHocService
    {
        Task<KetQuaTangKhoaHocDTO> GiangVienTangHocVienAsync(int maGiangVien, TangKhoaHocDTO yeuCau);
        Task<KetQuaTangKhoaHocDTO> AdminTangHocVienAsync(int maQuanTriVien, TangKhoaHocDTO yeuCau);
        Task<IReadOnlyList<QuaTangKhoaHocItemDTO>> LayLichSuQuaTangCuaGiangVienAsync(int maGiangVien, int? maKhoaHoc, string? tuKhoa);
        Task<IReadOnlyList<QuaTangKhoaHocItemDTO>> LayLichSuQuaTangChoAdminAsync(string? tuKhoa);
        Task<IReadOnlyList<KhoaHocTangOptionDTO>> LayKhoaHocCoTheTangChoHocVienAsync(int maNguoiNhan);
        Task<IReadOnlyList<KhoaHocTangOptionDTO>> LayKhoaHocCuaGiangVienDeTangAsync(int maGiangVien);
        Task<IReadOnlyList<HocVienTangOptionDTO>> LayHocVienCoTheNhanQuaAsync(int maGiangVien, int maKhoaHoc, string? tuKhoa);
    }
}
