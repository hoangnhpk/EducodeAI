using educodeai_server.Models;

namespace educodeai_server.Repository.Interface
{
    public interface INguoiDungRepository
    {
        // Tìm user để đăng nhập
        Task<NguoiDungModel?> GetUserForLoginAsync(string identifier, string password);

        // Thêm người dùng mới (Đăng ký)
        Task<bool> AddUserAsync(NguoiDungModel user);

        // Tìm bằng Email (Quên mật khẩu)
        Task<NguoiDungModel?> GetUserByEmailAsync(string email);

        // Tìm bằng Email HOẶC Tài khoản (Fix lỗi báo trùng lặp)
        Task<NguoiDungModel?> GetUserByIdentifierAsync(string identifier);

        // Cập nhật thông tin (Đổi mật khẩu)
        Task<bool> UpdateUserAsync(NguoiDungModel user);
        Task<NguoiDungModel?> GetUserByIdAsync(int id);
        Task<NguoiDungModel?> GetUserByIdentifierAsync(string identifier);


    }
}