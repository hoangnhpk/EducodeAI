using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class AddLecturerCertificateMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ClientFileId",
                table: "HoSoGiangVienTaiLieus",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DonViCap",
                table: "HoSoGiangVienTaiLieus",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MaChungChi",
                table: "HoSoGiangVienTaiLieus",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "NgayCapChungChi",
                table: "HoSoGiangVienTaiLieus",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "NgayHetHanChungChi",
                table: "HoSoGiangVienTaiLieus",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RelativePath",
                table: "HoSoGiangVienTaiLieus",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TenChungChi",
                table: "HoSoGiangVienTaiLieus",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UrlXacMinh",
                table: "HoSoGiangVienTaiLieus",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_HoSoGiangVienTaiLieus_MaHoSoDangKyGiangVien_ClientFileId",
                table: "HoSoGiangVienTaiLieus",
                columns: new[] { "MaHoSoDangKyGiangVien", "ClientFileId" },
                unique: true,
                filter: "\"ClientFileId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_HoSoGiangVienTaiLieus_MaHoSoDangKyGiangVien_ClientFileId",
                table: "HoSoGiangVienTaiLieus");

            migrationBuilder.DropColumn(name: "ClientFileId", table: "HoSoGiangVienTaiLieus");
            migrationBuilder.DropColumn(name: "DonViCap", table: "HoSoGiangVienTaiLieus");
            migrationBuilder.DropColumn(name: "MaChungChi", table: "HoSoGiangVienTaiLieus");
            migrationBuilder.DropColumn(name: "NgayCapChungChi", table: "HoSoGiangVienTaiLieus");
            migrationBuilder.DropColumn(name: "NgayHetHanChungChi", table: "HoSoGiangVienTaiLieus");
            migrationBuilder.DropColumn(name: "RelativePath", table: "HoSoGiangVienTaiLieus");
            migrationBuilder.DropColumn(name: "TenChungChi", table: "HoSoGiangVienTaiLieus");
            migrationBuilder.DropColumn(name: "UrlXacMinh", table: "HoSoGiangVienTaiLieus");
        }
    }
}
