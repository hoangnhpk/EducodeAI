using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class add_rut_tien_giang_vien : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MaNganHangNhanTien",
                table: "NguoiDungs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SoTaiKhoanNhanTien",
                table: "NguoiDungs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TenTaiKhoanNhanTien",
                table: "NguoiDungs",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "YeuCauRutTienGiangViens",
                columns: table => new
                {
                    MaYeuCauRutTien = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaGiangVien = table.Column<int>(type: "integer", nullable: false),
                    SoTienYeuCau = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TrangThaiYeuCau = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    LoaiTien = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    MaNganHangNhan = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SoTaiKhoanNhan = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TenTaiKhoanNhan = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    NoiDungChuyenKhoan = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    DuongDanAnhQr = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SoTienDaChuyen = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    MaGiaoDichSePay = table.Column<long>(type: "bigint", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DuyetLuc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MaQuanTriVienDuyet = table.Column<int>(type: "integer", nullable: true),
                    ChuyenKhoanThanhCongLuc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    GhiChuAdmin = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_YeuCauRutTienGiangViens", x => x.MaYeuCauRutTien);
                    table.CheckConstraint("CK_YeuCauRutTienGiangVien_SoTienYeuCau_Duong", "\"SoTienYeuCau\" > 0");
                    table.ForeignKey(
                        name: "FK_YeuCauRutTienGiangViens_NguoiDungs_MaGiangVien",
                        column: x => x.MaGiangVien,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                    table.ForeignKey(
                        name: "FK_YeuCauRutTienGiangViens_NguoiDungs_MaQuanTriVienDuyet",
                        column: x => x.MaQuanTriVienDuyet,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.UpdateData(
                table: "NguoiDungs",
                keyColumn: "MaNguoiDung",
                keyValue: 1,
                columns: new[] { "MaNganHangNhanTien", "SoTaiKhoanNhanTien", "TenTaiKhoanNhanTien" },
                values: new object[] { null, null, null });

            migrationBuilder.UpdateData(
                table: "NguoiDungs",
                keyColumn: "MaNguoiDung",
                keyValue: 2,
                columns: new[] { "MaNganHangNhanTien", "SoTaiKhoanNhanTien", "TenTaiKhoanNhanTien" },
                values: new object[] { null, null, null });

            migrationBuilder.UpdateData(
                table: "NguoiDungs",
                keyColumn: "MaNguoiDung",
                keyValue: 3,
                columns: new[] { "MaNganHangNhanTien", "SoTaiKhoanNhanTien", "TenTaiKhoanNhanTien" },
                values: new object[] { null, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_YeuCauRutTienGiangViens_MaGiangVien",
                table: "YeuCauRutTienGiangViens",
                column: "MaGiangVien");

            migrationBuilder.CreateIndex(
                name: "IX_YeuCauRutTienGiangViens_MaGiaoDichSePay",
                table: "YeuCauRutTienGiangViens",
                column: "MaGiaoDichSePay",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_YeuCauRutTienGiangViens_MaQuanTriVienDuyet",
                table: "YeuCauRutTienGiangViens",
                column: "MaQuanTriVienDuyet");

            migrationBuilder.CreateIndex(
                name: "IX_YeuCauRutTienGiangViens_NoiDungChuyenKhoan",
                table: "YeuCauRutTienGiangViens",
                column: "NoiDungChuyenKhoan",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "YeuCauRutTienGiangViens");

            migrationBuilder.DropColumn(
                name: "MaNganHangNhanTien",
                table: "NguoiDungs");

            migrationBuilder.DropColumn(
                name: "SoTaiKhoanNhanTien",
                table: "NguoiDungs");

            migrationBuilder.DropColumn(
                name: "TenTaiKhoanNhanTien",
                table: "NguoiDungs");
        }
    }
}
