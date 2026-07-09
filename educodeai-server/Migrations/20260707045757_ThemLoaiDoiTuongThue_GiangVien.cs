using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class ThemLoaiDoiTuongThue_GiangVien : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LoaiDoiTuongThue",
                table: "HoSoDangKyGiangViens",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LoaiDoiTuongThue",
                table: "HoSoDangKyGiangViens");
        }
    }
}
