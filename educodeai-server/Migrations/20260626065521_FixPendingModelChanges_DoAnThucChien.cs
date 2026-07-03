using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class FixPendingModelChanges_DoAnThucChien : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DoAnThucChiens",
                columns: table => new
                {
                    MaDoAn = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    TenDoAn = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    MoTa = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    YeuCauChucNangJSON = table.Column<string>(type: "text", nullable: false),
                    CauTrucDatabaseText = table.Column<string>(type: "text", nullable: false),
                    MucTieuNgheNghiep = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    NgonNguCongNghe = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TrangThai = table.Column<int>(type: "integer", nullable: false),
                    DiemPhongVan = table.Column<int>(type: "integer", nullable: true),
                    LichSuPhongVanJSON = table.Column<string>(type: "text", nullable: false),
                    NgayNop = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NgayPhongVan = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoAnThucChiens", x => x.MaDoAn);
                    table.ForeignKey(
                        name: "FK_DoAnThucChiens_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "ChungChiDoAns",
                columns: table => new
                {
                    MaChungChiDoAn = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    MaDoAn = table.Column<int>(type: "integer", nullable: false),
                    MaChungChi = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DiemDat = table.Column<int>(type: "integer", nullable: false),
                    NgayCap = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChungChiDoAns", x => x.MaChungChiDoAn);
                    table.ForeignKey(
                        name: "FK_ChungChiDoAns_DoAnThucChiens_MaDoAn",
                        column: x => x.MaDoAn,
                        principalTable: "DoAnThucChiens",
                        principalColumn: "MaDoAn",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChungChiDoAns_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChungChiDoAns_MaChungChi",
                table: "ChungChiDoAns",
                column: "MaChungChi",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChungChiDoAns_MaDoAn",
                table: "ChungChiDoAns",
                column: "MaDoAn",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChungChiDoAns_MaNguoiDung_MaDoAn",
                table: "ChungChiDoAns",
                columns: new[] { "MaNguoiDung", "MaDoAn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DoAnThucChiens_MaNguoiDung_NgayNop",
                table: "DoAnThucChiens",
                columns: new[] { "MaNguoiDung", "NgayNop" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChungChiDoAns");

            migrationBuilder.DropTable(
                name: "DoAnThucChiens");
        }
    }
}
