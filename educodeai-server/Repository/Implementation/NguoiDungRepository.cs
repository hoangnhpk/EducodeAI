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

        // 1. Lấy user để Đăng nhập (Dùng BCrypt nên chỉ cần tìm theo Identifier)
        public async Task<NguoiDungModel?> GetUserForLoginAsync(string identifier, string password)
        {
            // Lưu ý: Nếu dùng BCrypt, bạn nên tìm User trước, sau đó Verify mật khẩu ở Service
            // Ở đây giữ logic tìm kiếm linh hoạt
            return await _context.NguoiDungs
                .FirstOrDefaultAsync(u => (u.Email == identifier.Trim() || u.TaiKhoan == identifier.Trim())
                                           && u.MatKhau == password);
        }

        // 2. Thêm user mới (Đăng ký)
        public async Task<bool> AddUserAsync(NguoiDungModel user)
        {
            try
            {
                await _context.NguoiDungs.AddAsync(user);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi khi thêm người dùng: " + ex.Message);
                return false;
            }
        }

        // 3. Tìm user theo Email (Dùng cho Quên mật khẩu)
        public async Task<NguoiDungModel?> GetUserByEmailAsync(string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email)) return null;
                return await _context.NguoiDungs
                    .FirstOrDefaultAsync(u => u.Email == email.Trim());
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi GetUserByEmailAsync: {ex.Message}");
                if (ex.InnerException is System.Net.Sockets.SocketException || ex.Message.Contains("Socket"))
                {
                    throw new Exception("Lỗi kết nối đến Supabase (DNS/Socket 11004). Vui lòng kiểm tra lại kết nối mạng hoặc IPv6.");
                }
                return null;
            }
        }

        // 4. MỚI: Tìm bằng Email HOẶC Tài khoản (Dùng để kiểm tra trùng lặp khi đăng ký)
        public async Task<NguoiDungModel?> GetUserByIdentifierAsync(string identifier)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(identifier)) return null;

                var search = identifier.Trim().ToLower();
                return await _context.NguoiDungs
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == search || u.TaiKhoan.ToLower() == search);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Lỗi GetUserByIdentifierAsync: {ex.Message}");
                if (ex.InnerException is System.Net.Sockets.SocketException || ex.Message.Contains("Socket"))
                {
                    throw new Exception("Lỗi kết nối đến Supabase (DNS/Socket 11004). Vui lòng kiểm tra lại kết nối mạng hoặc IPv6.");
                }
                return null;
            }
        }

        // 5. Cập nhật thông tin user (Dùng cho Đổi mật khẩu)
        public async Task<bool> UpdateUserAsync(NguoiDungModel user)
        {
            try
            {
                _context.NguoiDungs.Update(user);
                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("❌ UpdateUserAsync ERROR: " + ex.Message);
                return false;
            }
        }

        public async Task<NguoiDungModel?> GetUserByIdAsync(int id)
        {
            return await _context.NguoiDungs
                .FirstOrDefaultAsync(x => x.MaNguoiDung == id);
        }
        //public async Task<NguoiDungModel?> GetUserByIdentifierAsync(string identifier)
        //{
        //    return await _context.NguoiDungs
        //        .FirstOrDefaultAsync(x =>
        //            x.Email == identifier || x.TaiKhoan == identifier);
        //}


    }
}