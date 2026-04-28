using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class add_student_gift_code_phase2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LoaiDonHang",
                table: "DonHangKhoaHocs",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "MaQuaTangHocViens",
                columns: table => new
                {
                    MaQuaTang = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    MaDonHang = table.Column<int>(type: "integer", nullable: false),
                    MaKhoaHoc = table.Column<int>(type: "integer", nullable: false),
                    MaNguoiTang = table.Column<int>(type: "integer", nullable: false),
                    MaNguoiNhan = table.Column<int>(type: "integer", nullable: true),
                    TrangThai = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ActivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RedeemedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaQuaTangHocViens", x => x.MaQuaTang);
                    table.ForeignKey(
                        name: "FK_MaQuaTangHocViens_DonHangKhoaHocs_MaDonHang",
                        column: x => x.MaDonHang,
                        principalTable: "DonHangKhoaHocs",
                        principalColumn: "MaDonHang",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MaQuaTangHocViens_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                    table.ForeignKey(
                        name: "FK_MaQuaTangHocViens_NguoiDungs_MaNguoiNhan",
                        column: x => x.MaNguoiNhan,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                    table.ForeignKey(
                        name: "FK_MaQuaTangHocViens_NguoiDungs_MaNguoiTang",
                        column: x => x.MaNguoiTang,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.UpdateData(
                table: "DonHangKhoaHocs",
                keyColumn: "MaDonHang",
                keyValue: 1,
                column: "LoaiDonHang",
                value: "COURSE_PURCHASE");

            migrationBuilder.UpdateData(
                table: "DonHangKhoaHocs",
                keyColumn: "MaDonHang",
                keyValue: 2,
                column: "LoaiDonHang",
                value: "COURSE_PURCHASE");

            migrationBuilder.CreateIndex(
                name: "IX_MaQuaTangHocViens_Code",
                table: "MaQuaTangHocViens",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MaQuaTangHocViens_MaDonHang",
                table: "MaQuaTangHocViens",
                column: "MaDonHang");

            migrationBuilder.CreateIndex(
                name: "IX_MaQuaTangHocViens_MaKhoaHoc",
                table: "MaQuaTangHocViens",
                column: "MaKhoaHoc");

            migrationBuilder.CreateIndex(
                name: "IX_MaQuaTangHocViens_MaNguoiNhan",
                table: "MaQuaTangHocViens",
                column: "MaNguoiNhan");

            migrationBuilder.CreateIndex(
                name: "IX_MaQuaTangHocViens_MaNguoiTang_TrangThai_CreatedAt",
                table: "MaQuaTangHocViens",
                columns: new[] { "MaNguoiTang", "TrangThai", "CreatedAt" });

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MaQuaTangHocViens");

            migrationBuilder.DropColumn(
                name: "LoaiDonHang",
                table: "DonHangKhoaHocs");
        }
    }
}
