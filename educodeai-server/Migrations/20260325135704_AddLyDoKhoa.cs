using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class AddLyDoKhoa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LyDoKhoa",
                table: "NguoiDungs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "NguoiDungs",
                keyColumn: "MaNguoiDung",
                keyValue: 1,
                column: "LyDoKhoa",
                value: null);

            migrationBuilder.UpdateData(
                table: "NguoiDungs",
                keyColumn: "MaNguoiDung",
                keyValue: 2,
                column: "LyDoKhoa",
                value: null);

            migrationBuilder.UpdateData(
                table: "NguoiDungs",
                keyColumn: "MaNguoiDung",
                keyValue: 3,
                column: "LyDoKhoa",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LyDoKhoa",
                table: "NguoiDungs");
        }
    }
}
