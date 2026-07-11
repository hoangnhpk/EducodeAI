using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class Initial_Reset : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LichSuPhongVans",
                columns: table => new
                {
                    MaPhongVan = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    ViTriUngTuyen = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CapDo = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    TinhCachAI = table.Column<int>(type: "integer", nullable: false),
                    SoLuongCauHoi = table.Column<int>(type: "integer", nullable: false),
                    DiemSo = table.Column<int>(type: "integer", nullable: false),
                    DanhGiaChung = table.Column<string>(type: "text", nullable: false),
                    ChiTietChatJSON = table.Column<string>(type: "text", nullable: false),
                    TrangThai = table.Column<int>(type: "integer", nullable: false),
                    NgayPhongVan = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LichSuPhongVans", x => x.MaPhongVan);
                    table.ForeignKey(
                        name: "FK_LichSuPhongVans_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateIndex(
                name: "IX_LichSuPhongVans_MaNguoiDung",
                table: "LichSuPhongVans",
                column: "MaNguoiDung");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LichSuPhongVans");
        }
    }
}
