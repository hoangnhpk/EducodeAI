using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class add_thu_thach_gamification_v2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DanhHieus",
                columns: table => new
                {
                    MaDanhHieu = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TenDanhHieu = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    MoTa = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    ExpYeuCau = table.Column<int>(type: "integer", nullable: false),
                    ThuTu = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DanhHieus", x => x.MaDanhHieu);
                });

            migrationBuilder.CreateTable(
                name: "MauNhiemVuTuans",
                columns: table => new
                {
                    MaMau = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TieuDe = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    MoTa = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Icon = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    LoaiDem = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ChiTieu = table.Column<int>(type: "integer", nullable: false),
                    ExpThuong = table.Column<int>(type: "integer", nullable: false),
                    ThuTu = table.Column<int>(type: "integer", nullable: false),
                    DangHoatDong = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MauNhiemVuTuans", x => x.MaMau);
                });

            migrationBuilder.CreateTable(
                name: "NguoiDungDanhHieus",
                columns: table => new
                {
                    MaMoKhoa = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    MaDanhHieu = table.Column<int>(type: "integer", nullable: false),
                    NgayMoKhoa = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NguoiDungDanhHieus", x => x.MaMoKhoa);
                    table.ForeignKey(
                        name: "FK_NguoiDungDanhHieus_DanhHieus_MaDanhHieu",
                        column: x => x.MaDanhHieu,
                        principalTable: "DanhHieus",
                        principalColumn: "MaDanhHieu",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NguoiDungDanhHieus_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NguoiDungGamifications",
                columns: table => new
                {
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    TongExp = table.Column<int>(type: "integer", nullable: false),
                    MaDanhHieuDangDeo = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NguoiDungGamifications", x => x.MaNguoiDung);
                    table.ForeignKey(
                        name: "FK_NguoiDungGamifications_DanhHieus_MaDanhHieuDangDeo",
                        column: x => x.MaDanhHieuDangDeo,
                        principalTable: "DanhHieus",
                        principalColumn: "MaDanhHieu",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_NguoiDungGamifications_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TienDoNhiemVuTuans",
                columns: table => new
                {
                    MaTienDo = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    MaMau = table.Column<int>(type: "integer", nullable: false),
                    DauChuKy = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    GiaTriHienTai = table.Column<int>(type: "integer", nullable: false),
                    TrangThai = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    NgayNhanThuong = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TienDoNhiemVuTuans", x => x.MaTienDo);
                    table.ForeignKey(
                        name: "FK_TienDoNhiemVuTuans_MauNhiemVuTuans_MaMau",
                        column: x => x.MaMau,
                        principalTable: "MauNhiemVuTuans",
                        principalColumn: "MaMau",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TienDoNhiemVuTuans_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "DanhHieus",
                columns: new[] { "MaDanhHieu", "MaCode", "TenDanhHieu", "MoTa", "ExpYeuCau", "ThuTu" },
                values: new object[,]
                {
                    { 1, "tan_binh", "Tân binh học tập", "Chào mừng bạn đến với hành trình học tập!", 0, 1 },
                    { 2, "hoc_gia_tap_su", "Học giả tập sự", "Đạt 500 EXP", 500, 2 },
                    { 3, "chien_than", "Chiến thần chăm chỉ", "Đạt 1.200 EXP", 1200, 3 },
                    { 4, "bac_thuyet_trinh", "Bậc thầy kiến thức", "Đạt 2.500 EXP", 2500, 4 },
                    { 5, "huyen_thoai", "Huyền thoại EduCode", "Đạt 5.000 EXP", 5000, 5 },
                });

            migrationBuilder.InsertData(
                table: "MauNhiemVuTuans",
                columns: new[] { "MaMau", "MaCode", "TieuDe", "MoTa", "Icon", "LoaiDem", "ChiTieu", "ExpThuong", "ThuTu", "DangHoatDong" },
                values: new object[,]
                {
                    { 1, "hoc_bai", "Chiến thần chăm chỉ", "Xem 3 bài học khác nhau trong tuần", "book", "hoc_bai", 3, 50, 1, true },
                    { 2, "gio_hoc", "Marathon học tập", "Tích lũy 12 tiếng học trong tuần", "clock", "gio_hoc", 720, 30, 2, true },
                    { 3, "quiz", "Kiểm tra đầu tuần", "Hoàn thành 1 bài quiz", "quiz", "quiz", 1, 40, 3, true },
                    { 4, "ngay_hoc", "Duy trì nhịp học", "Học ít nhất 3 ngày khác nhau trong tuần", "calendar", "ngay_hoc", 3, 35, 4, true },
                    { 5, "xuat_sac", "Hoàn thành xuất sắc", "Hoàn thành tất cả nhiệm vụ tuần này", "trophy", "hoan_thanh_tat_ca", 1, 100, 5, true },
                });

            migrationBuilder.CreateIndex(
                name: "IX_NguoiDungDanhHieus_MaDanhHieu",
                table: "NguoiDungDanhHieus",
                column: "MaDanhHieu");

            migrationBuilder.CreateIndex(
                name: "IX_NguoiDungDanhHieus_MaNguoiDung_MaDanhHieu",
                table: "NguoiDungDanhHieus",
                columns: new[] { "MaNguoiDung", "MaDanhHieu" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NguoiDungGamifications_MaDanhHieuDangDeo",
                table: "NguoiDungGamifications",
                column: "MaDanhHieuDangDeo");

            migrationBuilder.CreateIndex(
                name: "IX_TienDoNhiemVuTuans_MaMau",
                table: "TienDoNhiemVuTuans",
                column: "MaMau");

            migrationBuilder.CreateIndex(
                name: "IX_TienDoNhiemVuTuans_MaNguoiDung_MaMau_DauChuKy",
                table: "TienDoNhiemVuTuans",
                columns: new[] { "MaNguoiDung", "MaMau", "DauChuKy" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NguoiDungDanhHieus");

            migrationBuilder.DropTable(
                name: "NguoiDungGamifications");

            migrationBuilder.DropTable(
                name: "TienDoNhiemVuTuans");

            migrationBuilder.DropTable(
                name: "DanhHieus");

            migrationBuilder.DropTable(
                name: "MauNhiemVuTuans");
        }
    }
}
