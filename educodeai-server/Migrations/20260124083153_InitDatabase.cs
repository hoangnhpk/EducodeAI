using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class InitDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NgonNguLapTrinhs",
                columns: table => new
                {
                    MaNgonNgu = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenNgonNgu = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NgonNguLapTrinhs", x => x.MaNgonNgu);
                });

            migrationBuilder.CreateTable(
                name: "NguoiDungs",
                columns: table => new
                {
                    MaNguoiDung = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TaiKhoan = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MatKhau = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    GoogleID = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    HoTen = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AnhDaiDien = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    VaiTro = table.Column<int>(type: "int", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    NgayThamGia = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NguoiDungs", x => x.MaNguoiDung);
                });

            migrationBuilder.CreateTable(
                name: "CuocHoiThoaiAIs",
                columns: table => new
                {
                    MaHoiThoai = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNguoiDung = table.Column<int>(type: "int", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CuocHoiThoaiAIs", x => x.MaHoiThoai);
                    table.ForeignKey(
                        name: "FK_CuocHoiThoaiAIs_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "KhoaHocs",
                columns: table => new
                {
                    MaKhoaHoc = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaGiangVien = table.Column<int>(type: "int", nullable: false),
                    TenKhoaHoc = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HinhAnh = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DiemDanhGiaTB = table.Column<double>(type: "float", nullable: false),
                    LinhVuc = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TrinhDo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ThoiLuongGio = table.Column<int>(type: "int", nullable: false),
                    KyNangChinh = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KhoaHocs", x => x.MaKhoaHoc);
                    table.ForeignKey(
                        name: "FK_KhoaHocs_NguoiDungs_MaGiangVien",
                        column: x => x.MaGiangVien,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "LoTrinhAIs",
                columns: table => new
                {
                    MaLoTrinh = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNguoiDung = table.Column<int>(type: "int", nullable: false),
                    YeuCau = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NoiDungJSON = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoTrinhAIs", x => x.MaLoTrinh);
                    table.ForeignKey(
                        name: "FK_LoTrinhAIs_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "TinNhanAIs",
                columns: table => new
                {
                    MaTinNhan = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaHoiThoai = table.Column<int>(type: "int", nullable: false),
                    VaiTro = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ThoiGian = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TinNhanAIs", x => x.MaTinNhan);
                    table.ForeignKey(
                        name: "FK_TinNhanAIs_CuocHoiThoaiAIs_MaHoiThoai",
                        column: x => x.MaHoiThoai,
                        principalTable: "CuocHoiThoaiAIs",
                        principalColumn: "MaHoiThoai");
                });

            migrationBuilder.CreateTable(
                name: "ChuongHocs",
                columns: table => new
                {
                    MaChuong = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaKhoaHoc = table.Column<int>(type: "int", nullable: false),
                    TenChuong = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ThuTu = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChuongHocs", x => x.MaChuong);
                    table.ForeignKey(
                        name: "FK_ChuongHocs_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                });

            migrationBuilder.CreateTable(
                name: "DangKyKhoaHocs",
                columns: table => new
                {
                    MaDangKy = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNguoiDung = table.Column<int>(type: "int", nullable: false),
                    MaKhoaHoc = table.Column<int>(type: "int", nullable: false),
                    NgayDangKy = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TienDo = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DangKyKhoaHocs", x => x.MaDangKy);
                    table.ForeignKey(
                        name: "FK_DangKyKhoaHocs_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                    table.ForeignKey(
                        name: "FK_DangKyKhoaHocs_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "DanhGias",
                columns: table => new
                {
                    MaDanhGia = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNguoiDung = table.Column<int>(type: "int", nullable: false),
                    MaKhoaHoc = table.Column<int>(type: "int", nullable: false),
                    SoSao = table.Column<int>(type: "int", nullable: false),
                    NhanXet = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    NgayDanhGia = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DanhGias", x => x.MaDanhGia);
                    table.ForeignKey(
                        name: "FK_DanhGias_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                    table.ForeignKey(
                        name: "FK_DanhGias_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "BaiHocs",
                columns: table => new
                {
                    MaBaiHoc = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaChuong = table.Column<int>(type: "int", nullable: false),
                    TieuDe = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LoaiBaiHoc = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ThoiLuong = table.Column<int>(type: "int", nullable: true),
                    LinkVideo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ThuTu = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaiHocs", x => x.MaBaiHoc);
                    table.ForeignKey(
                        name: "FK_BaiHocs_ChuongHocs_MaChuong",
                        column: x => x.MaChuong,
                        principalTable: "ChuongHocs",
                        principalColumn: "MaChuong");
                });

            migrationBuilder.CreateTable(
                name: "BaiTaps",
                columns: table => new
                {
                    MaBaiTap = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaBaiHoc = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaiTaps", x => x.MaBaiTap);
                    table.ForeignKey(
                        name: "FK_BaiTaps_BaiHocs_MaBaiHoc",
                        column: x => x.MaBaiHoc,
                        principalTable: "BaiHocs",
                        principalColumn: "MaBaiHoc");
                });

            migrationBuilder.CreateTable(
                name: "BinhLuans",
                columns: table => new
                {
                    MaBinhLuan = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNguoiDung = table.Column<int>(type: "int", nullable: false),
                    MaBaiHoc = table.Column<int>(type: "int", nullable: false),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MaBinhLuanCha = table.Column<int>(type: "int", nullable: true),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BinhLuans", x => x.MaBinhLuan);
                    table.ForeignKey(
                        name: "FK_BinhLuans_BaiHocs_MaBaiHoc",
                        column: x => x.MaBaiHoc,
                        principalTable: "BaiHocs",
                        principalColumn: "MaBaiHoc");
                    table.ForeignKey(
                        name: "FK_BinhLuans_BinhLuans_MaBinhLuanCha",
                        column: x => x.MaBinhLuanCha,
                        principalTable: "BinhLuans",
                        principalColumn: "MaBinhLuan");
                    table.ForeignKey(
                        name: "FK_BinhLuans_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "GhiChuBaiHocs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNguoiDung = table.Column<int>(type: "int", nullable: false),
                    MaBaiHoc = table.Column<int>(type: "int", nullable: false),
                    ThoiGianVideo = table.Column<int>(type: "int", nullable: false),
                    NoiDung = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GhiChuBaiHocs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GhiChuBaiHocs_BaiHocs_MaBaiHoc",
                        column: x => x.MaBaiHoc,
                        principalTable: "BaiHocs",
                        principalColumn: "MaBaiHoc");
                    table.ForeignKey(
                        name: "FK_GhiChuBaiHocs_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "TienDoBaiHocs",
                columns: table => new
                {
                    MaTienDo = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNguoiDung = table.Column<int>(type: "int", nullable: false),
                    MaBaiHoc = table.Column<int>(type: "int", nullable: false),
                    DaXem = table.Column<bool>(type: "bit", nullable: false),
                    ThoiGianHoc = table.Column<int>(type: "int", nullable: false),
                    NgayCapNhat = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TienDoBaiHocs", x => x.MaTienDo);
                    table.ForeignKey(
                        name: "FK_TienDoBaiHocs_BaiHocs_MaBaiHoc",
                        column: x => x.MaBaiHoc,
                        principalTable: "BaiHocs",
                        principalColumn: "MaBaiHoc");
                    table.ForeignKey(
                        name: "FK_TienDoBaiHocs_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "BaiTap_Quizs",
                columns: table => new
                {
                    MaBaiTapQuiz = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaBaiTap = table.Column<int>(type: "int", nullable: false),
                    ThoiGianLamBai = table.Column<int>(type: "int", nullable: true),
                    DiemCanDat = table.Column<double>(type: "float", nullable: false),
                    ChoPhepLamLai = table.Column<bool>(type: "bit", nullable: false),
                    DaoCauHoi = table.Column<bool>(type: "bit", nullable: false),
                    DuLieuCauHoi = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaiTap_Quizs", x => x.MaBaiTapQuiz);
                    table.ForeignKey(
                        name: "FK_BaiTap_Quizs_BaiTaps_MaBaiTap",
                        column: x => x.MaBaiTap,
                        principalTable: "BaiTaps",
                        principalColumn: "MaBaiTap");
                });

            migrationBuilder.CreateTable(
                name: "BaiTap_ThucHanhIDEs",
                columns: table => new
                {
                    MaBaiTapThucHanh = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaBaiTap = table.Column<int>(type: "int", nullable: false),
                    MaNgonNgu = table.Column<int>(type: "int", nullable: false),
                    DeBai = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CodeMau = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaiTap_ThucHanhIDEs", x => x.MaBaiTapThucHanh);
                    table.ForeignKey(
                        name: "FK_BaiTap_ThucHanhIDEs_BaiTaps_MaBaiTap",
                        column: x => x.MaBaiTap,
                        principalTable: "BaiTaps",
                        principalColumn: "MaBaiTap");
                    table.ForeignKey(
                        name: "FK_BaiTap_ThucHanhIDEs_NgonNguLapTrinhs_MaNgonNgu",
                        column: x => x.MaNgonNgu,
                        principalTable: "NgonNguLapTrinhs",
                        principalColumn: "MaNgonNgu");
                });

            migrationBuilder.CreateTable(
                name: "KetQuaLamBais",
                columns: table => new
                {
                    MaKetQuaBaiNop = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNguoiDung = table.Column<int>(type: "int", nullable: false),
                    MaBaiTap = table.Column<int>(type: "int", nullable: false),
                    NoiDungNopJSON = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DiemSo = table.Column<float>(type: "real", nullable: false),
                    TrangThai = table.Column<bool>(type: "bit", nullable: false),
                    NgayNop = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KetQuaLamBais", x => x.MaKetQuaBaiNop);
                    table.ForeignKey(
                        name: "FK_KetQuaLamBais_BaiTaps_MaBaiTap",
                        column: x => x.MaBaiTap,
                        principalTable: "BaiTaps",
                        principalColumn: "MaBaiTap");
                    table.ForeignKey(
                        name: "FK_KetQuaLamBais_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "BoThuNghiems",
                columns: table => new
                {
                    MaBoThu = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaBaiTapThucHanh = table.Column<int>(type: "int", nullable: false),
                    DauVao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DauRaMongMuon = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GioiHanThoiGian = table.Column<int>(type: "int", nullable: false),
                    GioiHanBoNho = table.Column<int>(type: "int", nullable: false),
                    AnDanh = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BoThuNghiems", x => x.MaBoThu);
                    table.ForeignKey(
                        name: "FK_BoThuNghiems_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                        column: x => x.MaBaiTapThucHanh,
                        principalTable: "BaiTap_ThucHanhIDEs",
                        principalColumn: "MaBaiTapThucHanh");
                });

            migrationBuilder.InsertData(
                table: "NguoiDungs",
                columns: new[] { "MaNguoiDung", "AnhDaiDien", "Email", "GoogleID", "HoTen", "MatKhau", "NgayThamGia", "TaiKhoan", "TrangThai", "VaiTro" },
                values: new object[,]
                {
                    { 1, "giangvien-avatar.jpg", "giangvien@educodeai.com", "google_giangvien_123", "Trần Thị Giảng Viên", "$2a$11$XcTfQrJ7G8hQ9vZkLmNOPuS5d6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "giangvien", "Hoạt động", 1 },
                    { 2, "admin-avatar.jpg", "nguyenhung22032006@gmail.com", null, "Nguyễn Quốc Hùng", "$2a$11$XcTfQrJ7G8hQ9vZkLmNOPuS5d6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "admin", "Hoạt động", 0 },
                    { 3, "hocvien-avatar.jpg", "hocvien@gmail.com", "google_hocvien_456", "Lê Văn Học Viên", "$2a$11$XcTfQrJ7G8hQ9vZkLmNOPuS5d6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "hocvien", "Hoạt động", 2 }
                });

            migrationBuilder.InsertData(
                table: "KhoaHocs",
                columns: new[] { "MaKhoaHoc", "DiemDanhGiaTB", "HinhAnh", "KyNangChinh", "LinhVuc", "MaGiangVien", "MoTa", "NgayTao", "TenKhoaHoc", "ThoiLuongGio", "TrangThai", "TrinhDo" },
                values: new object[,]
                {
                    { 1, 4.7000000000000002, "cpp-course.jpg", "C++, OOP, Con trỏ, Cấu trúc dữ liệu", "Lập trình hệ thống", 1, "Khóa học toàn diện về lập trình C++, từ cú pháp cơ bản đến các kỹ thuật lập trình nâng cao như con trỏ, OOP, xử lý file", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Lập trình C++ cơ bản, nâng cao", 35, "Hoạt động", "Người mới" },
                    { 2, 4.9000000000000004, "it-foundation.jpg", "IT Foundation, Client-Server, Domain, Career Guidance", "Công nghệ thông tin", 1, "Khóa học cung cấp kiến thức nền tảng về công nghệ thông tin, mô hình client-server, domain, và định hướng nghề nghiệp cho người mới bắt đầu", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Kiến Thức Nhập Môn IT", 8, "Hoạt động", "Người mới" },
                    { 3, 4.7999999999999998, "js-advanced.jpg", "JavaScript, Closure, This, Bind, Call, Apply, Redux", "Web Development", 1, "Khóa học nâng cao về JavaScript, tập trung vào các khái niệm quan trọng như IIFE, Scope, Closure, Hoisting, This, Bind, Call, Apply và thực hành với Redux", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Lập Trình Javascript nâng cao", 15, "Hoạt động", "Trung cấp" },
                    { 4, 4.5999999999999996, "js-basic.jpg", "JavaScript, Functions, Arrays, DOM, Form Validation", "Web Development", 1, "Khóa học JavaScript cơ bản dành cho người mới bắt đầu, từ biến, toán tử, hàm, mảng đến thực hành form validation", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Lập Trình JavaScript Cơ Bản", 20, "Hoạt động", "Người mới" },
                    { 5, 4.9000000000000004, "dont-touch-face.jpg", "React, TensorFlow.js, Machine Learning, Computer Vision", "AI & Machine Learning", 1, "Khóa học thực hành xây dựng ứng dụng AI phát hiện hành vi chạm tay lên mặt sử dụng React, TensorFlow.js và machine learning", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "App 'Đừng Chạm Tay Lên Mặt' - Xây dựng ứng dụng AI với React và TensorFlow", 12, "Hoạt động", "Trung cấp" },
                    { 6, 4.7000000000000002, "node-express.jpg", "Node.js, ExpressJS, MongoDB, REST API, MVC Pattern", "Backend Development", 1, "Khóa học toàn diện về Node.js và ExpressJS, từ cơ bản đến nâng cao, xây dựng RESTful API, MVC pattern, kết nối MongoDB và triển khai ứng dụng web hoàn chỉnh", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Node & ExpressJS - Xây dựng Backend chuyên nghiệp", 25, "Hoạt động", "Người mới" },
                    { 7, 4.7999999999999998, "responsive-grid.jpg", "CSS Grid, Responsive Design, Media Queries, Flexbox, Viewport", "Web Design & UI/UX", 1, "Khóa học chuyên sâu về responsive web design, Grid System, media queries, viewport và kỹ thuật thiết kế website tương thích trên mọi thiết bị", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Responsive Với Grid System - Thiết kế website đa thiết bị", 10, "Hoạt động", "Người mới" },
                    { 8, 4.9000000000000004, "terminal-ubuntu.jpg", "Linux, Ubuntu, WSL, Terminal Commands, Server Deployment, Nginx", "System Administration & DevOps", 1, "Khóa học toàn diện về làm việc với Terminal, WSL, Ubuntu, các lệnh Linux cơ bản đến nâng cao, cài đặt môi trường phát triển và deploy ứng dụng web lên server thật", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Làm việc với Terminal & Ubuntu - Lập trình chuyên nghiệp với Linux", 18, "Hoạt động", "Người mới" }
                });

            migrationBuilder.InsertData(
                table: "ChuongHocs",
                columns: new[] { "MaChuong", "MaKhoaHoc", "TenChuong", "ThuTu" },
                values: new object[,]
                {
                    { 1, 1, "Giới thiệu", 1 },
                    { 2, 1, "Biến và kiểu dữ liệu", 2 },
                    { 3, 1, "Cấu trúc điều khiển và vòng lặp", 3 },
                    { 4, 1, "Mảng", 4 },
                    { 5, 1, "String", 5 },
                    { 6, 1, "Hàm", 6 },
                    { 7, 1, "Con trỏ", 7 },
                    { 8, 1, "Struct", 8 },
                    { 9, 1, "Làm việc với file", 9 },
                    { 10, 1, "Hướng đối tượng (OOP)", 10 },
                    { 11, 2, "Khái niệm kỹ thuật cần biết", 1 },
                    { 12, 2, "Môi trường, con người IT", 2 },
                    { 13, 2, "Phương pháp, định hướng", 3 },
                    { 14, 3, "IIFE, Scope, Closure", 1 },
                    { 15, 3, "Hoisting, Strict Mode, Data Types", 2 },
                    { 16, 3, "This, Bind, Call, Apply", 3 },
                    { 17, 3, "Các bài thực hành", 4 },
                    { 18, 4, "Giới thiệu", 1 },
                    { 19, 4, "Biến, Comments, built-in", 2 },
                    { 20, 4, "Toán tử, kiểu dữ liệu", 3 },
                    { 21, 4, "Làm việc với hàm", 4 },
                    { 22, 4, "Làm việc với mảng", 5 },
                    { 23, 4, "Form validation", 6 },
                    { 24, 5, "Giới thiệu", 1 },
                    { 25, 5, "Xây dựng", 2 },
                    { 26, 5, "Train function", 3 },
                    { 27, 6, "Bắt đầu", 1 },
                    { 28, 6, "Kiến thức cốt lõi", 2 },
                    { 29, 6, "Xây dựng website", 3 },
                    { 30, 7, "Bắt đầu", 1 },
                    { 31, 7, "Viewport, @media, breakpoint", 2 },
                    { 32, 7, "Thực hành nhỏ", 3 },
                    { 33, 7, "Grid system", 4 },
                    { 34, 8, "Giới thiệu", 1 },
                    { 35, 8, "Window Terminal & WSL", 2 },
                    { 36, 8, "Các lệnh Linux cơ bản", 3 },
                    { 37, 8, "Chạy dự án React, Node, Laravel", 4 },
                    { 38, 8, "Deploy dự án với server thật", 5 }
                });

            migrationBuilder.InsertData(
                table: "BaiHocs",
                columns: new[] { "MaBaiHoc", "LinkVideo", "LoaiBaiHoc", "MaChuong", "NoiDung", "ThoiLuong", "ThuTu", "TieuDe" },
                values: new object[,]
                {
                    { 1, "https://www.youtube.com/embed/Da1tpV9TMU0?si=DZQWIaQdB5haoEIy", "Video", 1, "<p>Khóa học Lập trình C++ toàn diện từ cơ bản đến nâng cao</p>", 600, 1, "Giới thiệu khóa học" },
                    { 2, "https://www.youtube.com/embed/9_uoKY0AwqE?si=Zdl_y8quu8_H8eC7", "Video", 1, "<p>Hướng dẫn cài đặt môi trường Dev-C++ để lập trình C++</p>", 900, 2, "Cài đặt Dev-C++" },
                    { 3, "https://www.youtube.com/embed/vFhKEYRBmVY?si=QWnbQ2d8wljLojBr", "Video", 1, "<p>Hướng dẫn chi tiết cách sử dụng Dev-C++ cho người mới bắt đầu</p>", 1200, 3, "Hướng dẫn sử dụng Dev-C++" },
                    { 4, "https://www.youtube.com/embed/Z5O6pxQm6II?si=9dAM9MTkz7h34Uqh", "Video", 2, "<p>Học về biến, cách khai báo và nhập xuất dữ liệu trong C++</p>", 1800, 1, "Biến và nhập xuất dữ liệu" },
                    { 5, "https://www.youtube.com/embed/qpIautEyv2s?si=9ZjnVDDARUaHjH3j", "Video", 2, "<p>Các kiểu dữ liệu cơ bản trong C++: int, float, double, char, bool</p>", 1500, 2, "Kiểu dữ liệu thường gặp" },
                    { 6, "https://www.youtube.com/embed/79mzaFPLEz8?si=pF0GCz_JwF_cyTnL", "Video", 2, "<p>Phân biệt và sử dụng biến cục bộ và biến toàn cục</p>", 1200, 3, "Biến cục bộ và biến toàn cục" },
                    { 7, "https://www.youtube.com/embed/MTbZLshZg0U?si=4-nsRX2u-cFLI2Kg", "Video", 2, "<p>Hướng dẫn ép kiểu dữ liệu và sử dụng bảng mã ASCII</p>", 1500, 4, "Ép kiểu dữ liệu và bảng mã ASCII trong C++" },
                    { 8, "https://www.youtube.com/embed/1ppDCzoB03k?si=2VLBI7_Q43CtcijA", "Video", 3, "<p>Cấu trúc điều kiện if, else if, else trong C++</p>", 1800, 1, "Cấu trúc if else" },
                    { 9, "https://www.youtube.com/embed/W3k6lrN0qG4?si=ZAqIKkrzKXmb0Ex5", "Video", 3, "<p>Cấu trúc rẽ nhành switch case trong C++</p>", 1500, 2, "Cấu trúc switch case" },
                    { 10, "https://www.youtube.com/embed/7uHfTAj3Vao?si=AdEMERWT9I7Rp7bp", "Video", 3, "<p>Các loại vòng lặp: for, while, do-while trong C++</p>", 2400, 3, "Vòng lặp trong C++" },
                    { 11, "https://www.youtube.com/embed/YKeKmpcMcQY?si=eqBwPvJWKayWWPgI", "Video", 3, "<p>Sử dụng toán tử 3 ngôi (ternary operator) trong C++</p>", 900, 4, "Toán tử 3 ngôi trong C++" },
                    { 12, "https://www.youtube.com/embed/Oe27IJSOUUM?si=KWUdCh-o9PWAYKYL", "VanBan", 3, "<p>Bài tập thực hành về vòng lặp trong C++</p>", 1800, 5, "Bài tập về vòng lặp trong C++" },
                    { 13, "https://www.youtube.com/embed/r2FMycOy_2Y?si=NHI3xlLdZch1tV4P", "Video", 3, "<p>Các câu lệnh điều khiển vòng lặp: break, continue, goto</p>", 1200, 6, "Câu lệnh break, continue, goto" },
                    { 14, "https://www.youtube.com/embed/89W1oyXfqgo?si=c6LV4UohjZpp5t4l", "Video", 4, "<p>Khái niệm và cách sử dụng mảng một chiều trong C++</p>", 2100, 1, "Mảng một chiều" },
                    { 15, "https://www.youtube.com/embed/xGpB07JzrQ8?si=shAT_gnDvzcx-uwZ", "Video", 4, "<p>Khái niệm và cách sử dụng mảng 2 chiều (ma trận) trong C++</p>", 2400, 2, "Mảng 2 chiều" },
                    { 16, "https://www.youtube.com/embed/bt4m6VlYQO4?si=rwn3oCMr67ehu9wC", "Video", 4, "<p>Giới thiệu và cài đặt thuật toán sắp xếp bubble sort</p>", 1800, 3, "Thuật toán sắp xếp bubble sort" },
                    { 17, "https://www.youtube.com/embed/Q06peb_sH6k?si=dU3_XU_U2oNwRv50", "Video", 5, "<p>Làm việc với chuỗi (string) trong C++</p>", 2100, 1, "String C++" },
                    { 18, "https://www.youtube.com/embed/duJoNkUE-MA?si=GZssMFpMndfnanPD", "Video", 5, "<p>Các phương thức xử lý chuỗi thường dùng trong C++</p>", 2400, 2, "Các phương thức làm việc với String trong C++" },
                    { 19, "https://www.youtube.com/embed/ay8PEiiP5tU?si=8OCanlJOMHEIM8lW", "Video", 6, "<p>Khái niệm về hàm và lợi ích của việc sử dụng hàm</p>", 1800, 1, "Hàm là gì?" },
                    { 20, "https://www.youtube.com/embed/ATAoEb-ZXKI?si=XRjVv3m-wX8H60gk", "Video", 6, "<p>Phân biệt tham số và đối số trong hàm C++</p>", 1500, 2, "Tham số và đối số trong C++" },
                    { 21, "https://www.youtube.com/embed/NU0joSR66Ag?si=NUrZRiROo23txowt", "Video", 6, "<p>Cách sử dụng đối số mặc định trong hàm C++</p>", 1200, 3, "Đối số mặc định trong hàm" },
                    { 22, "https://www.youtube.com/embed/OQfEPrsWYlY?si=yZwSGw-hbMB-fzC2", "Video", 6, "<p>Phân biệt truyền tham trị và tham chiếu trong C++</p>", 2100, 4, "Tham trị và tham chiếu trong C++" },
                    { 23, "https://www.youtube.com/embed/uBfsM5RJWSI?si=kR-e9npBkrRgpdqp", "Video", 7, "<p>Khái niệm con trỏ và cách sử dụng con trỏ trong C++</p>", 2700, 1, "Con trỏ trong C++" },
                    { 24, "https://www.youtube.com/embed/OIU55ogb26M?si=m6eBIwKQ3wXiGVEw", "Video", 7, "<p>Cấp phát và giải phóng bộ nhớ động trong C++</p>", 1800, 2, "Cấp phát động" },
                    { 25, "https://www.youtube.com/embed/anbncsNUSSk?si=2Y0Ing7hqcLwmqte", "Video", 7, "<p>Cấp phát động cho mảng trong C++</p>", 1500, 3, "Cấp phát mảng động" },
                    { 26, "https://www.youtube.com/embed/ZbVO_4jH60k?si=148T-Elsog_pCFbe", "Video", 8, "<p>Khái niệm về struct (cấu trúc) trong C++</p>", 1800, 1, "Struct là gì?" },
                    { 27, "https://www.youtube.com/embed/T39JnItSmJU?si=RKXNgsgM9Ml8lvig", "Video", 8, "<p>Kết hợp con trỏ và struct trong C++</p>", 1500, 2, "Con trỏ và struct trong C++" },
                    { 28, "https://www.youtube.com/embed/tNlCid6mQ3E?si=mf4tD034MUK6pyE3", "Video", 8, "<p>Kỹ thuật nạp chồng toán tử (operator overloading) trong C++</p>", 2400, 3, "Nạp chồng toán tử trong C++" },
                    { 29, "https://www.youtube.com/embed/LekUWlASyMY?si=R2n6_pvdZZcSBYLg", "Video", 9, "<p>Đọc và ghi file text trong C++</p>", 2100, 1, "Làm việc với file text trong C++" },
                    { 30, "https://www.youtube.com/embed/_wdQU8GrJcY?si=0VjONumO-H39XFR5", "Video", 9, "<p>Các chế độ mở file và xử lý file trong C++</p>", 1800, 2, "Các chế độ làm việc với file trong C++" },
                    { 31, "https://www.youtube.com/embed/jwvmfp3Kp8U?si=dgOSFcQnsYOv7eD1", "Video", 10, "<p>Khái niệm class và object trong lập trình hướng đối tượng</p>", 2400, 1, "Class & object" },
                    { 32, "https://www.youtube.com/embed/ab2TALCZruo?si=9RfAUdhirOwyzFEV", "Video", 10, "<p>Nguyên lý đóng gói (encapsulation) trong lập trình hướng đối tượng</p>", 1800, 2, "Tính đóng gói trong C++" },
                    { 33, "https://www.youtube.com/embed/zoELAirXMJY?si=ilbFjG9jF8MHnoen", "Video", 11, "<p>Giới thiệu về mô hình Client-Server, cách thức hoạt động và ứng dụng trong thực tế</p>", 900, 1, "Mô hình Client - Server là gì?" },
                    { 34, "https://www.youtube.com/embed/M62l1xA5Eu8?si=rv1NF3Pcsk4PfNw3", "Video", 11, "<p>Tìm hiểu về domain, cách đăng ký domain và tầm quan trọng của domain trong công nghệ thông tin</p>", 720, 2, "Domain là gì?" },
                    { 35, "https://www.youtube.com/embed/CyZ_O7v62h4?si=yXL1NUelDTjI1581", "Video", 12, "<p>Những tố chất cần có để thành công trong ngành IT và các kỹ năng cần rèn luyện</p>", 1200, 1, "Làm IT cần tố chất gì? | Kĩ năng cần rèn luyện?" },
                    { 36, "https://www.youtube.com/embed/YH-E4Y3EaT4?si=2iCpcacbC2GultDZ", "Video", 12, "<p>Chia sẻ kinh nghiệm và những điều sinh viên IT cần chuẩn bị khi đi thực tập</p>", 1080, 2, "Sinh viên IT đi thực tập cần biết những gì?" },
                    { 37, "https://www.youtube.com/embed/DpvYHLUiZpc?si=WG6Va34BAY43v0R4", "Video", 13, "<p>Phương pháp học lập trình hiệu quả cho người mới bắt đầu</p>", 960, 1, "Phương pháp HỌC LẬP TRÌNH" },
                    { 38, "https://www.youtube.com/embed/f5hbmw7Ba7c?si=tVfTyKmWhw62Hb6E", "Video", 13, "<p>Lợi ích của việc học lập trình qua các nền tảng web và cách tận dụng tài nguyên online</p>", 840, 2, "Tại Sao Nên Học Lập Trình Tại Trang Web" },
                    { 39, "https://www.youtube.com/embed/MGhw6XliFgo?si=0flovkzN1KtgCC7h", "Video", 14, "<p>Giới thiệu tổng quan về khóa học JavaScript nâng cao</p>", 600, 1, "Giới thiệu" },
                    { 40, "https://www.youtube.com/embed/N-3GU1F1UBY?si=rQFaM72APj6FLpmT", "Video", 14, "<p>Tìm hiểu về Immediately Invoked Function Expression (IIFE) trong JavaScript</p>", 900, 2, "Khái niệm IIFE trong JavaScript" },
                    { 41, "https://www.youtube.com/embed/5N8vz_VmszE?si=52bTwY4Ydo_7k3kl", "Video", 14, "<p>Hiểu về scope (phạm vi) trong JavaScript: global scope, function scope, block scope</p>", 1200, 3, "Scope trong JavaScript" },
                    { 42, "https://www.youtube.com/embed/xtQtGKL0NCI?si=xpOReqdkc_RKQfvS", "Video", 14, "<p>Khái niệm và ứng dụng của closure trong lập trình JavaScript</p>", 1500, 4, "Closure trong JavaScript" },
                    { 43, "https://www.youtube.com/embed/3MLhU1DrUxM?si=012HnDBIDVk3WvpX", "Video", 15, "<p>Tìm hiểu về hoisting: cách JavaScript xử lý khai báo biến và hàm</p>", 1080, 1, "Hoisting trong Javascript" },
                    { 44, "https://www.youtube.com/embed/w1W-j4cSPF0?si=1ukan44t_iqSgzjC", "Video", 15, "<p>Sử dụng strict mode để viết code JavaScript an toàn và hiệu quả hơn</p>", 960, 2, "\"use strict\" hay strict mode trong Javascript" },
                    { 45, "https://www.youtube.com/embed/n4tS1Q5-EzY?si=GjTfbWhSAxqgCIFa", "Video", 15, "<p>Phân biệt giữa primitive types và reference types trong JavaScript</p>", 1320, 3, "Primitive Types & Reference Types trong Javascript" },
                    { 46, "https://www.youtube.com/embed/ii1Ra_zLDIo?si=ZMzRga4QranVogUM", "Video", 16, "<p>Hiểu về từ khóa 'this' và cách nó hoạt động trong các ngữ cảnh khác nhau</p>", 1800, 1, "This keyword trong JavaScript" },
                    { 47, "https://www.youtube.com/embed/F5z6YoR8of0?si=EJvumQ5VEV6VIZlN", "Video", 16, "<p>Phần 1: Tìm hiểu về phương thức bind() trong JavaScript</p>", 1200, 2, "Fn.bind() method trong JavaScript phần 1" },
                    { 48, "https://www.youtube.com/embed/6j9b2_E34JM?si=rs38tq046byAA6i5", "Video", 16, "<p>Phần 2: Ứng dụng thực tế của phương thức bind()</p>", 1080, 3, "Fn.bind() method trong JavaScript phần 2" },
                    { 49, "https://www.youtube.com/embed/QxLTSdTJDXY?si=KWT36QTPVuEXDM3K", "Video", 16, "<p>Sử dụng phương thức call() để gọi hàm với giá trị 'this' cụ thể</p>", 900, 4, "Fn.call() method trong JavaScript" },
                    { 50, "https://www.youtube.com/embed/a4FjX4Z-9Rs?si=wuCZqUzeuaLNACqP", "Video", 16, "<p>Sử dụng phương thức apply() để gọi hàm với mảng đối số</p>", 960, 5, "Fn.apply() method trong JavaScript" },
                    { 51, "https://www.youtube.com/embed/GQ-toR8F7rc?si=gef3E7tTAtlP2Gij", "Video", 17, "<p>Thực hành với Redux - State management cho JavaScript applications</p>", 2400, 1, "Học Redux" },
                    { 52, "https://www.youtube.com/embed/0SJE9dYdpps?si=pUECkazKOu2V5fJ2", "Video", 18, "<p>Khám phá khả năng và ứng dụng của JavaScript trong phát triển web</p>", 900, 1, "Javascript có thể làm được gì?" },
                    { 53, "https://www.youtube.com/embed/-jV06pqjUUc?si=4TITZ8jtPnMdnwDK", "Video", 18, "<p>Những lời khuyên hữu ích trước khi bắt đầu học lập trình JavaScript</p>", 600, 2, "Lời khuyên trước khóa học" },
                    { 54, "https://www.youtube.com/embed/efI98nT8Ffo?si=SGT7VQZOTwecjLFy", "Video", 18, "<p>Hướng dẫn cài đặt môi trường và công cụ cần thiết để học JavaScript</p>", 1200, 3, "Cài đặt môi trường, công cụ phù hợp để học JavaScript" },
                    { 55, "https://www.youtube.com/embed/W0vEUmyvthQ?si=uIquuLkihmo70A8f", "Video", 19, "<p>Hướng dẫn nhúng JavaScript vào file HTML</p>", 1080, 1, "Cách sử dụng JS trong file HTML" },
                    { 56, "https://www.youtube.com/embed/CLbx37dqYEI?si=LV2teP0FA98jrLzd", "Video", 19, "<p>Học cách khai báo và sử dụng biến trong JavaScript</p>", 960, 2, "Khai báo biến" },
                    { 57, "https://www.youtube.com/embed/xRpXBEq6TOY?si=BVdMwpKjyKjkNCe5", "Video", 19, "<p>Cách sử dụng comments để ghi chú code trong JavaScript</p>", 720, 3, "Sử dụng Comments trong JavaScript" },
                    { 58, "https://www.youtube.com/embed/rSV33HGotgE?si=yswlNLENjUQH6-qJ", "Video", 19, "<p>Giới thiệu các hàm built-in thông dụng trong JavaScript</p>", 1320, 4, "Một số hàm built-in trong JavaScript" },
                    { 59, "https://www.youtube.com/embed/SZb-N7TfPlw?si=o5H_GPV-40w8JFkB", "Video", 20, "<p>Giới thiệu các loại toán tử cơ bản trong JavaScript</p>", 900, 1, "Làm quen với toán tử trong JavaScript" },
                    { 60, "https://www.youtube.com/embed/m_h7-dgKnMU?si=5I_SRNZmvCV9JQIy", "Video", 20, "<p>Tìm hiểu các toán tử số học: cộng, trừ, nhân, chia, mod</p>", 1080, 2, "Toán tử số học trong JavaScript" },
                    { 61, "https://www.youtube.com/embed/aM-DUx6Qnc8?si=kwcVVpz2z17YAsk8", "Video", 20, "<p>Phân biệt toán tử ++ và -- khi đặt trước hoặc sau biến</p>", 960, 3, "Toán tử ++ -- với tiền tố & hậu tố" },
                    { 62, "https://www.youtube.com/embed/ncRmjazgsE8?si=v7uHTTa80Ju-xcYc", "Video", 20, "<p>Các toán tử gán: =, +=, -=, *=, /=, %=</p>", 840, 4, "Toán tử gán trong JavaScript" },
                    { 63, "https://www.youtube.com/embed/QCLVU6cZU_E?si=TpVpQyVmAWGR78Zx", "Video", 20, "<p>Toán tử nối chuỗi và xử lý chuỗi trong JavaScript</p>", 720, 5, "Toán tử chuỗi (String Operator)" },
                    { 64, "https://www.youtube.com/embed/rWM2lXtS-d8?si=1ZP4ZSId0h3Zb0Uw", "Video", 20, "<p>Phần 1: Các toán tử so sánh cơ bản</p>", 900, 6, "Toán tử so sánh trong Javascript (phần 1)" },
                    { 65, "https://www.youtube.com/embed/9cZEG1SSSQc?si=Eohx5LEBldikCsgv", "Video", 20, "<p>Tìm hiểu về kiểu dữ liệu Boolean và giá trị true/false</p>", 780, 7, "Kiểu dữ liệu Boolean" },
                    { 66, "https://www.youtube.com/embed/9MpHrdWBdxg?si=Ctyh_tmLGGJ71Rov", "Video", 20, "<p>Sử dụng câu lệnh điều kiện if-else để điều khiển luồng chương trình</p>", 1200, 8, "Câu lệnh điều kiện If - Else" },
                    { 67, "https://www.youtube.com/embed/meCXeMeyFdE?si=axuLDkpaE6apxulc", "Video", 20, "<p>Phần 2: Toán tử so sánh nâng cao và type coercion</p>", 960, 9, "Toán tử so sánh trong JavaScript (phần 2)" },
                    { 68, "https://www.youtube.com/embed/4g9ENVc2KLA?si=tFujXiYPhAfK2TSJ", "Video", 21, "<p>Khái niệm và cách tạo hàm trong JavaScript</p>", 1080, 1, "Hàm trong JavaScript" },
                    { 69, "https://www.youtube.com/embed/jE6UPl17Nvo?si=yN9WL4koZqObb9za", "Video", 21, "<p>Cách truyền và sử dụng tham số trong hàm JavaScript</p>", 900, 2, "Tham số trong hàm" },
                    { 70, "https://www.youtube.com/embed/OOoeAIrn69M?si=kp3j4L6lFtjC9e4a", "Video", 21, "<p>Sử dụng từ khóa return để trả về giá trị từ hàm</p>", 840, 3, "Return trong hàm JS" },
                    { 71, "https://www.youtube.com/embed/aTQojRq0N4c?si=zMY3mJOOWp63DsI0", "Video", 21, "<p>Khái niệm nâng cao về function trong JavaScript</p>", 960, 4, "Hiểu hơn về function" },
                    { 72, "https://www.youtube.com/embed/scwab9DMNtM?si=Ug3LbHXMcbpeVrA6", "Video", 21, "<p>Giới thiệu các loại function: declaration, expression, arrow function</p>", 1200, 5, "Các loại function" },
                    { 73, "https://www.youtube.com/embed/AT-yhX26_Ao?si=e54QJFdLBMSstjFN", "Video", 22, "<p>Khái niệm và cách làm việc với mảng trong JavaScript</p>", 1320, 1, "Làm việc với mảng" },
                    { 74, "https://www.youtube.com/embed/-xZkVmkDwbU?si=fsIbO2aWeVht40pj", "Video", 22, "<p>Sử dụng phương thức map() để biến đổi các phần tử trong mảng</p>", 1080, 2, "Array map method" },
                    { 75, "https://www.youtube.com/embed/-JMh3A556cw?si=zePj4wqdRznZlvH4", "Video", 22, "<p>Sử dụng phương thức reduce() để tính toán tổng hợp trên mảng</p>", 1200, 3, "Phương thức reduce" },
                    { 76, "https://www.youtube.com/embed/ZdvRm1bfGAk?si=XDnh_xokoGRI5SeD", "Video", 23, "<p>Phần 1: Giới thiệu về form validation với JavaScript</p>", 960, 1, "Form validation - Phần 1" },
                    { 77, "https://www.youtube.com/embed/scybnB9vYVQ?si=kzfvyuuj9ja9KtG2", "Video", 23, "<p>Phần 2: Validate các trường input cơ bản</p>", 1080, 2, "Form validation - Phần 2" },
                    { 78, "https://www.youtube.com/embed/LpgoBaULw30?si=DynUjTHSMZoCwtdA", "Video", 23, "<p>Phần 3: Validate email và password</p>", 900, 3, "Form validation - Phần 3" },
                    { 79, "https://www.youtube.com/embed/jRnBvlMUvK0?si=XoBWKyhwtSaG2Afk", "Video", 23, "<p>Phần 4: Hiển thị thông báo lỗi và hoàn thiện form validation</p>", 1200, 4, "Form validation - Phần 4" },
                    { 80, "https://www.youtube.com/embed/r6GWbQL-qwA?si=QbPo3dUWrf_Gqetr", "Video", 24, "<p>Giới thiệu về ứng dụng AI phát hiện hành vi chạm tay lên mặt và ứng dụng trong phòng chống dịch bệnh</p>", 900, 1, "Ứng Dụng Cảnh Báo Khi Chạm Tay Lên Mặt" },
                    { 81, "https://www.youtube.com/embed/WIyfBMdtNTE?si=I3XlU3YXgMSVDmwN", "Video", 24, "<p>Demo ứng dụng hoàn chỉnh và cách thức hoạt động</p>", 600, 2, "Demo" },
                    { 82, "https://www.youtube.com/embed/bqXyrCjT7V4?si=Jt2REUtdOdQn8FA4", "Video", 25, "<p>Hướng dẫn cài đặt Node.js và npm cho dự án React</p>", 720, 1, "Cài đặt NodeJS" },
                    { 83, "https://www.youtube.com/embed/3IWNmXKmRqo?si=I0tuf0MDLFOvKbB3", "Video", 25, "<p>Tạo dự án React mới với Create React App</p>", 600, 2, "Create react app" },
                    { 84, "https://www.youtube.com/embed/3klHfl2fOb0?si=LiXerT1JPdy96eRh", "Video", 25, "<p>Cài đặt các thư viện cần thiết: TensorFlow.js, react-webcam, và các dependency khác</p>", 900, 3, "Cài đặt thư viện cho ứng dụng" },
                    { 85, "https://www.youtube.com/embed/b5NEWtDwc_0?si=QtMx5Ub2HWEy6BBm", "Video", 25, "<p>Xây dựng giao diện cơ bản cho ứng dụng với React components</p>", 1080, 4, "Dựng giao diện khung" },
                    { 86, "https://www.youtube.com/embed/jjZGa8foO0s?si=nhKVXj2Mgexn0WFp", "Video", 25, "<p>Import và cấu hình các thư viện đã cài đặt vào dự án</p>", 780, 5, "Import thư viện cần thiết" },
                    { 87, "https://www.youtube.com/embed/uXvZyCnaZ7Y?si=ATry-U-5uD1xvuwH", "Video", 25, "<p>Triển khai chức năng stream video từ webcam với react-webcam</p>", 1200, 6, "Xây dựng phần Video Stream" },
                    { 88, "https://www.youtube.com/embed/KuDJjRU8XfY?si=UK8g8kDBZSTwyr2k", "Video", 26, "<p>Cấu hình TensorFlow.js và model machine learning cho ứng dụng</p>", 960, 1, "Setup thư viện TensorFlow" },
                    { 89, "https://www.youtube.com/embed/xjXoFX3X2yg?si=O8iZFjdXPyln_FIT", "Video", 26, "<p>Viết hàm training model để phát hiện hành vi chạm tay lên mặt</p>", 1500, 2, "Viết function training" },
                    { 90, "https://www.youtube.com/embed/C4jm3RWSw10?si=dRccDX_CFe6VpfeL", "Video", 26, "<p>Giải thích cơ chế hoạt động của model machine learning trong ứng dụng</p>", 1080, 3, "Giải thích cách hoạt động" },
                    { 91, "https://www.youtube.com/embed/pwWS_VcR9Ks?si=Z38-HOt_QchT-t0i", "Video", 26, "<p>Thêm chức năng cảnh báo bằng âm thanh và thông báo khi phát hiện chạm tay lên mặt</p>", 1320, 4, "Triển khai phần âm thanh và thông báo" },
                    { 92, "https://www.youtube.com/embed/D5Xd9FByKXc?si=ISfXlB2hgjruCYGf", "Video", 26, "<p>Hướng dẫn cách training model hiệu quả và tối ưu độ chính xác</p>", 1800, 5, "Hướng dẫn Training hiệu quả" },
                    { 93, "https://www.youtube.com/embed/z2f7RHgvddc?si=jkZ2cKsYrIwrndS7", "Video", 27, "<p>Những lời khuyên hữu ích trước khi bắt đầu học Node.js và ExpressJS</p>", 600, 1, "Lời khuyên trước khóa học" },
                    { 94, "https://www.youtube.com/embed/SdcdneSdoV4?si=IwwaJJjfdpDQea9d", "Video", 27, "<p>Tìm hiểu về giao thức HTTP, phương thức và trạng thái response</p>", 900, 2, "Giao thức HTTP" },
                    { 95, "https://www.youtube.com/embed/HLEu57iLrRo?si=sQt0ZQ9HG4rQEmay", "Video", 27, "<p>Phân biệt Server-Side Rendering (SSR) và Client-Side Rendering (CSR)</p>", 1080, 3, "SSR & CSR" },
                    { 96, "https://www.youtube.com/embed/CcSuYLjKW3g?si=NKAcYepnILR1ViUA", "Video", 27, "<p>Hướng dẫn cài đặt Node.js và npm trên các hệ điều hành</p>", 720, 4, "Cài đặt NodeJS" },
                    { 97, "https://www.youtube.com/embed/tfQXZ8jES6A?si=xRlgIvNei37_j0bk", "Video", 27, "<p>Hướng dẫn cài đặt ExpressJS framework và tạo dự án đầu tiên</p>", 840, 5, "Cài đặt Express framework" },
                    { 98, "https://www.youtube.com/embed/zCFOn4YXr00?si=20MxnAHBHsfcKvjz", "Video", 27, "<p>Cài đặt và sử dụng Nodemon để tự động restart server khi code thay đổi</p>", 600, 6, "Sử dụng thư viện Nodemon" },
                    { 99, "https://www.youtube.com/embed/f0C9kTOf6IY?si=Dp4AZSxSV1-jN9w2", "Video", 27, "<p>Hướng dẫn quản lý source code với Git và đẩy code lên Github</p>", 900, 7, "Add source code lên Github" },
                    { 100, "https://www.youtube.com/embed/seI--u0hSeg?si=1c9-HMYFSBSNxIVJ", "Video", 27, "<p>Sử dụng Morgan middleware để log HTTP requests trong ExpressJS</p>", 660, 8, "Cài đặt thư viện Morgan" },
                    { 101, "https://www.youtube.com/embed/lpbl2qQXbDo?si=fbhZmFuRf_Z1nSbC", "Video", 28, "<p>Giới thiệu về Template Engine và cách sử dụng trong ExpressJS</p>", 960, 1, "Khái niệm Template Engine" },
                    { 102, "https://www.youtube.com/embed/BxZNiLo-OA0?si=9YrQE5TkoQo87idU", "Video", 28, "<p>Cấu hình ExpressJS để phục vụ các file tĩnh (CSS, JavaScript, images)</p>", 780, 2, "Cấu hình sử dụng file tĩnh" },
                    { 103, "https://www.youtube.com/embed/zNLXsTu_kUA?si=IWXvEf4MJgF0C5_Y", "Video", 28, "<p>Tích hợp Bootstrap framework vào dự án ExpressJS</p>", 720, 3, "Tích hợp Bootstrap" },
                    { 104, "https://www.youtube.com/embed/Wz6WghmEmFk?si=ppmhAov6Wi0f-LG2", "Video", 28, "<p>Tạo các route cơ bản trong ExpressJS</p>", 900, 4, "Basic routing" },
                    { 105, "https://www.youtube.com/embed/BbBagzvrSto?si=y3ySiHHMnmwbQay9", "Video", 28, "<p>Sử dụng phương thức GET để xử lý các request lấy dữ liệu</p>", 840, 5, "Phương thức GET" },
                    { 106, "https://www.youtube.com/embed/6LdwSrTCmo4?si=Oc9ZK6a3gNioq_8e", "Video", 28, "<p>Xử lý query string trong URL với ExpressJS</p>", 720, 6, "Chuỗi truy vấn" },
                    { 107, "https://www.youtube.com/embed/wCF8pIbOOpo?si=lnpa3zXNO56irhkh", "Video", 28, "<p>Tìm hiểu về hành vi mặc định của HTML form</p>", 660, 7, "Form default behavior" },
                    { 108, "https://www.youtube.com/embed/LlfdqnK28Cg?si=fFr6ofi7s3LucQ-N", "Video", 28, "<p>Sử dụng phương thức POST để xử lý form submission</p>", 960, 8, "Phương thức POST" },
                    { 109, "https://www.youtube.com/embed/N8GhaR7K3tI?si=ChVEACoPm57PsbWU", "Video", 29, "<p>Giới thiệu về mô hình MVC (Model-View-Controller) trong ExpressJS</p>", 1080, 1, "Mô hình MVC" },
                    { 110, "https://www.youtube.com/embed/Pd_ZIpCVZPc?si=3uYoOu86VehDbpnt", "Video", 29, "<p>Xây dựng routes và controllers theo mô hình MVC</p>", 1200, 2, "MVC Routes & Controllers" },
                    { 111, "https://www.youtube.com/embed/5Odp8lcAvyA?si=9bORfXTxWX-p4z-m", "Video", 29, "<p>Hướng dẫn cài đặt và cấu hình MongoDB cho dự án</p>", 900, 3, "Cài đặt Mongodb" },
                    { 112, "https://www.youtube.com/embed/kyNyMfRCavg?si=9X5dfSg9fLgNDVzk", "Video", 29, "<p>Cài đặt và cấu hình Prettier để format code tự động</p>", 660, 4, "Thư viện Prettier" },
                    { 113, "https://www.youtube.com/embed/uAXpEmTZhfA?si=9fd8m315tvTZHUDm", "Video", 29, "<p>Tạo Model để tương tác với database MongoDB</p>", 1080, 5, "Xây dựng thành phần Model trong mô hình MVC" },
                    { 114, "https://www.youtube.com/embed/PYjZV9HPLRs?si=aE3E3kf0Amt6X-73", "Video", 29, "<p>Cài đặt công cụ để xem JSON data dễ dàng hơn</p>", 600, 6, "Cài đặt JSON Viewer" },
                    { 115, "https://www.youtube.com/embed/nqLXmpEgU2w?si=ejJ8kLsnxDBtHE4b", "Video", 29, "<p>Viết code để đọc dữ liệu từ MongoDB database</p>", 960, 7, "Đọc Database" },
                    { 116, "https://www.youtube.com/embed/LnTPJcUQdNU?si=NeAQFq8KlvzaP7zX", "Video", 29, "<p>Tạo trang hiển thị chi tiết một item từ database</p>", 1080, 8, "Xây dựng trang chi tiết" },
                    { 117, "https://www.youtube.com/embed/bvZ1_P9eCpw?si=Kq5NwkNFxPTbpj4M", "Video", 29, "<p>Xây dựng form và logic để tạo mới khóa học</p>", 1200, 9, "Dựng trang tạo mới khóa học" },
                    { 118, "https://www.youtube.com/embed/HdVOT7Neh18?si=6qIbTAoX4FEwmoJS", "Video", 29, "<p>Tạo trang và chức năng chỉnh sửa thông tin khóa học</p>", 1320, 10, "Dựng trang chỉnh sửa" },
                    { 119, "https://www.youtube.com/embed/-10W8ZmNlcg?si=fys6OyTO5NB_0jiP", "Video", 29, "<p>Triển khai chức năng sắp xếp (sort) dữ liệu</p>", 960, 11, "Hoàn thiện logic chức năng Sort" },
                    { 120, "https://www.youtube.com/embed/uz5LIP85J5Y?si=Ff8E3BwYC4Qc0phk", "Video", 30, "<p>Giới thiệu về responsive web design và tầm quan trọng trong thiết kế hiện đại</p>", 720, 1, "Khái niệm responsive" },
                    { 121, "https://www.youtube.com/embed/5QT0aeovTTY?si=bGlPkMN6NNPo9ZUI", "Video", 30, "<p>Các bước và kỹ thuật cần thiết để thiết kế website responsive</p>", 840, 2, "Cần làm gì để thực hiện responsive khi thiết kế website" },
                    { 122, "https://www.youtube.com/embed/CIIYogDrGto?si=L-duzdQHVlF1opO-", "Video", 30, "<p>Giới thiệu các công cụ và extension hỗ trợ responsive design</p>", 660, 3, "Cài đặt và sử dụng công cụ responsive web" },
                    { 123, "https://www.youtube.com/embed/XJiq_d0vGCQ?si=WHwUTJ--ANrYNRem", "Video", 31, "<p>Tìm hiểu về viewport meta tag và vai trò trong responsive design</p>", 600, 1, "Khái niệm Viewport" },
                    { 124, "https://www.youtube.com/embed/YgkzJkmDP3U?si=82oswyIzYnqV4S9V", "Video", 31, "<p>Sử dụng CSS media queries để áp dụng styles cho các thiết bị khác nhau</p>", 900, 2, "Thuộc tính Media query (@media)" },
                    { 125, "https://www.youtube.com/embed/0i37IU0wjlI?si=S692S7nLRwDoIPHy", "Video", 31, "<p>Hiểu về breakpoints và cách chọn breakpoints phù hợp cho thiết kế</p>", 780, 3, "Khái niệm Breakpoints trong responsive" },
                    { 126, "https://www.youtube.com/embed/aywAr27pkWE?si=WBoVYOgwUz-pCmi2", "Video", 31, "<p>Lựa chọn đơn vị đo lường phù hợp (px, em, rem, %, vw, vh) cho media queries</p>", 720, 4, "Sử dụng đơn vị nào khi dùng Media queries" },
                    { 127, "https://www.youtube.com/embed/-NK4jLekauw?si=3NbBMO3ybHMY3l5P", "Video", 32, "<p>Thực hành tạo layout responsive cơ bản với media queries</p>", 1080, 1, "Thực hành responsive" },
                    { 128, "https://www.youtube.com/embed/HYy4c6lcOlM?si=FsYXsiP07J6aZ_7c", "Video", 32, "<p>Tạo navigation bar responsive với hamburger menu cho mobile</p>", 960, 2, "Responsive cho navigation bar" },
                    { 129, "https://www.youtube.com/embed/lvD5K50TZPk?si=YWld4DwlpIwRMPEO", "Video", 33, "<p>Giới thiệu về CSS Grid Layout và các khái niệm cơ bản</p>", 900, 1, "Khái niệm Grid system" },
                    { 130, "https://www.youtube.com/embed/iKlMB01w47g?si=xhLnegsjgfEPBKic", "Video", 33, "<p>Các thuộc tính nâng cao của CSS Grid: grid-template-areas, grid-auto-flow, justify-items, align-items</p>", 960, 2, "Khái niệm Grid system phần 2" },
                    { 131, "https://www.youtube.com/embed/ScZaj1eG7DQ?si=8aPgvKNracyn4weX", "Video", 33, "<p>Xây dựng thư viện CSS custom sử dụng Grid System để tái sử dụng</p>", 1200, 3, "Tạo thư viện CSS ứng dụng Grid system" },
                    { 132, "https://www.youtube.com/embed/7ppRSaGT1uw?si=jW7RVXUlpcXVAc4w", "Video", 34, "<p>Giới thiệu tổng quan về Windows Terminal và Windows Subsystem for Linux (WSL)</p>", 600, 1, "Giới thiệu Windows Terminal & WSL" },
                    { 133, "https://www.youtube.com/embed/egSxAF-Sak4?si=MFZbkp7kXiuFKL6t", "Video", 35, "<p>Hướng dẫn cài đặt Windows Terminal từ Microsoft Store và cấu hình cơ bản</p>", 720, 1, "Window Terminal install" },
                    { 134, "https://www.youtube.com/embed/ypvjxw5qBK0?si=7Pg70wbWgb0H785u", "Video", 35, "<p>Hướng dẫn cài đặt Ubuntu trên Windows thông qua WSL (Windows Subsystem for Linux)</p>", 900, 2, "Cài đặt Ubuntu với WSL 1" },
                    { 135, "https://www.youtube.com/embed/1jsHfX2WomA?si=h30pQNipb3m8AOW6", "Video", 35, "<p>Cách cập nhật packages và hệ thống Ubuntu sau khi cài đặt</p>", 600, 3, "Update Packages Ubuntu" },
                    { 136, "https://www.youtube.com/embed/1UIe8sHXN5c?si=U3IQfm_H2UCbsRTt", "Video", 35, "<p>Giới thiệu các lệnh cơ bản trong Ubuntu/Linux terminal</p>", 780, 4, "Các lệnh trong Ubuntu" },
                    { 137, "https://www.youtube.com/embed/1UIe8sHXN5c?si=xFojRSQx27MQJbw1", "Video", 36, "<p>Hướng dẫn sử dụng các lệnh cơ bản: ls (liệt kê file), cd (di chuyển), clear (xóa màn hình)</p>", 840, 1, "Lệnh ls, cd, clear trong Ubuntu/Linux" },
                    { 138, "https://www.youtube.com/embed/ozBhz7il5Ts?si=HlrGNoLwNygz4bmu", "Video", 36, "<p>Hướng dẫn sử dụng lệnh tạo thư mục (mkdir), tạo file (touch) và editor vi</p>", 900, 2, "Lệnh mkdir, touch, vi trong Ubuntu/Linux" },
                    { 139, "https://www.youtube.com/embed/l5mLKwWjSe8?si=Vz27TDiC5f_U-qAk", "Video", 36, "<p>Hướng dẫn sử dụng lệnh xem file (cat), in text (echo), xem cuối file (tail), tìm kiếm (grep)</p>", 1080, 3, "Lệnh cat, echo, tail, grep trong Ubuntu/Linux" },
                    { 140, "https://www.youtube.com/embed/9rddrjDkmWo?si=IV_P1behSManoGLz", "Video", 37, "<p>Hướng dẫn cài đặt Node.js và npm trên WSL/Ubuntu</p>", 720, 1, "Cài đặt NodeJS trên WSL" },
                    { 141, "https://www.youtube.com/embed/aj3HXDfrM2Q?si=razVM3G1PB2FJ5Sa", "Video", 37, "<p>Tạo và chạy dự án React.js trên môi trường WSL/Ubuntu</p>", 780, 2, "Tạo dự án ReactJS trên WSL" },
                    { 142, "https://www.youtube.com/embed/MpYEUtbbFSg?si=vC2KMpr6WcYVuyWh", "Video", 37, "<p>Tạo dự án Express.js backend và chạy trên WSL/Ubuntu</p>", 900, 3, "Tạo và chạy dự án ExpressJS trên WSL" },
                    { 143, "https://www.youtube.com/embed/ScLOfVwezKU?si=Xx3iU0ddzdjAfsMR", "Video", 38, "<p>Giới thiệu quy trình deploy ứng dụng web lên server thật</p>", 600, 1, "Deploy dự án với Server thật" },
                    { 144, "https://www.youtube.com/embed/7RjjF8Ee7Ws?si=Qe3vEJXncfyrlmcb", "Video", 38, "<p>Hướng dẫn mua và cấu hình domain name cho website</p>", 720, 2, "Mua tên miền website" },
                    { 145, "https://www.youtube.com/embed/CLJSI2xO1Mo?si=5Mp01POpJtJ3g-DT", "Video", 38, "<p>Hướng dẫn tạo user và phân quyền trên server Linux/Ubuntu</p>", 660, 3, "Tạo User trên máy chủ Linux/Ubuntu" },
                    { 146, "https://www.youtube.com/embed/1sdaPoXWQrw?si=1p8toXNCTx7h1Jrb", "Video", 38, "<p>Hướng dẫn cài đặt và cấu hình Nginx web server trên Ubuntu</p>", 1080, 4, "Cài đặt và cấu hình Nginx cơ bản trên Ubuntu" },
                    { 147, "https://www.youtube.com/embed/fvs_wjEd0Ks?si=bCRTTR1ORZTjV3B6", "Video", 38, "<p>Hướng dẫn upload source code lên server sử dụng Filezilla FTP client</p>", 840, 5, "Upload Source Code lên máy chủ với Filezilla" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_BaiHocs_MaChuong",
                table: "BaiHocs",
                column: "MaChuong");

            migrationBuilder.CreateIndex(
                name: "IX_BaiTap_Quizs_MaBaiTap",
                table: "BaiTap_Quizs",
                column: "MaBaiTap",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BaiTap_ThucHanhIDEs_MaBaiTap",
                table: "BaiTap_ThucHanhIDEs",
                column: "MaBaiTap",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BaiTap_ThucHanhIDEs_MaBaiTap_MaNgonNgu",
                table: "BaiTap_ThucHanhIDEs",
                columns: new[] { "MaBaiTap", "MaNgonNgu" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BaiTap_ThucHanhIDEs_MaNgonNgu",
                table: "BaiTap_ThucHanhIDEs",
                column: "MaNgonNgu");

            migrationBuilder.CreateIndex(
                name: "IX_BaiTaps_MaBaiHoc",
                table: "BaiTaps",
                column: "MaBaiHoc");

            migrationBuilder.CreateIndex(
                name: "IX_BinhLuans_MaBaiHoc",
                table: "BinhLuans",
                column: "MaBaiHoc");

            migrationBuilder.CreateIndex(
                name: "IX_BinhLuans_MaBinhLuanCha",
                table: "BinhLuans",
                column: "MaBinhLuanCha");

            migrationBuilder.CreateIndex(
                name: "IX_BinhLuans_MaNguoiDung",
                table: "BinhLuans",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_BoThuNghiems_MaBaiTapThucHanh",
                table: "BoThuNghiems",
                column: "MaBaiTapThucHanh");

            migrationBuilder.CreateIndex(
                name: "IX_ChuongHocs_MaKhoaHoc",
                table: "ChuongHocs",
                column: "MaKhoaHoc");

            migrationBuilder.CreateIndex(
                name: "IX_CuocHoiThoaiAIs_MaNguoiDung",
                table: "CuocHoiThoaiAIs",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_DangKyKhoaHocs_MaKhoaHoc",
                table: "DangKyKhoaHocs",
                column: "MaKhoaHoc");

            migrationBuilder.CreateIndex(
                name: "IX_DangKyKhoaHocs_MaNguoiDung",
                table: "DangKyKhoaHocs",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_DanhGias_MaKhoaHoc",
                table: "DanhGias",
                column: "MaKhoaHoc");

            migrationBuilder.CreateIndex(
                name: "IX_DanhGias_MaNguoiDung_MaKhoaHoc",
                table: "DanhGias",
                columns: new[] { "MaNguoiDung", "MaKhoaHoc" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GhiChuBaiHocs_MaBaiHoc",
                table: "GhiChuBaiHocs",
                column: "MaBaiHoc");

            migrationBuilder.CreateIndex(
                name: "IX_GhiChuBaiHocs_MaNguoiDung",
                table: "GhiChuBaiHocs",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_KetQuaLamBais_MaBaiTap",
                table: "KetQuaLamBais",
                column: "MaBaiTap");

            migrationBuilder.CreateIndex(
                name: "IX_KetQuaLamBais_MaNguoiDung",
                table: "KetQuaLamBais",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_KhoaHocs_MaGiangVien",
                table: "KhoaHocs",
                column: "MaGiangVien");

            migrationBuilder.CreateIndex(
                name: "IX_LoTrinhAIs_MaNguoiDung",
                table: "LoTrinhAIs",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_NguoiDungs_Email",
                table: "NguoiDungs",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_NguoiDungs_TaiKhoan",
                table: "NguoiDungs",
                column: "TaiKhoan",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TienDoBaiHocs_MaBaiHoc",
                table: "TienDoBaiHocs",
                column: "MaBaiHoc");

            migrationBuilder.CreateIndex(
                name: "IX_TienDoBaiHocs_MaNguoiDung_MaBaiHoc",
                table: "TienDoBaiHocs",
                columns: new[] { "MaNguoiDung", "MaBaiHoc" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TinNhanAIs_MaHoiThoai",
                table: "TinNhanAIs",
                column: "MaHoiThoai");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BaiTap_Quizs");

            migrationBuilder.DropTable(
                name: "BinhLuans");

            migrationBuilder.DropTable(
                name: "BoThuNghiems");

            migrationBuilder.DropTable(
                name: "DangKyKhoaHocs");

            migrationBuilder.DropTable(
                name: "DanhGias");

            migrationBuilder.DropTable(
                name: "GhiChuBaiHocs");

            migrationBuilder.DropTable(
                name: "KetQuaLamBais");

            migrationBuilder.DropTable(
                name: "LoTrinhAIs");

            migrationBuilder.DropTable(
                name: "TienDoBaiHocs");

            migrationBuilder.DropTable(
                name: "TinNhanAIs");

            migrationBuilder.DropTable(
                name: "BaiTap_ThucHanhIDEs");

            migrationBuilder.DropTable(
                name: "CuocHoiThoaiAIs");

            migrationBuilder.DropTable(
                name: "BaiTaps");

            migrationBuilder.DropTable(
                name: "NgonNguLapTrinhs");

            migrationBuilder.DropTable(
                name: "BaiHocs");

            migrationBuilder.DropTable(
                name: "ChuongHocs");

            migrationBuilder.DropTable(
                name: "KhoaHocs");

            migrationBuilder.DropTable(
                name: "NguoiDungs");
        }
    }
}
