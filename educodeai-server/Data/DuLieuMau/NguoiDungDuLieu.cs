using educodeai_server.Models;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Data.DuLieuMau
{
    public class NguoiDungDuLieu
    {
        public static void SeedNguoiDung(ModelBuilder modelBuilder)
        {
            // Mật khẩu đã được mã hóa (giả sử là "123456" đã hash bằng BCrypt)
            string hashedPassword = "$2a$11$XcTfQrJ7G8hQ9vZkLmNOPuS5d6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4";

            modelBuilder.Entity<NguoiDungModel>().HasData(
                // 1. ADMIN - Vai trò 0
                new NguoiDungModel
                {
                    MaNguoiDung = 2,
                    TaiKhoan = "admin",
                    MatKhau = hashedPassword,
                    HoTen = "Nguyễn Quốc Hùng",
                    Email = "nguyenhung22032006@gmail.com",
                    AnhDaiDien = "admin-avatar.jpg",
                    VaiTro = 0, // Admin
                    TrangThai = "Hoạt động",
                    NgayThamGia = new DateTime(2026, 1, 1)
                },

                // 2. GIẢNG VIÊN - Vai trò 1
                new NguoiDungModel
                {
                    MaNguoiDung = 1,
                    TaiKhoan = "giangvien",
                    MatKhau = hashedPassword,
                    GoogleID = "google_giangvien_123",
                    HoTen = "Trần Thị Giảng Viên",
                    Email = "giangvien@educodeai.com",
                    AnhDaiDien = "giangvien-avatar.jpg",
                    VaiTro = 1, // Giảng viên
                    TrangThai = "Hoạt động",
                    NgayThamGia = new DateTime(2026, 1, 1)
                },

                // 3. HỌC VIÊN - Vai trò 2
                new NguoiDungModel
                {
                    MaNguoiDung = 3,
                    TaiKhoan = "hocvien",
                    MatKhau = hashedPassword,
                    GoogleID = "google_hocvien_456",
                    HoTen = "Lê Văn Học Viên",
                    Email = "hocvien@gmail.com",
                    AnhDaiDien = "hocvien-avatar.jpg",
                    VaiTro = 2, // Học viên
                    TrangThai = "Hoạt động",
                    NgayThamGia = new DateTime(2026, 1, 1)
                }
            );
        }
    }
}
