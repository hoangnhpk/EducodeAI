using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteKhoaHoc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "KhoaHocs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeletedBy",
                table: "KhoaHocs",
                type: "integer",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 1,
                columns: new[] { "DeletedAt", "DeletedBy" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 2,
                columns: new[] { "DeletedAt", "DeletedBy" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 3,
                columns: new[] { "DeletedAt", "DeletedBy" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 4,
                columns: new[] { "DeletedAt", "DeletedBy" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 5,
                columns: new[] { "DeletedAt", "DeletedBy" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 6,
                columns: new[] { "DeletedAt", "DeletedBy" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 7,
                columns: new[] { "DeletedAt", "DeletedBy" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 8,
                columns: new[] { "DeletedAt", "DeletedBy" },
                values: new object[] { null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "KhoaHocs");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "KhoaHocs");
        }
    }
}
