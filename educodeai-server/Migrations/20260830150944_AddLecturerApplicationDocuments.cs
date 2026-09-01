using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class AddLecturerApplicationDocuments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HoSoGiangVienTaiLieus",
                columns: table => new
                {
                    MaTaiLieu = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaHoSoDangKyGiangVien = table.Column<long>(type: "bigint", nullable: false),
                    LoaiTaiLieu = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TenFileGoc = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    StorageKey = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    KichThuoc = table.Column<long>(type: "bigint", nullable: false),
                    Sha256 = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    TrangThai = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    LyDoTuChoi = table.Column<string>(type: "text", nullable: true),
                    NgayTaiLen = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NgayDuyet = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HoSoGiangVienTaiLieus", x => x.MaTaiLieu);
                    table.ForeignKey(
                        name: "FK_HoSoGiangVienTaiLieus_HoSoDangKyGiangViens_MaHoSoDangKyGian~",
                        column: x => x.MaHoSoDangKyGiangVien,
                        principalTable: "HoSoDangKyGiangViens",
                        principalColumn: "MaHoSoDangKyGiangVien",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HoSoGiangVienTaiLieus_MaHoSoDangKyGiangVien_LoaiTaiLieu_Tra~",
                table: "HoSoGiangVienTaiLieus",
                columns: new[] { "MaHoSoDangKyGiangVien", "LoaiTaiLieu", "TrangThai" });

            migrationBuilder.CreateIndex(
                name: "IX_HoSoGiangVienTaiLieus_StorageKey",
                table: "HoSoGiangVienTaiLieus",
                column: "StorageKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HoSoGiangVienTaiLieus");
        }
    }
}
