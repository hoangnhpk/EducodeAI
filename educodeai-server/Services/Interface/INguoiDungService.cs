using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Models;

namespace educodeai_server.Services.Interface
{
    public interface INguoiDungService
    {
        // Đổi tên tham số thành identifier để đại diện cho cả Email hoặc Tài khoản
        Task<NguoiDungModel?> CheckLoginAsync(string identifier, string password);

        // Khai báo hàm tạo Token
        string GenerateJwtToken(NguoiDungModel user);
        Task<bool> RegisterAsync(RegisterDto model);
        Task<bool> IsEmailExistAsync(string email);
        Task<bool> UpdatePasswordAsync(string email, string newPassword);
    }
}