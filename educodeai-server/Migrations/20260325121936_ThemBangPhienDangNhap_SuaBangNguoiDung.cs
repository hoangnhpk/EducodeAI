using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class ThemBangPhienDangNhap_SuaBangNguoiDung : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MaOTP",
                table: "NguoiDungs",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NgayDangNhapCuoi",
                table: "NguoiDungs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ThoiGianHetHanOTP",
                table: "NguoiDungs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PhienDangNhap",
                columns: table => new
                {
                    MaPhien = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaNguoiDung = table.Column<int>(type: "int", nullable: false),
                    MaThietBi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    TenThietBi = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    DiaChiIP = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ThoiGianDangNhap = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ThoiGianHoatDongCuoi = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DangHoatDong = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhienDangNhap", x => x.MaPhien);
                    table.ForeignKey(
                        name: "FK_PhienDangNhap_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "NguoiDungs",
                keyColumn: "MaNguoiDung",
                keyValue: 1,
                columns: new[] { "MaOTP", "NgayDangNhapCuoi", "ThoiGianHetHanOTP" },
                values: new object[] { null, null, null });

            migrationBuilder.UpdateData(
                table: "NguoiDungs",
                keyColumn: "MaNguoiDung",
                keyValue: 2,
                columns: new[] { "MaOTP", "NgayDangNhapCuoi", "ThoiGianHetHanOTP" },
                values: new object[] { null, null, null });

            migrationBuilder.UpdateData(
                table: "NguoiDungs",
                keyColumn: "MaNguoiDung",
                keyValue: 3,
                columns: new[] { "MaOTP", "NgayDangNhapCuoi", "ThoiGianHetHanOTP" },
                values: new object[] { null, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_PhienDangNhap_MaNguoiDung",
                table: "PhienDangNhap",
                column: "MaNguoiDung");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PhienDangNhap");

            migrationBuilder.DropColumn(
                name: "MaOTP",
                table: "NguoiDungs");

            migrationBuilder.DropColumn(
                name: "NgayDangNhapCuoi",
                table: "NguoiDungs");

            migrationBuilder.DropColumn(
                name: "ThoiGianHetHanOTP",
                table: "NguoiDungs");
        }
    }
}
