using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "KyNangChinh",
                table: "KhoaHocs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinhVuc",
                table: "KhoaHocs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ThoiLuongGio",
                table: "KhoaHocs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TrinhDo",
                table: "KhoaHocs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KyNangChinh",
                table: "KhoaHocs");

            migrationBuilder.DropColumn(
                name: "LinhVuc",
                table: "KhoaHocs");

            migrationBuilder.DropColumn(
                name: "ThoiLuongGio",
                table: "KhoaHocs");

            migrationBuilder.DropColumn(
                name: "TrinhDo",
                table: "KhoaHocs");
        }
    }
}
