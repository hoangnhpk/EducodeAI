using educodeai_server.DTOs;

namespace educodeai_server.Services.Interface
{
    public interface IKhoaHocCuaToiService
    {
        Task<List<KhoaHocGiangVienListDTO>> GetDanhSachKhoaHocAsync(int maGiangVien);
        Task<KhoaHocGiangVienDetailDTO?> GetChiTietKhoaHocAsync(int maKhoaHoc, int maGiangVien);

        Task<int> TaoKhoaHocAsync(int maGiangVien, KhoaHocCreateUpdateDTO dto);
        Task<bool> CapNhatKhoaHocAsync(int maKhoaHoc, int maGiangVien, KhoaHocCreateUpdateDTO dto);
        Task<bool> XoaKhoaHocAsync(int maKhoaHoc, int maGiangVien);
        Task<bool> KhoiPhucKhoaHocAsync(int maKhoaHoc, int maGiangVien);
        Task<ThemChuongResponseDTO> ThemChuongAsync(int maKhoaHoc, int maGiangVien, ChuongHocCreateUpdateDTO dto);
        Task<bool> CapNhatChuongAsync(int maChuong, int maGiangVien, ChuongHocCreateUpdateDTO dto);
        Task<bool> XoaChuongAsync(int maChuong, int maGiangVien);
        Task<ThemVideoResponseDTO> ThemVideoAsync(int maChuong, int maGiangVien, BaiHocVideoCreateUpdateDTO dto);
        Task<bool> CapNhatVideoAsync(int maBaiHoc, int maGiangVien, BaiHocVideoCreateUpdateDTO dto);
        Task<bool> XoaVideoAsync(int maBaiHoc, int maGiangVien, string webRootPath);
        
        Task<ThemFileResponseDTO> ThemFileAsync(int maChuong, int maGiangVien, BaiHocFileCreateUpdateDTO dto, string webRootPath);
        Task<bool> CapNhatFileAsync(int maBaiHoc, int maGiangVien, BaiHocFileCreateUpdateDTO dto, string webRootPath);

        Task<KetQuaTaoDeChungChiAIDTO> TaoDeChungChiBangAIAsync(int maKhoaHoc, int maGiangVien);

        // YouTube Playlist Import
        Task<YouTubePlaylistAnalyzeResponseDTO> AnalyzePlaylistAsync(string playlistUrl);
        Task<YouTubePlaylistVideosResponseDTO> GetPlaylistVideosAsync(string playlistId);
        Task<YouTubePlaylistImportResponseDTO> ImportPlaylistAsync(int maKhoaHoc, int maGiangVien, YouTubePlaylistImportRequestDTO request);
        Task<YouTubeVideoInfoResponseDTO> GetVideoInfoAsync(string videoUrl);

        // Reorder Functionality
        Task<bool> ReorderChaptersAsync(int maGiangVien, int maKhoaHoc, List<ChapterReorderDTO> chapters);
        Task<bool> ReorderLessonsAsync(int maGiangVien, int maChuong, List<LessonReorderDTO> lessons);

        // Certificate Config
        Task<CertificateConfigDTO?> GetCertificateConfigAsync(int maKhoaHoc, int maGiangVien);
        Task<bool> UpdateCertificateConfigAsync(int maKhoaHoc, int maGiangVien, CertificateConfigDTO config);
        Task<bool> EnableCertificateAsync(int maKhoaHoc, int maGiangVien);
        Task<bool> DisableCertificateAsync(int maKhoaHoc, int maGiangVien);

        // Edit Certificate Quiz
        Task<List<CauHoiChungChiDTO>> GetDeChungChiAsync(int maKhoaHoc, int maGiangVien);
        Task<bool> UpdateDeChungChiAsync(int maKhoaHoc, int maGiangVien, List<CauHoiChungChiDTO> danhSachCauHoi);
    }
}

