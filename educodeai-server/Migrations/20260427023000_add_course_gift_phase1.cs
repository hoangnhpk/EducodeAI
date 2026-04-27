using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    public partial class add_course_gift_phase1 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "QuaTangKhoaHocs",
                columns: table => new
                {
                    MaQuaTang = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaKhoaHoc = table.Column<int>(type: "integer", nullable: false),
                    MaNguoiNhan = table.Column<int>(type: "integer", nullable: false),
                    MaNguoiTang = table.Column<int>(type: "integer", nullable: false),
                    LoaiNguoiTang = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TrangThai = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    LoiNhan = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuaTangKhoaHocs", x => x.MaQuaTang);
                    table.ForeignKey(
                        name: "FK_QuaTangKhoaHocs_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                    table.ForeignKey(
                        name: "FK_QuaTangKhoaHocs_NguoiDungs_MaNguoiNhan",
                        column: x => x.MaNguoiNhan,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                    table.ForeignKey(
                        name: "FK_QuaTangKhoaHocs_NguoiDungs_MaNguoiTang",
                        column: x => x.MaNguoiTang,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateIndex(
                name: "IX_QuaTangKhoaHocs_MaKhoaHoc_MaNguoiNhan_TrangThai",
                table: "QuaTangKhoaHocs",
                columns: new[] { "MaKhoaHoc", "MaNguoiNhan", "TrangThai" });

            migrationBuilder.CreateIndex(
                name: "IX_QuaTangKhoaHocs_MaNguoiNhan",
                table: "QuaTangKhoaHocs",
                column: "MaNguoiNhan");

            migrationBuilder.CreateIndex(
                name: "IX_QuaTangKhoaHocs_MaNguoiTang_MaKhoaHoc_CreatedAt",
                table: "QuaTangKhoaHocs",
                columns: new[] { "MaNguoiTang", "MaKhoaHoc", "CreatedAt" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "QuaTangKhoaHocs");
        }
    }
}
