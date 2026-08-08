using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class AddRefreshTokenTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RefreshToken",
                columns: table => new
                {
                    MaRefreshToken = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    MaPhien = table.Column<int>(type: "integer", nullable: true),
                    TokenHash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    FamilyId = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Jti = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    ThoiGianHetHan = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NgayThuHoi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LyDoThuHoi = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    ReplacedByTokenHash = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    IpTao = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    UserAgentTao = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    IpThuHoi = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshToken", x => x.MaRefreshToken);
                    table.ForeignKey(
                        name: "FK_RefreshToken_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RefreshToken_PhienDangNhap_MaPhien",
                        column: x => x.MaPhien,
                        principalTable: "PhienDangNhap",
                        principalColumn: "MaPhien",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_FamilyId",
                table: "RefreshToken",
                column: "FamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_MaNguoiDung_NgayThuHoi_ThoiGianHetHan",
                table: "RefreshToken",
                columns: new[] { "MaNguoiDung", "NgayThuHoi", "ThoiGianHetHan" });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_MaPhien",
                table: "RefreshToken",
                column: "MaPhien");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_TokenHash",
                table: "RefreshToken",
                column: "TokenHash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RefreshToken");
        }
    }
}
