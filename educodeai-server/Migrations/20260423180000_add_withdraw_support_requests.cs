using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    public partial class add_withdraw_support_requests : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HoTroRutTienGiangViens",
                columns: table => new
                {
                    MaHoTroRutTienGiangVien = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaYeuCauRutTien = table.Column<int>(type: "integer", nullable: false),
                    MaGiangVien = table.Column<int>(type: "integer", nullable: false),
                    TrangThaiHoTro = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ThongTinLienLac = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    NoiDungGiangVien = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    GhiChuAdmin = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    MaQuanTriVienXuLy = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    XuLyLuc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HoTroRutTienGiangViens", x => x.MaHoTroRutTienGiangVien);
                    table.ForeignKey(
                        name: "FK_HoTroRutTienGiangViens_NguoiDungs_MaGiangVien",
                        column: x => x.MaGiangVien,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                    table.ForeignKey(
                        name: "FK_HoTroRutTienGiangViens_NguoiDungs_MaQuanTriVienXuLy",
                        column: x => x.MaQuanTriVienXuLy,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                    table.ForeignKey(
                        name: "FK_HoTroRutTienGiangViens_YeuCauRutTienGiangViens_MaYeuCauRutT~",
                        column: x => x.MaYeuCauRutTien,
                        principalTable: "YeuCauRutTienGiangViens",
                        principalColumn: "MaYeuCauRutTien",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HoTroRutTienGiangViens_MaGiangVien",
                table: "HoTroRutTienGiangViens",
                column: "MaGiangVien");

            migrationBuilder.CreateIndex(
                name: "IX_HoTroRutTienGiangViens_MaQuanTriVienXuLy",
                table: "HoTroRutTienGiangViens",
                column: "MaQuanTriVienXuLy");

            migrationBuilder.CreateIndex(
                name: "IX_HoTroRutTienGiangViens_MaYeuCauRutTien_TrangThaiHoTro",
                table: "HoTroRutTienGiangViens",
                columns: new[] { "MaYeuCauRutTien", "TrangThaiHoTro" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HoTroRutTienGiangViens");
        }
    }
}
