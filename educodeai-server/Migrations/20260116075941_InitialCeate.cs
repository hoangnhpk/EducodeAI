using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCeate : Migration
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
                    MaBaiHoc = table.Column<int>(type: "int", nullable: false),
                    DeBai = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GioiHanThoiGian = table.Column<int>(type: "int", nullable: false),
                    GioiHanBoNho = table.Column<int>(type: "int", nullable: false)
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
                name: "BaiNops",
                columns: table => new
                {
                    MaBaiNop = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNguoiDung = table.Column<int>(type: "int", nullable: false),
                    MaBaiTap = table.Column<int>(type: "int", nullable: false),
                    MaNgonNgu = table.Column<int>(type: "int", nullable: false),
                    CodeNop = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LanNop = table.Column<int>(type: "int", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ThoiGianChay = table.Column<int>(type: "int", nullable: false),
                    BoNhoSuDung = table.Column<int>(type: "int", nullable: false),
                    NgayNop = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaiNops", x => x.MaBaiNop);
                    table.ForeignKey(
                        name: "FK_BaiNops_BaiTaps_MaBaiTap",
                        column: x => x.MaBaiTap,
                        principalTable: "BaiTaps",
                        principalColumn: "MaBaiTap");
                    table.ForeignKey(
                        name: "FK_BaiNops_NgonNguLapTrinhs_MaNgonNgu",
                        column: x => x.MaNgonNgu,
                        principalTable: "NgonNguLapTrinhs",
                        principalColumn: "MaNgonNgu");
                    table.ForeignKey(
                        name: "FK_BaiNops_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "BaiTap_NgonNgus",
                columns: table => new
                {
                    MaBaiTapNgonNgu = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaBaiTap = table.Column<int>(type: "int", nullable: false),
                    MaNgonNgu = table.Column<int>(type: "int", nullable: false),
                    CodeMau = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaiTap_NgonNgus", x => x.MaBaiTapNgonNgu);
                    table.ForeignKey(
                        name: "FK_BaiTap_NgonNgus_BaiTaps_MaBaiTap",
                        column: x => x.MaBaiTap,
                        principalTable: "BaiTaps",
                        principalColumn: "MaBaiTap");
                    table.ForeignKey(
                        name: "FK_BaiTap_NgonNgus_NgonNguLapTrinhs_MaNgonNgu",
                        column: x => x.MaNgonNgu,
                        principalTable: "NgonNguLapTrinhs",
                        principalColumn: "MaNgonNgu");
                });

            migrationBuilder.CreateTable(
                name: "BoThuNghiems",
                columns: table => new
                {
                    MaBoThu = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaBaiTap = table.Column<int>(type: "int", nullable: false),
                    DauVao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DauRaMongMuon = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AnDanh = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BoThuNghiems", x => x.MaBoThu);
                    table.ForeignKey(
                        name: "FK_BoThuNghiems_BaiTaps_MaBaiTap",
                        column: x => x.MaBaiTap,
                        principalTable: "BaiTaps",
                        principalColumn: "MaBaiTap");
                });

            migrationBuilder.CreateIndex(
                name: "IX_BaiHocs_MaChuong",
                table: "BaiHocs",
                column: "MaChuong");

            migrationBuilder.CreateIndex(
                name: "IX_BaiNops_MaBaiTap",
                table: "BaiNops",
                column: "MaBaiTap");

            migrationBuilder.CreateIndex(
                name: "IX_BaiNops_MaNgonNgu",
                table: "BaiNops",
                column: "MaNgonNgu");

            migrationBuilder.CreateIndex(
                name: "IX_BaiNops_MaNguoiDung",
                table: "BaiNops",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_BaiTap_NgonNgus_MaBaiTap_MaNgonNgu",
                table: "BaiTap_NgonNgus",
                columns: new[] { "MaBaiTap", "MaNgonNgu" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BaiTap_NgonNgus_MaNgonNgu",
                table: "BaiTap_NgonNgus",
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
                name: "IX_BoThuNghiems_MaBaiTap",
                table: "BoThuNghiems",
                column: "MaBaiTap");

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
                name: "BaiNops");

            migrationBuilder.DropTable(
                name: "BaiTap_NgonNgus");

            migrationBuilder.DropTable(
                name: "BinhLuans");

            migrationBuilder.DropTable(
                name: "BoThuNghiems");

            migrationBuilder.DropTable(
                name: "DangKyKhoaHocs");

            migrationBuilder.DropTable(
                name: "DanhGias");

            migrationBuilder.DropTable(
                name: "LoTrinhAIs");

            migrationBuilder.DropTable(
                name: "TienDoBaiHocs");

            migrationBuilder.DropTable(
                name: "TinNhanAIs");

            migrationBuilder.DropTable(
                name: "NgonNguLapTrinhs");

            migrationBuilder.DropTable(
                name: "BaiTaps");

            migrationBuilder.DropTable(
                name: "CuocHoiThoaiAIs");

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
