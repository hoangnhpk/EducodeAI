using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Models;

namespace educodeai_server.Services.Interface
{
    public interface INguoiDungService
    {
        Task<NguoiDungModel?> CheckLoginAsync(string identifier, string password);
        Task<bool> RegisterAsync(RegisterDto model);
        Task<bool> IsEmailExistAsync(string email);
        Task<bool> UpdatePasswordAsync(string email, string newPassword);
        // Bổ sung hàm này để fix lỗi gạch đỏ ở Service và Controller
        Task<NguoiDungModel?> GetUserByIdentifierAsync(string identifier);
    }
}