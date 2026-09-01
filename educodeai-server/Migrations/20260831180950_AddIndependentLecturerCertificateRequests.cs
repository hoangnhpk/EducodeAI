using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class AddIndependentLecturerCertificateRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HienThiCongKhai",
                table: "HoSoGiangVienTaiLieus",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateTable(
                name: "YeuCauChungChiGiangViens",
                columns: table => new
                {
                    MaYeuCauChungChi = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaGiangVien = table.Column<int>(type: "integer", nullable: false),
                    ClientRequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenChungChi = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DonViCap = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    NgayCap = table.Column<DateOnly>(type: "date", nullable: true),
                    NgayHetHan = table.Column<DateOnly>(type: "date", nullable: true),
                    MaChungChi = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    UrlXacMinh = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TenFileGoc = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    StorageKey = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    KichThuoc = table.Column<long>(type: "bigint", nullable: false),
                    Sha256 = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    TrangThai = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    LyDoXuLy = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    HienThiCongKhai = table.Column<bool>(type: "boolean", nullable: false),
                    MaQuanTriVienDuyet = table.Column<int>(type: "integer", nullable: true),
                    NgayTao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NgayCapNhat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NgayDuyet = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_YeuCauChungChiGiangViens", x => x.MaYeuCauChungChi);
                    table.CheckConstraint("CK_YeuCauChungChiGiangViens_NgayHetHan", "\"NgayHetHan\" IS NULL OR \"NgayCap\" IS NULL OR \"NgayHetHan\" >= \"NgayCap\"");
                    table.ForeignKey(
                        name: "FK_YeuCauChungChiGiangViens_NguoiDungs_MaGiangVien",
                        column: x => x.MaGiangVien,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateIndex(
                name: "IX_YeuCauChungChiGiangViens_MaGiangVien_ClientRequestId",
                table: "YeuCauChungChiGiangViens",
                columns: new[] { "MaGiangVien", "ClientRequestId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_YeuCauChungChiGiangViens_MaGiangVien_TrangThai_NgayDuyet",
                table: "YeuCauChungChiGiangViens",
                columns: new[] { "MaGiangVien", "TrangThai", "NgayDuyet" });

            migrationBuilder.CreateIndex(
                name: "IX_YeuCauChungChiGiangViens_StorageKey",
                table: "YeuCauChungChiGiangViens",
                column: "StorageKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_YeuCauChungChiGiangViens_TrangThai_NgayTao",
                table: "YeuCauChungChiGiangViens",
                columns: new[] { "TrangThai", "NgayTao" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "YeuCauChungChiGiangViens");

            migrationBuilder.DropColumn(
                name: "HienThiCongKhai",
                table: "HoSoGiangVienTaiLieus");
        }
    }
}
