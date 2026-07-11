using educodeai_server.DTOs.Media;

namespace educodeai_server.Services.Interface
{
    public interface IMediaService
    {
        Task<ChuKyUploadVideoDTO> LayChuKyUploadVideoAsync(string maGiangVien, string folder);
        Task<bool> KiemTraChuKyWebhookAsync(string body, string timestamp, string signature);
        Task<bool> KiemTraWebhookDaXuLyAsync(string notificationId);
        Task DanhDauWebhookDaXuLyAsync(string notificationId, string notificationType, string payload);
        Task<(bool IsSuccess, string Message)> XuLyWebhookCloudinaryAsync(string payload, string timestamp, string signature);
        Task<bool> DeleteVideoCloudinaryAsync(string publicId);
        Task<bool> LuuThongTinVideoAsync(int maGiangVien, LuuThongTinVideoDTO dto);
        string LayTokenPhatVideo(string publicId);
        Task<bool> GiangVienSoHuuVideoAsync(int maGiangVien, string publicId);
        
        Task<string?> TaiLenPhuDeAsync(Microsoft.AspNetCore.Http.IFormFile file, string folder);
        Task<(bool IsSuccess, string Message)> YeuCauTaoPhuDeAIAsync(int maGiangVien, int maBaiHoc);
    }
}
