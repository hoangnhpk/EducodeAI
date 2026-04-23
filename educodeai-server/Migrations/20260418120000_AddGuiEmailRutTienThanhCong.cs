using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public class AddGuiEmailRutTienThanhCong : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "GuiEmailRutTienThanhCongLuc",
                table: "YeuCauRutTienGiangViens",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GuiEmailRutTienThanhCongLuc",
                table: "YeuCauRutTienGiangViens");
        }
    }
}
