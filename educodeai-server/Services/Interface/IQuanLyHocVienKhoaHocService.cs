using educodeai_server.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace educodeai_server.Services.Interface
{
    public interface IQuanLyHocVienKhoaHocService
    {
        Task<List<KhoaHocCuaGiangVienDTO>> LayDanhSachKhoaHocAsync(int maGiangVien);
        Task<List<ChiTietHocVienTrongKhoaDTO>> LayDanhSachHocVienAsync(int maGiangVien, int? maKhoaHoc, string? search);
        Task<TienDoKhoaHocHocVienDTO> LayTienDoChiTietAsync(int maKhoaHoc, int maNguoiDung);
        Task<IEnumerable<object>> LayCacKhoaHocCuaHocVienAsync(int maNguoiDung, int maGiangVien);
    }
}