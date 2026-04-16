using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class FixPendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "KetQuaKiemTraChungChis",
                columns: table => new
                {
                    MaKetQuaKiemTraChungChi = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaKhoaHoc = table.Column<int>(type: "integer", nullable: false),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    DiemSo = table.Column<double>(type: "double precision", nullable: false),
                    SoCauDung = table.Column<int>(type: "integer", nullable: false),
                    TongSoCau = table.Column<int>(type: "integer", nullable: false),
                    DaDat = table.Column<bool>(type: "boolean", nullable: false),
                    ChiTietLamBaiJSON = table.Column<string>(type: "text", nullable: false),
                    NgayThi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KetQuaKiemTraChungChis", x => x.MaKetQuaKiemTraChungChi);
                    table.ForeignKey(
                        name: "FK_KetQuaKiemTraChungChis_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                    table.ForeignKey(
                        name: "FK_KetQuaKiemTraChungChis_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "ChungChiKhoaHocs",
                columns: table => new
                {
                    MaChungChiKhoaHoc = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaChungChi = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MaKhoaHoc = table.Column<int>(type: "integer", nullable: false),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    MaKetQuaKiemTraChungChi = table.Column<int>(type: "integer", nullable: true),
                    NgayCap = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChungChiKhoaHocs", x => x.MaChungChiKhoaHoc);
                    table.ForeignKey(
                        name: "FK_ChungChiKhoaHocs_KetQuaKiemTraChungChis_MaKetQuaKiemTraChun~",
                        column: x => x.MaKetQuaKiemTraChungChi,
                        principalTable: "KetQuaKiemTraChungChis",
                        principalColumn: "MaKetQuaKiemTraChungChi");
                    table.ForeignKey(
                        name: "FK_ChungChiKhoaHocs_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                    table.ForeignKey(
                        name: "FK_ChungChiKhoaHocs_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChungChiKhoaHocs_MaChungChi",
                table: "ChungChiKhoaHocs",
                column: "MaChungChi",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChungChiKhoaHocs_MaKetQuaKiemTraChungChi",
                table: "ChungChiKhoaHocs",
                column: "MaKetQuaKiemTraChungChi");

            migrationBuilder.CreateIndex(
                name: "IX_ChungChiKhoaHocs_MaKhoaHoc",
                table: "ChungChiKhoaHocs",
                column: "MaKhoaHoc");

            migrationBuilder.CreateIndex(
                name: "IX_ChungChiKhoaHocs_MaNguoiDung_MaKhoaHoc",
                table: "ChungChiKhoaHocs",
                columns: new[] { "MaNguoiDung", "MaKhoaHoc" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_KetQuaKiemTraChungChis_MaKhoaHoc",
                table: "KetQuaKiemTraChungChis",
                column: "MaKhoaHoc");

            migrationBuilder.CreateIndex(
                name: "IX_KetQuaKiemTraChungChis_MaNguoiDung",
                table: "KetQuaKiemTraChungChis",
                column: "MaNguoiDung");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChungChiKhoaHocs");

            migrationBuilder.DropTable(
                name: "KetQuaKiemTraChungChis");
        }
    }
}
