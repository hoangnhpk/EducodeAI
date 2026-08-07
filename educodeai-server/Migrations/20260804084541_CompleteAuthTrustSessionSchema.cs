using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class CompleteAuthTrustSessionSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PhienDangNhap_MaNguoiDung",
                table: "PhienDangNhap");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastVerifiedAtUtc",
                table: "PhienDangNhap",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TrustRevokedAtUtc",
                table: "PhienDangNhap",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TrustVersion",
                table: "PhienDangNhap",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "TrustedUntilUtc",
                table: "PhienDangNhap",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SecurityVersion",
                table: "NguoiDungs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Chọn một session chuẩn cho mỗi (user, device): ưu tiên active, hoạt động gần nhất,
            // rồi MaPhien lớn nhất. Repoint refresh-token FK trước khi xóa duplicate.
            migrationBuilder.Sql(
                """
                WITH ranked AS (
                    SELECT "MaPhien",
                           FIRST_VALUE("MaPhien") OVER (
                               PARTITION BY "MaNguoiDung", "MaThietBi"
                               ORDER BY "DangHoatDong" DESC, "ThoiGianHoatDongCuoi" DESC, "MaPhien" DESC
                           ) AS survivor
                    FROM "PhienDangNhap"
                )
                UPDATE "RefreshToken" AS token
                SET "MaPhien" = ranked.survivor
                FROM ranked
                WHERE token."MaPhien" = ranked."MaPhien"
                  AND ranked."MaPhien" <> ranked.survivor;

                WITH ranked AS (
                    SELECT "MaPhien",
                           ROW_NUMBER() OVER (
                               PARTITION BY "MaNguoiDung", "MaThietBi"
                               ORDER BY "DangHoatDong" DESC, "ThoiGianHoatDongCuoi" DESC, "MaPhien" DESC
                           ) AS row_number
                    FROM "PhienDangNhap"
                )
                DELETE FROM "PhienDangNhap" AS session
                USING ranked
                WHERE session."MaPhien" = ranked."MaPhien"
                  AND ranked.row_number > 1;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_PhienDangNhap_MaNguoiDung_DangHoatDong",
                table: "PhienDangNhap",
                columns: new[] { "MaNguoiDung", "DangHoatDong" });

            migrationBuilder.CreateIndex(
                name: "IX_PhienDangNhap_MaNguoiDung_MaThietBi",
                table: "PhienDangNhap",
                columns: new[] { "MaNguoiDung", "MaThietBi" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PhienDangNhap_MaNguoiDung_DangHoatDong",
                table: "PhienDangNhap");

            migrationBuilder.DropIndex(
                name: "IX_PhienDangNhap_MaNguoiDung_MaThietBi",
                table: "PhienDangNhap");

            migrationBuilder.DropColumn(
                name: "LastVerifiedAtUtc",
                table: "PhienDangNhap");

            migrationBuilder.DropColumn(
                name: "TrustRevokedAtUtc",
                table: "PhienDangNhap");

            migrationBuilder.DropColumn(
                name: "TrustVersion",
                table: "PhienDangNhap");

            migrationBuilder.DropColumn(
                name: "TrustedUntilUtc",
                table: "PhienDangNhap");

            migrationBuilder.DropColumn(
                name: "SecurityVersion",
                table: "NguoiDungs");

            migrationBuilder.CreateIndex(
                name: "IX_PhienDangNhap_MaNguoiDung",
                table: "PhienDangNhap",
                column: "MaNguoiDung");
        }
    }
}
