using educodeai_server.Models;

namespace educodeai_server.Repository.Interface
{
    public interface INguoiDungRepository
    {
        // Chỉ khai báo duy nhất 1 lần ở đây
        Task<NguoiDungModel?> GetUserForLoginAsync(string email, string password);
        Task<bool> AddUserAsync(NguoiDungModel user);
        Task<NguoiDungModel?> GetUserByEmailAsync(string email);
        Task<bool> UpdateUserAsync(NguoiDungModel user);
        Task<NguoiDungModel?> GetUserByIdAsync(int id);
        Task<NguoiDungModel?> GetUserByIdentifierAsync(string identifier);


    }
}