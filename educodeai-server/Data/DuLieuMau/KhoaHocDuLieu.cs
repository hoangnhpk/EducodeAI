using Microsoft.EntityFrameworkCore;
using educodeai_server.Models;

namespace educodeai_server.Data.DuLieuMau
{
    public static class KhoaHocDuLieu
    {
        public static void SeedKhoaHoc(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<KhoaHocModel>().HasData(
                // Khóa học 1: C++
                new KhoaHocModel
                {
                    MaKhoaHoc = 1,
                    MaGiangVien = 1,
                    TenKhoaHoc = "Lập trình C++ cơ bản, nâng cao",
                    MoTa = "Khóa học toàn diện về lập trình C++, từ cú pháp cơ bản đến các kỹ thuật lập trình nâng cao như con trỏ, OOP, xử lý file",
                    HinhAnh = "cpp-course.jpg",
                    TrangThai = "Hoạt động",
                    DiemDanhGiaTB = 4.7,
                    LinhVuc = "Lập trình hệ thống",
                    TrinhDo = "Người mới",
                    ThoiLuongGio = 35,
                    KyNangChinh = "C++, OOP, Con trỏ, Cấu trúc dữ liệu",
                    NgayTao = new DateTime(2026, 1, 1)
                },
                // Khóa học 2: Kiến Thức Nhập Môn IT
                new KhoaHocModel
                {
                    MaKhoaHoc = 2,
                    MaGiangVien = 1,
                    TenKhoaHoc = "Kiến Thức Nhập Môn IT",
                    MoTa = "Khóa học cung cấp kiến thức nền tảng về công nghệ thông tin, mô hình client-server, domain, và định hướng nghề nghiệp cho người mới bắt đầu",
                    HinhAnh = "it-foundation.jpg",
                    TrangThai = "Hoạt động",
                    DiemDanhGiaTB = 4.9,
                    LinhVuc = "Công nghệ thông tin",
                    TrinhDo = "Người mới",
                    ThoiLuongGio = 8,
                    KyNangChinh = "IT Foundation, Client-Server, Domain, Career Guidance",
                    NgayTao = new DateTime(2026, 1, 1)
                },
                // Khóa học 3: JavaScript Nâng Cao
                new KhoaHocModel
                {
                    MaKhoaHoc = 3,
                    MaGiangVien = 1,
                    TenKhoaHoc = "Lập Trình Javascript nâng cao",
                    MoTa = "Khóa học nâng cao về JavaScript, tập trung vào các khái niệm quan trọng như IIFE, Scope, Closure, Hoisting, This, Bind, Call, Apply và thực hành với Redux",
                    HinhAnh = "js-advanced.jpg",
                    TrangThai = "Hoạt động",
                    DiemDanhGiaTB = 4.8,
                    LinhVuc = "Web Development",
                    TrinhDo = "Trung cấp",
                    ThoiLuongGio = 15,
                    KyNangChinh = "JavaScript, Closure, This, Bind, Call, Apply, Redux",
                    NgayTao = new DateTime(2026, 1, 1)
                },
                // KHÓA HỌC MỚI: Lập Trình JavaScript Cơ Bản
                new KhoaHocModel
                {
                    MaKhoaHoc = 4,
                    MaGiangVien = 1,
                    TenKhoaHoc = "Lập Trình JavaScript Cơ Bản",
                    MoTa = "Khóa học JavaScript cơ bản dành cho người mới bắt đầu, từ biến, toán tử, hàm, mảng đến thực hành form validation",
                    HinhAnh = "js-basic.jpg",
                    TrangThai = "Hoạt động",
                    DiemDanhGiaTB = 4.6,
                    LinhVuc = "Web Development",
                    TrinhDo = "Người mới",
                    ThoiLuongGio = 20,
                    KyNangChinh = "JavaScript, Functions, Arrays, DOM, Form Validation",
                    NgayTao = new DateTime(2026, 1, 1)
                },
                // KHÓA 5: App "Đừng Chạm Tay Lên Mặt"
                new KhoaHocModel
                {
                    MaKhoaHoc = 5,
                    MaGiangVien = 1,
                    TenKhoaHoc = "App 'Đừng Chạm Tay Lên Mặt' - Xây dựng ứng dụng AI với React và TensorFlow",
                    MoTa = "Khóa học thực hành xây dựng ứng dụng AI phát hiện hành vi chạm tay lên mặt sử dụng React, TensorFlow.js và machine learning",
                    HinhAnh = "dont-touch-face.jpg",
                    TrangThai = "Hoạt động",
                    DiemDanhGiaTB = 4.9,
                    LinhVuc = "AI & Machine Learning",
                    TrinhDo = "Trung cấp",
                    ThoiLuongGio = 12,
                    KyNangChinh = "React, TensorFlow.js, Machine Learning, Computer Vision",
                    NgayTao = new DateTime(2026, 1, 1)
                },
                // KHÓA 6: Node & ExpressJS
                new KhoaHocModel
                {
                    MaKhoaHoc = 6,
                    MaGiangVien = 1,
                    TenKhoaHoc = "Node & ExpressJS - Xây dựng Backend chuyên nghiệp",
                    MoTa = "Khóa học toàn diện về Node.js và ExpressJS, từ cơ bản đến nâng cao, xây dựng RESTful API, MVC pattern, kết nối MongoDB và triển khai ứng dụng web hoàn chỉnh",
                    HinhAnh = "node-express.jpg",
                    TrangThai = "Hoạt động",
                    DiemDanhGiaTB = 4.7,
                    LinhVuc = "Backend Development",
                    TrinhDo = "Người mới",
                    ThoiLuongGio = 25,
                    KyNangChinh = "Node.js, ExpressJS, MongoDB, REST API, MVC Pattern",
                    NgayTao = new DateTime(2026, 1, 1)
                },
                // KHÓA 7: Responsive Với Grid System
                new KhoaHocModel
                {
                    MaKhoaHoc = 7,
                    MaGiangVien = 1,
                    TenKhoaHoc = "Responsive Với Grid System - Thiết kế website đa thiết bị",
                    MoTa = "Khóa học chuyên sâu về responsive web design, Grid System, media queries, viewport và kỹ thuật thiết kế website tương thích trên mọi thiết bị",
                    HinhAnh = "responsive-grid.jpg",
                    TrangThai = "Hoạt động",
                    DiemDanhGiaTB = 4.8,
                    LinhVuc = "Web Design & UI/UX",
                    TrinhDo = "Người mới",
                    ThoiLuongGio = 10,
                    KyNangChinh = "CSS Grid, Responsive Design, Media Queries, Flexbox, Viewport",
                    NgayTao = new DateTime(2026, 1, 1)
                },
                // KHÓA 8: Làm việc với Terminal & Ubuntu
                new KhoaHocModel
                {
                    MaKhoaHoc = 8,
                    MaGiangVien = 1,
                    TenKhoaHoc = "Làm việc với Terminal & Ubuntu - Lập trình chuyên nghiệp với Linux",
                    MoTa = "Khóa học toàn diện về làm việc với Terminal, WSL, Ubuntu, các lệnh Linux cơ bản đến nâng cao, cài đặt môi trường phát triển và deploy ứng dụng web lên server thật",
                    HinhAnh = "terminal-ubuntu.jpg",
                    TrangThai = "Hoạt động",
                    DiemDanhGiaTB = 4.9,
                    LinhVuc = "System Administration & DevOps",
                    TrinhDo = "Người mới",
                    ThoiLuongGio = 18,
                    KyNangChinh = "Linux, Ubuntu, WSL, Terminal Commands, Server Deployment, Nginx",
                    NgayTao = new DateTime(2026, 1, 1)
                }
            );
        }
    }
}