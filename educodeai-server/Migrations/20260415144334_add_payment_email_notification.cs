using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class add_payment_email_notification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ThongBaoEmailThanhToans",
                columns: table => new
                {
                    MaThongBao = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaDonHang = table.Column<int>(type: "integer", nullable: false),
                    LoaiThongBao = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EmailNhan = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    TrangThai = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SoLanThu = table.Column<int>(type: "integer", nullable: false),
                    LoiCuoi = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThongBaoEmailThanhToans", x => x.MaThongBao);
                    table.ForeignKey(
                        name: "FK_ThongBaoEmailThanhToans_DonHangKhoaHocs_MaDonHang",
                        column: x => x.MaDonHang,
                        principalTable: "DonHangKhoaHocs",
                        principalColumn: "MaDonHang",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ThongBaoEmailThanhToans_MaDonHang_LoaiThongBao_EmailNhan",
                table: "ThongBaoEmailThanhToans",
                columns: new[] { "MaDonHang", "LoaiThongBao", "EmailNhan" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ThongBaoEmailThanhToans");
        }
    }
}
