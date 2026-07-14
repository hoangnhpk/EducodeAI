using educodeai_server.DTOs.XacThuc;

namespace educodeai_server.Services.Interface
{
    public interface IGiayToScanningService
    {
        /// <summary>
        /// Quét OCR 2 mặt CCCD/Giấy tờ bằng Gemini Vision
        /// </summary>
        Task<GiayToScanningResponse> QuetGiayToAsync(GiayToScanningRequest request);
    }
}
