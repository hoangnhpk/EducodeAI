using educodeai_server.Data;
using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Repository.Implementation
{
    public class NguoiDungRepository : INguoiDungRepository
    {
        private readonly EduCodeAIDbContext _context;

        public NguoiDungRepository(EduCodeAIDbContext context)
        {
            _context = context;
        }

        // 1. Lấy user để Đăng nhập
        public async Task<NguoiDungModel?> GetUserForLoginAsync(string identifier, string password)
        {
            return await _context.NguoiDungs
                .FirstOrDefaultAsync(u => (u.Email == identifier || u.TaiKhoan == identifier)
                                           && u.MatKhau == password);
        }

        // 2. Thêm user mới (Đăng ký)
        public async Task<bool> AddUserAsync(NguoiDungModel user)
        {
            try
            {
                await _context.NguoiDungs.AddAsync(user);
                var result = await _context.SaveChangesAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi khi thêm người dùng: " + ex.Message);
                return false;
            }
        }

        // 3. Tìm user theo Email (Dùng cho Quên mật khẩu/Kiểm tra trùng)
        public async Task<NguoiDungModel?> GetUserByEmailAsync(string email)
        {
            return await _context.NguoiDungs
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        // 4. Cập nhật thông tin user (Dùng cho Đổi mật khẩu)
        public async Task<bool> UpdateUserAsync(NguoiDungModel user)
        {
            try
            {
                _context.NguoiDungs.Update(user);
                var result = await _context.SaveChangesAsync();
                return result > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi khi cập nhật người dùng: " + ex.Message);
                return false;
            }
        }
    }
}