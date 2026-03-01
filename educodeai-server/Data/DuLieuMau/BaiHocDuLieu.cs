using Microsoft.EntityFrameworkCore;
using educodeai_server.Models;

namespace educodeai_server.Data.DuLieuMau
{
    public static class BaiHocDuLieu
    {
        public static void SeedBaiHoc(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BaiHocModel>().HasData(
                // ========== CHƯƠNG 1: GIỚI THIỆU ==========
                new BaiHocModel
                {
                    MaBaiHoc = 1,
                    MaChuong = 1,
                    TieuDe = "Giới thiệu khóa học",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Khóa học Lập trình C++ toàn diện từ cơ bản đến nâng cao</p>",
                    ThoiLuong = 600, // 10 phút
                    LinkVideo = "https://www.youtube.com/embed/Da1tpV9TMU0?si=DZQWIaQdB5haoEIy",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 2,
                    MaChuong = 1,
                    TieuDe = "Cài đặt Dev-C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn cài đặt môi trường Dev-C++ để lập trình C++</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/9_uoKY0AwqE?si=Zdl_y8quu8_H8eC7",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 3,
                    MaChuong = 1,
                    TieuDe = "Hướng dẫn sử dụng Dev-C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn chi tiết cách sử dụng Dev-C++ cho người mới bắt đầu</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/vFhKEYRBmVY?si=QWnbQ2d8wljLojBr",
                    ThuTu = 3
                },

                // ========== CHƯƠNG 2: BIẾN VÀ KIỂU DỮ LIỆU ==========
                new BaiHocModel
                {
                    MaBaiHoc = 4,
                    MaChuong = 2,
                    TieuDe = "Biến và nhập xuất dữ liệu",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Học về biến, cách khai báo và nhập xuất dữ liệu trong C++</p>",
                    ThoiLuong = 1800, // 30 phút
                    LinkVideo = "https://www.youtube.com/embed/Z5O6pxQm6II?si=9dAM9MTkz7h34Uqh",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 5,
                    MaChuong = 2,
                    TieuDe = "Kiểu dữ liệu thường gặp",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Các kiểu dữ liệu cơ bản trong C++: int, float, double, char, bool</p>",
                    ThoiLuong = 1500, // 25 phút
                    LinkVideo = "https://www.youtube.com/embed/qpIautEyv2s?si=9ZjnVDDARUaHjH3j",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 6,
                    MaChuong = 2,
                    TieuDe = "Biến cục bộ và biến toàn cục",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phân biệt và sử dụng biến cục bộ và biến toàn cục</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/79mzaFPLEz8?si=pF0GCz_JwF_cyTnL",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 7,
                    MaChuong = 2,
                    TieuDe = "Ép kiểu dữ liệu và bảng mã ASCII trong C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn ép kiểu dữ liệu và sử dụng bảng mã ASCII</p>",
                    ThoiLuong = 1500, // 25 phút
                    LinkVideo = "https://www.youtube.com/embed/MTbZLshZg0U?si=4-nsRX2u-cFLI2Kg",
                    ThuTu = 4
                },

                // ========== CHƯƠNG 3: CẤU TRÚC ĐIỀU KHIỂN VÀ VÒNG LẶP ==========
                new BaiHocModel
                {
                    MaBaiHoc = 8,
                    MaChuong = 3,
                    TieuDe = "Cấu trúc if else",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Cấu trúc điều kiện if, else if, else trong C++</p>",
                    ThoiLuong = 1800, // 30 phút
                    LinkVideo = "https://www.youtube.com/embed/1ppDCzoB03k?si=2VLBI7_Q43CtcijA",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 9,
                    MaChuong = 3,
                    TieuDe = "Cấu trúc switch case",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Cấu trúc rẽ nhành switch case trong C++</p>",
                    ThoiLuong = 1500, // 25 phút
                    LinkVideo = "https://www.youtube.com/embed/W3k6lrN0qG4?si=ZAqIKkrzKXmb0Ex5",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 10,
                    MaChuong = 3,
                    TieuDe = "Vòng lặp trong C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Các loại vòng lặp: for, while, do-while trong C++</p>",
                    ThoiLuong = 2400, // 40 phút
                    LinkVideo = "https://www.youtube.com/embed/7uHfTAj3Vao?si=AdEMERWT9I7Rp7bp",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 11,
                    MaChuong = 3,
                    TieuDe = "Toán tử 3 ngôi trong C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Sử dụng toán tử 3 ngôi (ternary operator) trong C++</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/YKeKmpcMcQY?si=eqBwPvJWKayWWPgI",
                    ThuTu = 4
                },
                new BaiHocModel
                {
                    MaBaiHoc = 12,
                    MaChuong = 3,
                    TieuDe = "Bài tập về vòng lặp trong C++",
                    LoaiBaiHoc = "VanBan",
                    NoiDung = "<p>Bài tập thực hành về vòng lặp trong C++</p>",
                    ThoiLuong = 1800, // 30 phút
                    LinkVideo = "https://www.youtube.com/embed/Oe27IJSOUUM?si=KWUdCh-o9PWAYKYL",
                    ThuTu = 5
                },
                new BaiHocModel
                {
                    MaBaiHoc = 13,
                    MaChuong = 3,
                    TieuDe = "Câu lệnh break, continue, goto",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Các câu lệnh điều khiển vòng lặp: break, continue, goto</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/r2FMycOy_2Y?si=NHI3xlLdZch1tV4P",
                    ThuTu = 6
                },

                // ========== CHƯƠNG 4: MẢNG ==========
                new BaiHocModel
                {
                    MaBaiHoc = 14,
                    MaChuong = 4,
                    TieuDe = "Mảng một chiều",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Khái niệm và cách sử dụng mảng một chiều trong C++</p>",
                    ThoiLuong = 2100, // 35 phút
                    LinkVideo = "https://www.youtube.com/embed/89W1oyXfqgo?si=c6LV4UohjZpp5t4l",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 15,
                    MaChuong = 4,
                    TieuDe = "Mảng 2 chiều",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Khái niệm và cách sử dụng mảng 2 chiều (ma trận) trong C++</p>",
                    ThoiLuong = 2400, // 40 phút
                    LinkVideo = "https://www.youtube.com/embed/xGpB07JzrQ8?si=shAT_gnDvzcx-uwZ",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 16,
                    MaChuong = 4,
                    TieuDe = "Thuật toán sắp xếp bubble sort",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu và cài đặt thuật toán sắp xếp bubble sort</p>",
                    ThoiLuong = 1800, // 30 phút
                    LinkVideo = "https://www.youtube.com/embed/bt4m6VlYQO4?si=rwn3oCMr67ehu9wC",
                    ThuTu = 3
                },

                // ========== CHƯƠNG 5: STRING ==========
                new BaiHocModel
                {
                    MaBaiHoc = 17,
                    MaChuong = 5,
                    TieuDe = "String C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Làm việc với chuỗi (string) trong C++</p>",
                    ThoiLuong = 2100, // 35 phút
                    LinkVideo = "https://www.youtube.com/embed/Q06peb_sH6k?si=dU3_XU_U2oNwRv50",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 18,
                    MaChuong = 5,
                    TieuDe = "Các phương thức làm việc với String trong C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Các phương thức xử lý chuỗi thường dùng trong C++</p>",
                    ThoiLuong = 2400, // 40 phút
                    LinkVideo = "https://www.youtube.com/embed/duJoNkUE-MA?si=GZssMFpMndfnanPD",
                    ThuTu = 2
                },

                // ========== CHƯƠNG 6: HÀM ==========
                new BaiHocModel
                {
                    MaBaiHoc = 19,
                    MaChuong = 6,
                    TieuDe = "Hàm là gì?",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Khái niệm về hàm và lợi ích của việc sử dụng hàm</p>",
                    ThoiLuong = 1800, // 30 phút
                    LinkVideo = "https://www.youtube.com/embed/ay8PEiiP5tU?si=8OCanlJOMHEIM8lW",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 20,
                    MaChuong = 6,
                    TieuDe = "Tham số và đối số trong C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phân biệt tham số và đối số trong hàm C++</p>",
                    ThoiLuong = 1500, // 25 phút
                    LinkVideo = "https://www.youtube.com/embed/ATAoEb-ZXKI?si=XRjVv3m-wX8H60gk",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 21,
                    MaChuong = 6,
                    TieuDe = "Đối số mặc định trong hàm",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Cách sử dụng đối số mặc định trong hàm C++</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/NU0joSR66Ag?si=NUrZRiROo23txowt",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 22,
                    MaChuong = 6,
                    TieuDe = "Tham trị và tham chiếu trong C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phân biệt truyền tham trị và tham chiếu trong C++</p>",
                    ThoiLuong = 2100, // 35 phút
                    LinkVideo = "https://www.youtube.com/embed/OQfEPrsWYlY?si=yZwSGw-hbMB-fzC2",
                    ThuTu = 4
                },

                // ========== CHƯƠNG 7: CON TRỎ ==========
                new BaiHocModel
                {
                    MaBaiHoc = 23,
                    MaChuong = 7,
                    TieuDe = "Con trỏ trong C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Khái niệm con trỏ và cách sử dụng con trỏ trong C++</p>",
                    ThoiLuong = 2700, // 45 phút
                    LinkVideo = "https://www.youtube.com/embed/uBfsM5RJWSI?si=kR-e9npBkrRgpdqp",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 24,
                    MaChuong = 7,
                    TieuDe = "Cấp phát động",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Cấp phát và giải phóng bộ nhớ động trong C++</p>",
                    ThoiLuong = 1800, // 30 phút
                    LinkVideo = "https://www.youtube.com/embed/OIU55ogb26M?si=m6eBIwKQ3wXiGVEw",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 25,
                    MaChuong = 7,
                    TieuDe = "Cấp phát mảng động",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Cấp phát động cho mảng trong C++</p>",
                    ThoiLuong = 1500, // 25 phút
                    LinkVideo = "https://www.youtube.com/embed/anbncsNUSSk?si=2Y0Ing7hqcLwmqte",
                    ThuTu = 3
                },

                // ========== CHƯƠNG 8: STRUCT ==========
                new BaiHocModel
                {
                    MaBaiHoc = 26,
                    MaChuong = 8,
                    TieuDe = "Struct là gì?",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Khái niệm về struct (cấu trúc) trong C++</p>",
                    ThoiLuong = 1800, // 30 phút
                    LinkVideo = "https://www.youtube.com/embed/ZbVO_4jH60k?si=148T-Elsog_pCFbe",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 27,
                    MaChuong = 8,
                    TieuDe = "Con trỏ và struct trong C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Kết hợp con trỏ và struct trong C++</p>",
                    ThoiLuong = 1500, // 25 phút
                    LinkVideo = "https://www.youtube.com/embed/T39JnItSmJU?si=RKXNgsgM9Ml8lvig",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 28,
                    MaChuong = 8,
                    TieuDe = "Nạp chồng toán tử trong C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Kỹ thuật nạp chồng toán tử (operator overloading) trong C++</p>",
                    ThoiLuong = 2400, // 40 phút
                    LinkVideo = "https://www.youtube.com/embed/tNlCid6mQ3E?si=mf4tD034MUK6pyE3",
                    ThuTu = 3
                },

                // ========== CHƯƠNG 9: LÀM VIỆC VỚI FILE ==========
                new BaiHocModel
                {
                    MaBaiHoc = 29,
                    MaChuong = 9,
                    TieuDe = "Làm việc với file text trong C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Đọc và ghi file text trong C++</p>",
                    ThoiLuong = 2100, // 35 phút
                    LinkVideo = "https://www.youtube.com/embed/LekUWlASyMY?si=R2n6_pvdZZcSBYLg",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 30,
                    MaChuong = 9,
                    TieuDe = "Các chế độ làm việc với file trong C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Các chế độ mở file và xử lý file trong C++</p>",
                    ThoiLuong = 1800, // 30 phút
                    LinkVideo = "https://www.youtube.com/embed/_wdQU8GrJcY?si=0VjONumO-H39XFR5",
                    ThuTu = 2
                },

                // ========== CHƯƠNG 10: HƯỚNG ĐỐI TƯỢNG (OOP) ==========
                new BaiHocModel
                {
                    MaBaiHoc = 31,
                    MaChuong = 10,
                    TieuDe = "Class & object",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Khái niệm class và object trong lập trình hướng đối tượng</p>",
                    ThoiLuong = 2400, // 40 phút
                    LinkVideo = "https://www.youtube.com/embed/jwvmfp3Kp8U?si=dgOSFcQnsYOv7eD1",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 32,
                    MaChuong = 10,
                    TieuDe = "Tính đóng gói trong C++",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Nguyên lý đóng gói (encapsulation) trong lập trình hướng đối tượng</p>",
                    ThoiLuong = 1800, // 30 phút
                    LinkVideo = "https://www.youtube.com/embed/ab2TALCZruo?si=9RfAUdhirOwyzFEV",
                    ThuTu = 2
                },
                // Kiến Thức Nhập Môn IT
                new BaiHocModel
                {
                    MaBaiHoc = 33, // Tiếp tục từ số 33
                    MaChuong = 11,
                    TieuDe = "Mô hình Client - Server là gì?",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu về mô hình Client-Server, cách thức hoạt động và ứng dụng trong thực tế</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/zoELAirXMJY?si=ilbFjG9jF8MHnoen",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 34,
                    MaChuong = 11,
                    TieuDe = "Domain là gì?",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tìm hiểu về domain, cách đăng ký domain và tầm quan trọng của domain trong công nghệ thông tin</p>",
                    ThoiLuong = 720, // 12 phút
                    LinkVideo = "https://www.youtube.com/embed/M62l1xA5Eu8?si=rv1NF3Pcsk4PfNw3",
                    ThuTu = 2
                },

                // CHƯƠNG 12: Môi trường, con người IT
                new BaiHocModel
                {
                    MaBaiHoc = 35,
                    MaChuong = 12,
                    TieuDe = "Làm IT cần tố chất gì? | Kĩ năng cần rèn luyện?",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Những tố chất cần có để thành công trong ngành IT và các kỹ năng cần rèn luyện</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/CyZ_O7v62h4?si=yXL1NUelDTjI1581",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 36,
                    MaChuong = 12,
                    TieuDe = "Sinh viên IT đi thực tập cần biết những gì?",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Chia sẻ kinh nghiệm và những điều sinh viên IT cần chuẩn bị khi đi thực tập</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/YH-E4Y3EaT4?si=2iCpcacbC2GultDZ",
                    ThuTu = 2
                },

                // CHƯƠNG 13: Phương pháp, định hướng
                new BaiHocModel
                {
                    MaBaiHoc = 37,
                    MaChuong = 13,
                    TieuDe = "Phương pháp HỌC LẬP TRÌNH",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phương pháp học lập trình hiệu quả cho người mới bắt đầu</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/DpvYHLUiZpc?si=WG6Va34BAY43v0R4",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 38,
                    MaChuong = 13,
                    TieuDe = "Tại Sao Nên Học Lập Trình Tại Trang Web",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Lợi ích của việc học lập trình qua các nền tảng web và cách tận dụng tài nguyên online</p>",
                    ThoiLuong = 840, // 14 phút
                    LinkVideo = "https://www.youtube.com/embed/f5hbmw7Ba7c?si=tVfTyKmWhw62Hb6E",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 39, // Tiếp tục từ số 39
                    MaChuong = 14,
                    TieuDe = "Giới thiệu",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu tổng quan về khóa học JavaScript nâng cao</p>",
                    ThoiLuong = 600, // 10 phút
                    LinkVideo = "https://www.youtube.com/embed/MGhw6XliFgo?si=0flovkzN1KtgCC7h",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 40,
                    MaChuong = 14,
                    TieuDe = "Khái niệm IIFE trong JavaScript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tìm hiểu về Immediately Invoked Function Expression (IIFE) trong JavaScript</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/N-3GU1F1UBY?si=rQFaM72APj6FLpmT",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 41,
                    MaChuong = 14,
                    TieuDe = "Scope trong JavaScript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hiểu về scope (phạm vi) trong JavaScript: global scope, function scope, block scope</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/5N8vz_VmszE?si=52bTwY4Ydo_7k3kl",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 42,
                    MaChuong = 14,
                    TieuDe = "Closure trong JavaScript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Khái niệm và ứng dụng của closure trong lập trình JavaScript</p>",
                    ThoiLuong = 1500, // 25 phút
                    LinkVideo = "https://www.youtube.com/embed/xtQtGKL0NCI?si=xpOReqdkc_RKQfvS",
                    ThuTu = 4
                },

                // CHƯƠNG 15: Hoisting, Strict Mode, Data Types
                new BaiHocModel
                {
                    MaBaiHoc = 43,
                    MaChuong = 15,
                    TieuDe = "Hoisting trong Javascript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tìm hiểu về hoisting: cách JavaScript xử lý khai báo biến và hàm</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/3MLhU1DrUxM?si=012HnDBIDVk3WvpX",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 44,
                    MaChuong = 15,
                    TieuDe = "\"use strict\" hay strict mode trong Javascript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Sử dụng strict mode để viết code JavaScript an toàn và hiệu quả hơn</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/w1W-j4cSPF0?si=1ukan44t_iqSgzjC",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 45,
                    MaChuong = 15,
                    TieuDe = "Primitive Types & Reference Types trong Javascript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phân biệt giữa primitive types và reference types trong JavaScript</p>",
                    ThoiLuong = 1320, // 22 phút
                    LinkVideo = "https://www.youtube.com/embed/n4tS1Q5-EzY?si=GjTfbWhSAxqgCIFa",
                    ThuTu = 3
                },

                // CHƯƠNG 16: This, Bind, Call, Apply
                new BaiHocModel
                {
                    MaBaiHoc = 46,
                    MaChuong = 16,
                    TieuDe = "This keyword trong JavaScript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hiểu về từ khóa 'this' và cách nó hoạt động trong các ngữ cảnh khác nhau</p>",
                    ThoiLuong = 1800, // 30 phút
                    LinkVideo = "https://www.youtube.com/embed/ii1Ra_zLDIo?si=ZMzRga4QranVogUM",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 47,
                    MaChuong = 16,
                    TieuDe = "Fn.bind() method trong JavaScript phần 1",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phần 1: Tìm hiểu về phương thức bind() trong JavaScript</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/F5z6YoR8of0?si=EJvumQ5VEV6VIZlN",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 48,
                    MaChuong = 16,
                    TieuDe = "Fn.bind() method trong JavaScript phần 2",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phần 2: Ứng dụng thực tế của phương thức bind()</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/6j9b2_E34JM?si=rs38tq046byAA6i5",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 49,
                    MaChuong = 16,
                    TieuDe = "Fn.call() method trong JavaScript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Sử dụng phương thức call() để gọi hàm với giá trị 'this' cụ thể</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/QxLTSdTJDXY?si=KWT36QTPVuEXDM3K",
                    ThuTu = 4
                },
                new BaiHocModel
                {
                    MaBaiHoc = 50,
                    MaChuong = 16,
                    TieuDe = "Fn.apply() method trong JavaScript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Sử dụng phương thức apply() để gọi hàm với mảng đối số</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/a4FjX4Z-9Rs?si=wuCZqUzeuaLNACqP",
                    ThuTu = 5
                },

                // CHƯƠNG 17: Các bài thực hành
                new BaiHocModel
                {
                    MaBaiHoc = 51,
                    MaChuong = 17,
                    TieuDe = "Học Redux",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Thực hành với Redux - State management cho JavaScript applications</p>",
                    ThoiLuong = 2400, // 40 phút
                    LinkVideo = "https://www.youtube.com/embed/GQ-toR8F7rc?si=gef3E7tTAtlP2Gij",
                    ThuTu = 1
                },

                new BaiHocModel
                {
                    MaBaiHoc = 52, // Tiếp tục từ số 52
                    MaChuong = 18,
                    TieuDe = "Javascript có thể làm được gì?",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Khám phá khả năng và ứng dụng của JavaScript trong phát triển web</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/0SJE9dYdpps?si=pUECkazKOu2V5fJ2",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 53,
                    MaChuong = 18,
                    TieuDe = "Lời khuyên trước khóa học",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Những lời khuyên hữu ích trước khi bắt đầu học lập trình JavaScript</p>",
                    ThoiLuong = 600, // 10 phút
                    LinkVideo = "https://www.youtube.com/embed/-jV06pqjUUc?si=4TITZ8jtPnMdnwDK",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 54,
                    MaChuong = 18,
                    TieuDe = "Cài đặt môi trường, công cụ phù hợp để học JavaScript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn cài đặt môi trường và công cụ cần thiết để học JavaScript</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/efI98nT8Ffo?si=SGT7VQZOTwecjLFy",
                    ThuTu = 3
                },

                // CHƯƠNG 19: Biến, Comments, built-in
                new BaiHocModel
                {
                    MaBaiHoc = 55,
                    MaChuong = 19,
                    TieuDe = "Cách sử dụng JS trong file HTML",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn nhúng JavaScript vào file HTML</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/W0vEUmyvthQ?si=uIquuLkihmo70A8f",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 56,
                    MaChuong = 19,
                    TieuDe = "Khai báo biến",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Học cách khai báo và sử dụng biến trong JavaScript</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/CLbx37dqYEI?si=LV2teP0FA98jrLzd",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 57,
                    MaChuong = 19,
                    TieuDe = "Sử dụng Comments trong JavaScript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Cách sử dụng comments để ghi chú code trong JavaScript</p>",
                    ThoiLuong = 720, // 12 phút
                    LinkVideo = "https://www.youtube.com/embed/xRpXBEq6TOY?si=BVdMwpKjyKjkNCe5",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 58,
                    MaChuong = 19,
                    TieuDe = "Một số hàm built-in trong JavaScript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu các hàm built-in thông dụng trong JavaScript</p>",
                    ThoiLuong = 1320, // 22 phút
                    LinkVideo = "https://www.youtube.com/embed/rSV33HGotgE?si=yswlNLENjUQH6-qJ",
                    ThuTu = 4
                },

                // CHƯƠNG 20: Toán tử, kiểu dữ liệu
                new BaiHocModel
                {
                    MaBaiHoc = 59,
                    MaChuong = 20,
                    TieuDe = "Làm quen với toán tử trong JavaScript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu các loại toán tử cơ bản trong JavaScript</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/SZb-N7TfPlw?si=o5H_GPV-40w8JFkB",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 60,
                    MaChuong = 20,
                    TieuDe = "Toán tử số học trong JavaScript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tìm hiểu các toán tử số học: cộng, trừ, nhân, chia, mod</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/m_h7-dgKnMU?si=5I_SRNZmvCV9JQIy",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 61,
                    MaChuong = 20,
                    TieuDe = "Toán tử ++ -- với tiền tố & hậu tố",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phân biệt toán tử ++ và -- khi đặt trước hoặc sau biến</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/aM-DUx6Qnc8?si=kwcVVpz2z17YAsk8",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 62,
                    MaChuong = 20,
                    TieuDe = "Toán tử gán trong JavaScript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Các toán tử gán: =, +=, -=, *=, /=, %=</p>",
                    ThoiLuong = 840, // 14 phút
                    LinkVideo = "https://www.youtube.com/embed/ncRmjazgsE8?si=v7uHTTa80Ju-xcYc",
                    ThuTu = 4
                },
                new BaiHocModel
                {
                    MaBaiHoc = 63,
                    MaChuong = 20,
                    TieuDe = "Toán tử chuỗi (String Operator)",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Toán tử nối chuỗi và xử lý chuỗi trong JavaScript</p>",
                    ThoiLuong = 720, // 12 phút
                    LinkVideo = "https://www.youtube.com/embed/QCLVU6cZU_E?si=TpVpQyVmAWGR78Zx",
                    ThuTu = 5
                },
                new BaiHocModel
                {
                    MaBaiHoc = 64,
                    MaChuong = 20,
                    TieuDe = "Toán tử so sánh trong Javascript (phần 1)",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phần 1: Các toán tử so sánh cơ bản</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/rWM2lXtS-d8?si=1ZP4ZSId0h3Zb0Uw",
                    ThuTu = 6
                },
                new BaiHocModel
                {
                    MaBaiHoc = 65,
                    MaChuong = 20,
                    TieuDe = "Kiểu dữ liệu Boolean",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tìm hiểu về kiểu dữ liệu Boolean và giá trị true/false</p>",
                    ThoiLuong = 780, // 13 phút
                    LinkVideo = "https://www.youtube.com/embed/9cZEG1SSSQc?si=Eohx5LEBldikCsgv",
                    ThuTu = 7
                },
                new BaiHocModel
                {
                    MaBaiHoc = 66,
                    MaChuong = 20,
                    TieuDe = "Câu lệnh điều kiện If - Else",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Sử dụng câu lệnh điều kiện if-else để điều khiển luồng chương trình</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/9MpHrdWBdxg?si=Ctyh_tmLGGJ71Rov",
                    ThuTu = 8
                },
                new BaiHocModel
                {
                    MaBaiHoc = 67,
                    MaChuong = 20,
                    TieuDe = "Toán tử so sánh trong JavaScript (phần 2)",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phần 2: Toán tử so sánh nâng cao và type coercion</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/meCXeMeyFdE?si=axuLDkpaE6apxulc",
                    ThuTu = 9
                },

                // CHƯƠNG 21: Làm việc với hàm
                new BaiHocModel
                {
                    MaBaiHoc = 68,
                    MaChuong = 21,
                    TieuDe = "Hàm trong JavaScript",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Khái niệm và cách tạo hàm trong JavaScript</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/4g9ENVc2KLA?si=tFujXiYPhAfK2TSJ",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 69,
                    MaChuong = 21,
                    TieuDe = "Tham số trong hàm",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Cách truyền và sử dụng tham số trong hàm JavaScript</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/jE6UPl17Nvo?si=yN9WL4koZqObb9za",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 70,
                    MaChuong = 21,
                    TieuDe = "Return trong hàm JS",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Sử dụng từ khóa return để trả về giá trị từ hàm</p>",
                    ThoiLuong = 840, // 14 phút
                    LinkVideo = "https://www.youtube.com/embed/OOoeAIrn69M?si=kp3j4L6lFtjC9e4a",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 71,
                    MaChuong = 21,
                    TieuDe = "Hiểu hơn về function",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Khái niệm nâng cao về function trong JavaScript</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/aTQojRq0N4c?si=zMY3mJOOWp63DsI0",
                    ThuTu = 4
                },
                new BaiHocModel
                {
                    MaBaiHoc = 72,
                    MaChuong = 21,
                    TieuDe = "Các loại function",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu các loại function: declaration, expression, arrow function</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/scwab9DMNtM?si=Ug3LbHXMcbpeVrA6",
                    ThuTu = 5
                },

                // CHƯƠNG 22: Làm việc với mảng
                new BaiHocModel
                {
                    MaBaiHoc = 73,
                    MaChuong = 22,
                    TieuDe = "Làm việc với mảng",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Khái niệm và cách làm việc với mảng trong JavaScript</p>",
                    ThoiLuong = 1320, // 22 phút
                    LinkVideo = "https://www.youtube.com/embed/AT-yhX26_Ao?si=e54QJFdLBMSstjFN",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 74,
                    MaChuong = 22,
                    TieuDe = "Array map method",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Sử dụng phương thức map() để biến đổi các phần tử trong mảng</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/-xZkVmkDwbU?si=fsIbO2aWeVht40pj",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 75,
                    MaChuong = 22,
                    TieuDe = "Phương thức reduce",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Sử dụng phương thức reduce() để tính toán tổng hợp trên mảng</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/-JMh3A556cw?si=zePj4wqdRznZlvH4",
                    ThuTu = 3
                },

                // CHƯƠNG 23: Form validation
                new BaiHocModel
                {
                    MaBaiHoc = 76,
                    MaChuong = 23,
                    TieuDe = "Form validation - Phần 1",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phần 1: Giới thiệu về form validation với JavaScript</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/ZdvRm1bfGAk?si=XDnh_xokoGRI5SeD",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 77,
                    MaChuong = 23,
                    TieuDe = "Form validation - Phần 2",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phần 2: Validate các trường input cơ bản</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/scybnB9vYVQ?si=kzfvyuuj9ja9KtG2",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 78,
                    MaChuong = 23,
                    TieuDe = "Form validation - Phần 3",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phần 3: Validate email và password</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/LpgoBaULw30?si=DynUjTHSMZoCwtdA",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 79,
                    MaChuong = 23,
                    TieuDe = "Form validation - Phần 4",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phần 4: Hiển thị thông báo lỗi và hoàn thiện form validation</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/jRnBvlMUvK0?si=XoBWKyhwtSaG2Afk",
                    ThuTu = 4
                },
                new BaiHocModel
                {
                    MaBaiHoc = 80, // Tiếp tục từ số 80
                    MaChuong = 24,
                    TieuDe = "Ứng Dụng Cảnh Báo Khi Chạm Tay Lên Mặt",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu về ứng dụng AI phát hiện hành vi chạm tay lên mặt và ứng dụng trong phòng chống dịch bệnh</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/r6GWbQL-qwA?si=QbPo3dUWrf_Gqetr",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 81,
                    MaChuong = 24,
                    TieuDe = "Demo",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Demo ứng dụng hoàn chỉnh và cách thức hoạt động</p>",
                    ThoiLuong = 600, // 10 phút
                    LinkVideo = "https://www.youtube.com/embed/WIyfBMdtNTE?si=I3XlU3YXgMSVDmwN",
                    ThuTu = 2
                },

                // CHƯƠNG 25: Xây dựng
                new BaiHocModel
                {
                    MaBaiHoc = 82,
                    MaChuong = 25,
                    TieuDe = "Cài đặt NodeJS",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn cài đặt Node.js và npm cho dự án React</p>",
                    ThoiLuong = 720, // 12 phút
                    LinkVideo = "https://www.youtube.com/embed/bqXyrCjT7V4?si=Jt2REUtdOdQn8FA4",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 83,
                    MaChuong = 25,
                    TieuDe = "Create react app",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tạo dự án React mới với Create React App</p>",
                    ThoiLuong = 600, // 10 phút
                    LinkVideo = "https://www.youtube.com/embed/3IWNmXKmRqo?si=I0tuf0MDLFOvKbB3",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 84,
                    MaChuong = 25,
                    TieuDe = "Cài đặt thư viện cho ứng dụng",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Cài đặt các thư viện cần thiết: TensorFlow.js, react-webcam, và các dependency khác</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/3klHfl2fOb0?si=LiXerT1JPdy96eRh",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 85,
                    MaChuong = 25,
                    TieuDe = "Dựng giao diện khung",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Xây dựng giao diện cơ bản cho ứng dụng với React components</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/b5NEWtDwc_0?si=QtMx5Ub2HWEy6BBm",
                    ThuTu = 4
                },
                new BaiHocModel
                {
                    MaBaiHoc = 86,
                    MaChuong = 25,
                    TieuDe = "Import thư viện cần thiết",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Import và cấu hình các thư viện đã cài đặt vào dự án</p>",
                    ThoiLuong = 780, // 13 phút
                    LinkVideo = "https://www.youtube.com/embed/jjZGa8foO0s?si=nhKVXj2Mgexn0WFp",
                    ThuTu = 5
                },
                new BaiHocModel
                {
                    MaBaiHoc = 87,
                    MaChuong = 25,
                    TieuDe = "Xây dựng phần Video Stream",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Triển khai chức năng stream video từ webcam với react-webcam</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/uXvZyCnaZ7Y?si=ATry-U-5uD1xvuwH",
                    ThuTu = 6
                },

                // CHƯƠNG 26: Train function
                new BaiHocModel
                {
                    MaBaiHoc = 88,
                    MaChuong = 26,
                    TieuDe = "Setup thư viện TensorFlow",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Cấu hình TensorFlow.js và model machine learning cho ứng dụng</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/KuDJjRU8XfY?si=UK8g8kDBZSTwyr2k",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 89,
                    MaChuong = 26,
                    TieuDe = "Viết function training",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Viết hàm training model để phát hiện hành vi chạm tay lên mặt</p>",
                    ThoiLuong = 1500, // 25 phút
                    LinkVideo = "https://www.youtube.com/embed/xjXoFX3X2yg?si=O8iZFjdXPyln_FIT",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 90,
                    MaChuong = 26,
                    TieuDe = "Giải thích cách hoạt động",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giải thích cơ chế hoạt động của model machine learning trong ứng dụng</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/C4jm3RWSw10?si=dRccDX_CFe6VpfeL",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 91,
                    MaChuong = 26,
                    TieuDe = "Triển khai phần âm thanh và thông báo",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Thêm chức năng cảnh báo bằng âm thanh và thông báo khi phát hiện chạm tay lên mặt</p>",
                    ThoiLuong = 1320, // 22 phút
                    LinkVideo = "https://www.youtube.com/embed/pwWS_VcR9Ks?si=Z38-HOt_QchT-t0i",
                    ThuTu = 4
                },
                new BaiHocModel
                {
                    MaBaiHoc = 92,
                    MaChuong = 26,
                    TieuDe = "Hướng dẫn Training hiệu quả",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn cách training model hiệu quả và tối ưu độ chính xác</p>",
                    ThoiLuong = 1800, // 30 phút
                    LinkVideo = "https://www.youtube.com/embed/D5Xd9FByKXc?si=ISfXlB2hgjruCYGf",
                    ThuTu = 5
                },
                new BaiHocModel
                {
                    MaBaiHoc = 93, // Tiếp tục từ số 93
                    MaChuong = 27,
                    TieuDe = "Lời khuyên trước khóa học",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Những lời khuyên hữu ích trước khi bắt đầu học Node.js và ExpressJS</p>",
                    ThoiLuong = 600, // 10 phút
                    LinkVideo = "https://www.youtube.com/embed/z2f7RHgvddc?si=jkZ2cKsYrIwrndS7",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 94,
                    MaChuong = 27,
                    TieuDe = "Giao thức HTTP",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tìm hiểu về giao thức HTTP, phương thức và trạng thái response</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/SdcdneSdoV4?si=IwwaJJjfdpDQea9d",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 95,
                    MaChuong = 27,
                    TieuDe = "SSR & CSR",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Phân biệt Server-Side Rendering (SSR) và Client-Side Rendering (CSR)</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/HLEu57iLrRo?si=sQt0ZQ9HG4rQEmay",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 96,
                    MaChuong = 27,
                    TieuDe = "Cài đặt NodeJS",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn cài đặt Node.js và npm trên các hệ điều hành</p>",
                    ThoiLuong = 720, // 12 phút
                    LinkVideo = "https://www.youtube.com/embed/CcSuYLjKW3g?si=NKAcYepnILR1ViUA",
                    ThuTu = 4
                },
                new BaiHocModel
                {
                    MaBaiHoc = 97,
                    MaChuong = 27,
                    TieuDe = "Cài đặt Express framework",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn cài đặt ExpressJS framework và tạo dự án đầu tiên</p>",
                    ThoiLuong = 840, // 14 phút
                    LinkVideo = "https://www.youtube.com/embed/tfQXZ8jES6A?si=xRlgIvNei37_j0bk",
                    ThuTu = 5
                },
                new BaiHocModel
                {
                    MaBaiHoc = 98,
                    MaChuong = 27,
                    TieuDe = "Sử dụng thư viện Nodemon",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Cài đặt và sử dụng Nodemon để tự động restart server khi code thay đổi</p>",
                    ThoiLuong = 600, // 10 phút
                    LinkVideo = "https://www.youtube.com/embed/zCFOn4YXr00?si=20MxnAHBHsfcKvjz",
                    ThuTu = 6
                },
                new BaiHocModel
                {
                    MaBaiHoc = 99,
                    MaChuong = 27,
                    TieuDe = "Add source code lên Github",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn quản lý source code với Git và đẩy code lên Github</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/f0C9kTOf6IY?si=Dp4AZSxSV1-jN9w2",
                    ThuTu = 7
                },
                new BaiHocModel
                {
                    MaBaiHoc = 100,
                    MaChuong = 27,
                    TieuDe = "Cài đặt thư viện Morgan",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Sử dụng Morgan middleware để log HTTP requests trong ExpressJS</p>",
                    ThoiLuong = 660, // 11 phút
                    LinkVideo = "https://www.youtube.com/embed/seI--u0hSeg?si=1c9-HMYFSBSNxIVJ",
                    ThuTu = 8
                },

                // CHƯƠNG 28: Kiến thức cốt lõi
                new BaiHocModel
                {
                    MaBaiHoc = 101,
                    MaChuong = 28,
                    TieuDe = "Khái niệm Template Engine",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu về Template Engine và cách sử dụng trong ExpressJS</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/lpbl2qQXbDo?si=fbhZmFuRf_Z1nSbC",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 102,
                    MaChuong = 28,
                    TieuDe = "Cấu hình sử dụng file tĩnh",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Cấu hình ExpressJS để phục vụ các file tĩnh (CSS, JavaScript, images)</p>",
                    ThoiLuong = 780, // 13 phút
                    LinkVideo = "https://www.youtube.com/embed/BxZNiLo-OA0?si=9YrQE5TkoQo87idU",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 103,
                    MaChuong = 28,
                    TieuDe = "Tích hợp Bootstrap",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tích hợp Bootstrap framework vào dự án ExpressJS</p>",
                    ThoiLuong = 720, // 12 phút
                    LinkVideo = "https://www.youtube.com/embed/zNLXsTu_kUA?si=IWXvEf4MJgF0C5_Y",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 104,
                    MaChuong = 28,
                    TieuDe = "Basic routing",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tạo các route cơ bản trong ExpressJS</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/Wz6WghmEmFk?si=ppmhAov6Wi0f-LG2",
                    ThuTu = 4
                },
                new BaiHocModel
                {
                    MaBaiHoc = 105,
                    MaChuong = 28,
                    TieuDe = "Phương thức GET",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Sử dụng phương thức GET để xử lý các request lấy dữ liệu</p>",
                    ThoiLuong = 840, // 14 phút
                    LinkVideo = "https://www.youtube.com/embed/BbBagzvrSto?si=y3ySiHHMnmwbQay9",
                    ThuTu = 5
                },
                new BaiHocModel
                {
                    MaBaiHoc = 106,
                    MaChuong = 28,
                    TieuDe = "Chuỗi truy vấn",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Xử lý query string trong URL với ExpressJS</p>",
                    ThoiLuong = 720, // 12 phút
                    LinkVideo = "https://www.youtube.com/embed/6LdwSrTCmo4?si=Oc9ZK6a3gNioq_8e",
                    ThuTu = 6
                },
                new BaiHocModel
                {
                    MaBaiHoc = 107,
                    MaChuong = 28,
                    TieuDe = "Form default behavior",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tìm hiểu về hành vi mặc định của HTML form</p>",
                    ThoiLuong = 660, // 11 phút
                    LinkVideo = "https://www.youtube.com/embed/wCF8pIbOOpo?si=lnpa3zXNO56irhkh",
                    ThuTu = 7
                },
                new BaiHocModel
                {
                    MaBaiHoc = 108,
                    MaChuong = 28,
                    TieuDe = "Phương thức POST",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Sử dụng phương thức POST để xử lý form submission</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/LlfdqnK28Cg?si=fFr6ofi7s3LucQ-N",
                    ThuTu = 8
                },

                // CHƯƠNG 29: Xây dựng website
                new BaiHocModel
                {
                    MaBaiHoc = 109,
                    MaChuong = 29,
                    TieuDe = "Mô hình MVC",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu về mô hình MVC (Model-View-Controller) trong ExpressJS</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/N8GhaR7K3tI?si=ChVEACoPm57PsbWU",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 110,
                    MaChuong = 29,
                    TieuDe = "MVC Routes & Controllers",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Xây dựng routes và controllers theo mô hình MVC</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/Pd_ZIpCVZPc?si=3uYoOu86VehDbpnt",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 111,
                    MaChuong = 29,
                    TieuDe = "Cài đặt Mongodb",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn cài đặt và cấu hình MongoDB cho dự án</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/5Odp8lcAvyA?si=9bORfXTxWX-p4z-m",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 112,
                    MaChuong = 29,
                    TieuDe = "Thư viện Prettier",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Cài đặt và cấu hình Prettier để format code tự động</p>",
                    ThoiLuong = 660, // 11 phút
                    LinkVideo = "https://www.youtube.com/embed/kyNyMfRCavg?si=9X5dfSg9fLgNDVzk",
                    ThuTu = 4
                },
                new BaiHocModel
                {
                    MaBaiHoc = 113,
                    MaChuong = 29,
                    TieuDe = "Xây dựng thành phần Model trong mô hình MVC",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tạo Model để tương tác với database MongoDB</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/uAXpEmTZhfA?si=9fd8m315tvTZHUDm",
                    ThuTu = 5
                },
                new BaiHocModel
                {
                    MaBaiHoc = 114,
                    MaChuong = 29,
                    TieuDe = "Cài đặt JSON Viewer",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Cài đặt công cụ để xem JSON data dễ dàng hơn</p>",
                    ThoiLuong = 600, // 10 phút
                    LinkVideo = "https://www.youtube.com/embed/PYjZV9HPLRs?si=aE3E3kf0Amt6X-73",
                    ThuTu = 6
                },
                new BaiHocModel
                {
                    MaBaiHoc = 115,
                    MaChuong = 29,
                    TieuDe = "Đọc Database",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Viết code để đọc dữ liệu từ MongoDB database</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/nqLXmpEgU2w?si=ejJ8kLsnxDBtHE4b",
                    ThuTu = 7
                },
                new BaiHocModel
                {
                    MaBaiHoc = 116,
                    MaChuong = 29,
                    TieuDe = "Xây dựng trang chi tiết",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tạo trang hiển thị chi tiết một item từ database</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/LnTPJcUQdNU?si=NeAQFq8KlvzaP7zX",
                    ThuTu = 8
                },
                new BaiHocModel
                {
                    MaBaiHoc = 117,
                    MaChuong = 29,
                    TieuDe = "Dựng trang tạo mới khóa học",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Xây dựng form và logic để tạo mới khóa học</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/bvZ1_P9eCpw?si=Kq5NwkNFxPTbpj4M",
                    ThuTu = 9
                },
                new BaiHocModel
                {
                    MaBaiHoc = 118,
                    MaChuong = 29,
                    TieuDe = "Dựng trang chỉnh sửa",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tạo trang và chức năng chỉnh sửa thông tin khóa học</p>",
                    ThoiLuong = 1320, // 22 phút
                    LinkVideo = "https://www.youtube.com/embed/HdVOT7Neh18?si=6qIbTAoX4FEwmoJS",
                    ThuTu = 10
                },
                new BaiHocModel
                {
                    MaBaiHoc = 119,
                    MaChuong = 29,
                    TieuDe = "Hoàn thiện logic chức năng Sort",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Triển khai chức năng sắp xếp (sort) dữ liệu</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/-10W8ZmNlcg?si=fys6OyTO5NB_0jiP",
                    ThuTu = 11
                },
                new BaiHocModel
                {
                    MaBaiHoc = 120, // Tiếp tục từ số 120
                    MaChuong = 30,
                    TieuDe = "Khái niệm responsive",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu về responsive web design và tầm quan trọng trong thiết kế hiện đại</p>",
                    ThoiLuong = 720, // 12 phút
                    LinkVideo = "https://www.youtube.com/embed/uz5LIP85J5Y?si=Ff8E3BwYC4Qc0phk",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 121,
                    MaChuong = 30,
                    TieuDe = "Cần làm gì để thực hiện responsive khi thiết kế website",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Các bước và kỹ thuật cần thiết để thiết kế website responsive</p>",
                    ThoiLuong = 840, // 14 phút
                    LinkVideo = "https://www.youtube.com/embed/5QT0aeovTTY?si=bGlPkMN6NNPo9ZUI",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 122,
                    MaChuong = 30,
                    TieuDe = "Cài đặt và sử dụng công cụ responsive web",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu các công cụ và extension hỗ trợ responsive design</p>",
                    ThoiLuong = 660, // 11 phút
                    LinkVideo = "https://www.youtube.com/embed/CIIYogDrGto?si=L-duzdQHVlF1opO-",
                    ThuTu = 3
                },

                // CHƯƠNG 31: Viewport, @media, breakpoint
                new BaiHocModel
                {
                    MaBaiHoc = 123,
                    MaChuong = 31,
                    TieuDe = "Khái niệm Viewport",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tìm hiểu về viewport meta tag và vai trò trong responsive design</p>",
                    ThoiLuong = 600, // 10 phút
                    LinkVideo = "https://www.youtube.com/embed/XJiq_d0vGCQ?si=WHwUTJ--ANrYNRem",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 124,
                    MaChuong = 31,
                    TieuDe = "Thuộc tính Media query (@media)",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Sử dụng CSS media queries để áp dụng styles cho các thiết bị khác nhau</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/YgkzJkmDP3U?si=82oswyIzYnqV4S9V",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 125,
                    MaChuong = 31,
                    TieuDe = "Khái niệm Breakpoints trong responsive",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hiểu về breakpoints và cách chọn breakpoints phù hợp cho thiết kế</p>",
                    ThoiLuong = 780, // 13 phút
                    LinkVideo = "https://www.youtube.com/embed/0i37IU0wjlI?si=S692S7nLRwDoIPHy",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 126,
                    MaChuong = 31,
                    TieuDe = "Sử dụng đơn vị nào khi dùng Media queries",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Lựa chọn đơn vị đo lường phù hợp (px, em, rem, %, vw, vh) cho media queries</p>",
                    ThoiLuong = 720, // 12 phút
                    LinkVideo = "https://www.youtube.com/embed/aywAr27pkWE?si=WBoVYOgwUz-pCmi2",
                    ThuTu = 4
                },

                // CHƯƠNG 32: Thực hành nhỏ
                new BaiHocModel
                {
                    MaBaiHoc = 127,
                    MaChuong = 32,
                    TieuDe = "Thực hành responsive",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Thực hành tạo layout responsive cơ bản với media queries</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/-NK4jLekauw?si=3NbBMO3ybHMY3l5P",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 128,
                    MaChuong = 32,
                    TieuDe = "Responsive cho navigation bar",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tạo navigation bar responsive với hamburger menu cho mobile</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/HYy4c6lcOlM?si=FsYXsiP07J6aZ_7c",
                    ThuTu = 2
                },

                // CHƯƠNG 33: Grid system
                new BaiHocModel
                {
                    MaBaiHoc = 129,
                    MaChuong = 33,
                    TieuDe = "Khái niệm Grid system",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu về CSS Grid Layout và các khái niệm cơ bản</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/lvD5K50TZPk?si=YWld4DwlpIwRMPEO",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 130,
                    MaChuong = 33,
                    TieuDe = "Khái niệm Grid system phần 2",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Các thuộc tính nâng cao của CSS Grid: grid-template-areas, grid-auto-flow, justify-items, align-items</p>",
                    ThoiLuong = 960, // 16 phút
                    LinkVideo = "https://www.youtube.com/embed/iKlMB01w47g?si=xhLnegsjgfEPBKic",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 131,
                    MaChuong = 33,
                    TieuDe = "Tạo thư viện CSS ứng dụng Grid system",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Xây dựng thư viện CSS custom sử dụng Grid System để tái sử dụng</p>",
                    ThoiLuong = 1200, // 20 phút
                    LinkVideo = "https://www.youtube.com/embed/ScZaj1eG7DQ?si=8aPgvKNracyn4weX",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 132, // Tiếp tục từ số 132
                    MaChuong = 34,
                    TieuDe = "Giới thiệu Windows Terminal & WSL",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu tổng quan về Windows Terminal và Windows Subsystem for Linux (WSL)</p>",
                    ThoiLuong = 600, // 10 phút
                    LinkVideo = "https://www.youtube.com/embed/7ppRSaGT1uw?si=jW7RVXUlpcXVAc4w",
                    ThuTu = 1
                },

                // CHƯƠNG 35: Window Terminal & WSL
                new BaiHocModel
                {
                    MaBaiHoc = 133,
                    MaChuong = 35,
                    TieuDe = "Window Terminal install",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn cài đặt Windows Terminal từ Microsoft Store và cấu hình cơ bản</p>",
                    ThoiLuong = 720, // 12 phút
                    LinkVideo = "https://www.youtube.com/embed/egSxAF-Sak4?si=MFZbkp7kXiuFKL6t",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 134,
                    MaChuong = 35,
                    TieuDe = "Cài đặt Ubuntu với WSL 1",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn cài đặt Ubuntu trên Windows thông qua WSL (Windows Subsystem for Linux)</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/ypvjxw5qBK0?si=7Pg70wbWgb0H785u",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 135,
                    MaChuong = 35,
                    TieuDe = "Update Packages Ubuntu",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Cách cập nhật packages và hệ thống Ubuntu sau khi cài đặt</p>",
                    ThoiLuong = 600, // 10 phút
                    LinkVideo = "https://www.youtube.com/embed/1jsHfX2WomA?si=h30pQNipb3m8AOW6",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 136,
                    MaChuong = 35,
                    TieuDe = "Các lệnh trong Ubuntu",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu các lệnh cơ bản trong Ubuntu/Linux terminal</p>",
                    ThoiLuong = 780, // 13 phút
                    LinkVideo = "https://www.youtube.com/embed/1UIe8sHXN5c?si=U3IQfm_H2UCbsRTt",
                    ThuTu = 4
                },

                // CHƯƠNG 36: Các lệnh Linux cơ bản
                new BaiHocModel
                {
                    MaBaiHoc = 137,
                    MaChuong = 36,
                    TieuDe = "Lệnh ls, cd, clear trong Ubuntu/Linux",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn sử dụng các lệnh cơ bản: ls (liệt kê file), cd (di chuyển), clear (xóa màn hình)</p>",
                    ThoiLuong = 840, // 14 phút
                    LinkVideo = "https://www.youtube.com/embed/1UIe8sHXN5c?si=xFojRSQx27MQJbw1",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 138,
                    MaChuong = 36,
                    TieuDe = "Lệnh mkdir, touch, vi trong Ubuntu/Linux",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn sử dụng lệnh tạo thư mục (mkdir), tạo file (touch) và editor vi</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/ozBhz7il5Ts?si=HlrGNoLwNygz4bmu",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 139,
                    MaChuong = 36,
                    TieuDe = "Lệnh cat, echo, tail, grep trong Ubuntu/Linux",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn sử dụng lệnh xem file (cat), in text (echo), xem cuối file (tail), tìm kiếm (grep)</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/l5mLKwWjSe8?si=Vz27TDiC5f_U-qAk",
                    ThuTu = 3
                },

                // CHƯƠNG 37: Chạy dự án React, Node, Laravel
                new BaiHocModel
                {
                    MaBaiHoc = 140,
                    MaChuong = 37,
                    TieuDe = "Cài đặt NodeJS trên WSL",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn cài đặt Node.js và npm trên WSL/Ubuntu</p>",
                    ThoiLuong = 720, // 12 phút
                    LinkVideo = "https://www.youtube.com/embed/9rddrjDkmWo?si=IV_P1behSManoGLz",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 141,
                    MaChuong = 37,
                    TieuDe = "Tạo dự án ReactJS trên WSL",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tạo và chạy dự án React.js trên môi trường WSL/Ubuntu</p>",
                    ThoiLuong = 780, // 13 phút
                    LinkVideo = "https://www.youtube.com/embed/aj3HXDfrM2Q?si=razVM3G1PB2FJ5Sa",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 142,
                    MaChuong = 37,
                    TieuDe = "Tạo và chạy dự án ExpressJS trên WSL",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Tạo dự án Express.js backend và chạy trên WSL/Ubuntu</p>",
                    ThoiLuong = 900, // 15 phút
                    LinkVideo = "https://www.youtube.com/embed/MpYEUtbbFSg?si=vC2KMpr6WcYVuyWh",
                    ThuTu = 3
                },

                // CHƯƠNG 38: Deploy dự án với server thật
                new BaiHocModel
                {
                    MaBaiHoc = 143,
                    MaChuong = 38,
                    TieuDe = "Deploy dự án với Server thật",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Giới thiệu quy trình deploy ứng dụng web lên server thật</p>",
                    ThoiLuong = 600, // 10 phút
                    LinkVideo = "https://www.youtube.com/embed/ScLOfVwezKU?si=Xx3iU0ddzdjAfsMR",
                    ThuTu = 1
                },
                new BaiHocModel
                {
                    MaBaiHoc = 144,
                    MaChuong = 38,
                    TieuDe = "Mua tên miền website",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn mua và cấu hình domain name cho website</p>",
                    ThoiLuong = 720, // 12 phút
                    LinkVideo = "https://www.youtube.com/embed/7RjjF8Ee7Ws?si=Qe3vEJXncfyrlmcb",
                    ThuTu = 2
                },
                new BaiHocModel
                {
                    MaBaiHoc = 145,
                    MaChuong = 38,
                    TieuDe = "Tạo User trên máy chủ Linux/Ubuntu",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn tạo user và phân quyền trên server Linux/Ubuntu</p>",
                    ThoiLuong = 660, // 11 phút
                    LinkVideo = "https://www.youtube.com/embed/CLJSI2xO1Mo?si=5Mp01POpJtJ3g-DT",
                    ThuTu = 3
                },
                new BaiHocModel
                {
                    MaBaiHoc = 146,
                    MaChuong = 38,
                    TieuDe = "Cài đặt và cấu hình Nginx cơ bản trên Ubuntu",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn cài đặt và cấu hình Nginx web server trên Ubuntu</p>",
                    ThoiLuong = 1080, // 18 phút
                    LinkVideo = "https://www.youtube.com/embed/1sdaPoXWQrw?si=1p8toXNCTx7h1Jrb",
                    ThuTu = 4
                },
                new BaiHocModel
                {
                    MaBaiHoc = 147,
                    MaChuong = 38,
                    TieuDe = "Upload Source Code lên máy chủ với Filezilla",
                    LoaiBaiHoc = "Video",
                    NoiDung = "<p>Hướng dẫn upload source code lên server sử dụng Filezilla FTP client</p>",
                    ThoiLuong = 840, // 14 phút
                    LinkVideo = "https://www.youtube.com/embed/fvs_wjEd0Ks?si=bCRTTR1ORZTjV3B6",
                    ThuTu = 5
                }
            );
        }
    }
}