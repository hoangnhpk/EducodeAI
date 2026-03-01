using Microsoft.EntityFrameworkCore;
using educodeai_server.Models;

namespace educodeai_server.Data.DuLieuMau
{
    public static class ChuongHocDuLieu
    {
        public static void SeedChuongHoc(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ChuongHocModel>().HasData(
                // Chương học cho khóa học C++ (MaKhoaHoc = 1)
                new ChuongHocModel { MaChuong = 1, MaKhoaHoc = 1, TenChuong = "Giới thiệu", ThuTu = 1 },
                new ChuongHocModel { MaChuong = 2, MaKhoaHoc = 1, TenChuong = "Biến và kiểu dữ liệu", ThuTu = 2 },
                new ChuongHocModel { MaChuong = 3, MaKhoaHoc = 1, TenChuong = "Cấu trúc điều khiển và vòng lặp", ThuTu = 3 },
                new ChuongHocModel { MaChuong = 4, MaKhoaHoc = 1, TenChuong = "Mảng", ThuTu = 4 },
                new ChuongHocModel { MaChuong = 5, MaKhoaHoc = 1, TenChuong = "String", ThuTu = 5 },
                new ChuongHocModel { MaChuong = 6, MaKhoaHoc = 1, TenChuong = "Hàm", ThuTu = 6 },
                new ChuongHocModel { MaChuong = 7, MaKhoaHoc = 1, TenChuong = "Con trỏ", ThuTu = 7 },
                new ChuongHocModel { MaChuong = 8, MaKhoaHoc = 1, TenChuong = "Struct", ThuTu = 8 },
                new ChuongHocModel { MaChuong = 9, MaKhoaHoc = 1, TenChuong = "Làm việc với file", ThuTu = 9 },
                new ChuongHocModel { MaChuong = 10, MaKhoaHoc = 1, TenChuong = "Hướng đối tượng (OOP)", ThuTu = 10 },
                // ========== KHÓA HỌC 2: KỸ THUẬT LẬP TRÌNH CƠ BẢN ==========
                new ChuongHocModel { MaChuong = 11, MaKhoaHoc = 2, TenChuong = "Khái niệm kỹ thuật cần biết", ThuTu = 1 },
                new ChuongHocModel { MaChuong = 12, MaKhoaHoc = 2, TenChuong = "Môi trường, con người IT", ThuTu = 2 },
                new ChuongHocModel { MaChuong = 13, MaKhoaHoc = 2, TenChuong = "Phương pháp, định hướng", ThuTu = 3 },
                // ========== KHÓA HỌC 3: LẬP TRÌNH JAVASCRIPT NÂNG CAO ==========
                new ChuongHocModel { MaChuong = 14, MaKhoaHoc = 3, TenChuong = "IIFE, Scope, Closure", ThuTu = 1 },
                new ChuongHocModel { MaChuong = 15, MaKhoaHoc = 3, TenChuong = "Hoisting, Strict Mode, Data Types", ThuTu = 2 },
                new ChuongHocModel { MaChuong = 16, MaKhoaHoc = 3, TenChuong = "This, Bind, Call, Apply", ThuTu = 3 },
                new ChuongHocModel { MaChuong = 17, MaKhoaHoc = 3, TenChuong = "Các bài thực hành", ThuTu = 4 },
                // ========== KHÓA HỌC 4: LẬP TRÌNH JAVASCRIPT CƠ BẢN ==========
                new ChuongHocModel { MaChuong = 18, MaKhoaHoc = 4, TenChuong = "Giới thiệu", ThuTu = 1 },
                new ChuongHocModel { MaChuong = 19, MaKhoaHoc = 4, TenChuong = "Biến, Comments, built-in", ThuTu = 2 },
                new ChuongHocModel { MaChuong = 20, MaKhoaHoc = 4, TenChuong = "Toán tử, kiểu dữ liệu", ThuTu = 3 },
                new ChuongHocModel { MaChuong = 21, MaKhoaHoc = 4, TenChuong = "Làm việc với hàm", ThuTu = 4 },
                new ChuongHocModel { MaChuong = 22, MaKhoaHoc = 4, TenChuong = "Làm việc với mảng", ThuTu = 5 },
                new ChuongHocModel { MaChuong = 23, MaKhoaHoc = 4, TenChuong = "Form validation", ThuTu = 6 },
                // ========== KHÓA HỌC 5: APP "ĐỪNG CHẠM TAY LÊN MẶT" ==========
                new ChuongHocModel { MaChuong = 24, MaKhoaHoc = 5, TenChuong = "Giới thiệu", ThuTu = 1 },
                new ChuongHocModel { MaChuong = 25, MaKhoaHoc = 5, TenChuong = "Xây dựng", ThuTu = 2 },
                new ChuongHocModel { MaChuong = 26, MaKhoaHoc = 5, TenChuong = "Train function", ThuTu = 3 },
                // ========== KHÓA HỌC 6: NODE & EXPRESSJS ==========
                new ChuongHocModel { MaChuong = 27, MaKhoaHoc = 6, TenChuong = "Bắt đầu", ThuTu = 1 },
                new ChuongHocModel { MaChuong = 28, MaKhoaHoc = 6, TenChuong = "Kiến thức cốt lõi", ThuTu = 2 },
                new ChuongHocModel { MaChuong = 29, MaKhoaHoc = 6, TenChuong = "Xây dựng website", ThuTu = 3 },
                // ========== KHÓA HỌC 7: RESPONSIVE VỚI GRID SYSTEM ==========
                new ChuongHocModel { MaChuong = 30, MaKhoaHoc = 7, TenChuong = "Bắt đầu", ThuTu = 1 },
                new ChuongHocModel { MaChuong = 31, MaKhoaHoc = 7, TenChuong = "Viewport, @media, breakpoint", ThuTu = 2 },
                new ChuongHocModel { MaChuong = 32, MaKhoaHoc = 7, TenChuong = "Thực hành nhỏ", ThuTu = 3 },
                new ChuongHocModel { MaChuong = 33, MaKhoaHoc = 7, TenChuong = "Grid system", ThuTu = 4 },
                // ========== KHÓA HỌC 8: LÀM VIỆC VỚI TERMINAL & UBUNTU ==========
                new ChuongHocModel { MaChuong = 34, MaKhoaHoc = 8, TenChuong = "Giới thiệu", ThuTu = 1 },
                new ChuongHocModel { MaChuong = 35, MaKhoaHoc = 8, TenChuong = "Window Terminal & WSL", ThuTu = 2 },
                new ChuongHocModel { MaChuong = 36, MaKhoaHoc = 8, TenChuong = "Các lệnh Linux cơ bản", ThuTu = 3 },
                new ChuongHocModel { MaChuong = 37, MaKhoaHoc = 8, TenChuong = "Chạy dự án React, Node, Laravel", ThuTu = 4 },
                new ChuongHocModel { MaChuong = 38, MaKhoaHoc = 8, TenChuong = "Deploy dự án với server thật", ThuTu = 5 }
            );
        }
    }
}