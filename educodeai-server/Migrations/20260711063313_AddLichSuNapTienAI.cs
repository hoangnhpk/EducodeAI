using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class AddLichSuNapTienAI : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LichSuNapTienAIs",
                columns: table => new
                {
                    MaGiaoDich = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaGiangVien = table.Column<int>(type: "integer", nullable: false),
                    SoTienVnd = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    SoTienUsd = table.Column<decimal>(type: "numeric(10,4)", nullable: false),
                    TyGiaApDung = table.Column<decimal>(type: "numeric(10,4)", nullable: false),
                    TrangThai = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LichSuNapTienAIs", x => x.MaGiaoDich);
                    table.ForeignKey(
                        name: "FK_LichSuNapTienAIs_NguoiDungs_MaGiangVien",
                        column: x => x.MaGiangVien,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LichSuNapTienAIs_MaGiangVien",
                table: "LichSuNapTienAIs",
                column: "MaGiangVien");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LichSuNapTienAIs");
        }
    }
}
