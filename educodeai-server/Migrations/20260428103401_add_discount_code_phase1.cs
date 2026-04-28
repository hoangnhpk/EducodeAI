using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class add_discount_code_phase1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ChoPhepApDungChoQuaTang",
                table: "MaGiamGias",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "LoaiNguoiTao",
                table: "MaGiamGias",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "ADMIN");

            migrationBuilder.AddColumn<int>(
                name: "MaNguoiTao",
                table: "MaGiamGias",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<string>(
                name: "PhamViApDung",
                table: "MaGiamGias",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "SPECIFIC_COURSES");

            migrationBuilder.AddColumn<string>(
                name: "CodeVoucher",
                table: "DonHangKhoaHocs",
                type: "character varying(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaVoucher",
                table: "DonHangKhoaHocs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SoTienGiam",
                table: "DonHangKhoaHocs",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TongTienGoc",
                table: "DonHangKhoaHocs",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.Sql("""UPDATE "DonHangKhoaHocs" SET "TongTienGoc" = "TongTien" WHERE "TongTienGoc" = 0;""");

            migrationBuilder.CreateTable(
                name: "MaGiamGiaKhoaHocs",
                columns: table => new
                {
                    MaLienKet = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaVoucher = table.Column<int>(type: "integer", nullable: false),
                    MaKhoaHoc = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaGiamGiaKhoaHocs", x => x.MaLienKet);
                    table.ForeignKey(
                        name: "FK_MaGiamGiaKhoaHocs_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                    table.ForeignKey(
                        name: "FK_MaGiamGiaKhoaHocs_MaGiamGias_MaVoucher",
                        column: x => x.MaVoucher,
                        principalTable: "MaGiamGias",
                        principalColumn: "MaVoucher",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DonHangKhoaHocs_MaVoucher",
                table: "DonHangKhoaHocs",
                column: "MaVoucher");

            migrationBuilder.CreateIndex(
                name: "IX_MaGiamGiaKhoaHocs_MaKhoaHoc",
                table: "MaGiamGiaKhoaHocs",
                column: "MaKhoaHoc");

            migrationBuilder.CreateIndex(
                name: "IX_MaGiamGiaKhoaHocs_MaVoucher_MaKhoaHoc",
                table: "MaGiamGiaKhoaHocs",
                columns: new[] { "MaVoucher", "MaKhoaHoc" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MaGiamGias_MaNguoiTao",
                table: "MaGiamGias",
                column: "MaNguoiTao");

            migrationBuilder.AddForeignKey(
                name: "FK_DonHangKhoaHocs_MaGiamGias_MaVoucher",
                table: "DonHangKhoaHocs",
                column: "MaVoucher",
                principalTable: "MaGiamGias",
                principalColumn: "MaVoucher",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_MaGiamGias_NguoiDungs_MaNguoiTao",
                table: "MaGiamGias",
                column: "MaNguoiTao",
                principalTable: "NguoiDungs",
                principalColumn: "MaNguoiDung");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DonHangKhoaHocs_MaGiamGias_MaVoucher",
                table: "DonHangKhoaHocs");

            migrationBuilder.DropForeignKey(
                name: "FK_MaGiamGias_NguoiDungs_MaNguoiTao",
                table: "MaGiamGias");

            migrationBuilder.DropTable(
                name: "MaGiamGiaKhoaHocs");

            migrationBuilder.DropIndex(
                name: "IX_DonHangKhoaHocs_MaVoucher",
                table: "DonHangKhoaHocs");

            migrationBuilder.DropIndex(
                name: "IX_MaGiamGias_MaNguoiTao",
                table: "MaGiamGias");

            migrationBuilder.DropColumn(
                name: "ChoPhepApDungChoQuaTang",
                table: "MaGiamGias");

            migrationBuilder.DropColumn(
                name: "LoaiNguoiTao",
                table: "MaGiamGias");

            migrationBuilder.DropColumn(
                name: "MaNguoiTao",
                table: "MaGiamGias");

            migrationBuilder.DropColumn(
                name: "PhamViApDung",
                table: "MaGiamGias");

            migrationBuilder.DropColumn(
                name: "CodeVoucher",
                table: "DonHangKhoaHocs");

            migrationBuilder.DropColumn(
                name: "MaVoucher",
                table: "DonHangKhoaHocs");

            migrationBuilder.DropColumn(
                name: "SoTienGiam",
                table: "DonHangKhoaHocs");

            migrationBuilder.DropColumn(
                name: "TongTienGoc",
                table: "DonHangKhoaHocs");
        }
    }
}
