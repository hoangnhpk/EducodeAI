using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class update_BTTH : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BoThuNghiems");

            migrationBuilder.DropTable(
                name: "GoiYAI_TaoBaiTapS");

            migrationBuilder.DropTable(
                name: "LoiGiaiMaus");

            migrationBuilder.DropTable(
                name: "PhienBanBaiTaps");

            migrationBuilder.DropTable(
                name: "RangBuocBaiTaps");

            migrationBuilder.DropTable(
                name: "BaiTap_ThucHanhIDEs");

            migrationBuilder.DropTable(
                name: "NgonNguLapTrinhs");

            migrationBuilder.CreateTable(
                name: "BaiTapThucHanhs",
                columns: table => new
                {
                    MaBaiTapTH = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaBaiTap = table.Column<int>(type: "integer", nullable: false),
                    TieuDe = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    MoTaDeBai = table.Column<string>(type: "text", nullable: false),
                    NgonNgu = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MucDo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    LoiGiaiMau = table.Column<string>(type: "text", nullable: true),
                    GoiY = table.Column<string>(type: "text", nullable: true),
                    NgayTao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TrangThai = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaiTapThucHanhs", x => x.MaBaiTapTH);
                    table.ForeignKey(
                        name: "FK_BaiTapThucHanhs_BaiTaps_MaBaiTap",
                        column: x => x.MaBaiTap,
                        principalTable: "BaiTaps",
                        principalColumn: "MaBaiTap");
                });

            migrationBuilder.CreateTable(
                name: "TestCaseThucHanhs",
                columns: table => new
                {
                    MaTestCase = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaBaiTapThucHanh = table.Column<int>(type: "integer", nullable: false),
                    InputDuLieu = table.Column<string>(type: "text", nullable: false),
                    OutputMongDoi = table.Column<string>(type: "text", nullable: false),
                    MoTa = table.Column<string>(type: "text", nullable: true),
                    LaTestAn = table.Column<bool>(type: "boolean", nullable: false),
                    ThuTu = table.Column<int>(type: "integer", nullable: false),
                    Diem = table.Column<int>(type: "integer", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TestCaseThucHanhs", x => x.MaTestCase);
                    table.ForeignKey(
                        name: "FK_TestCaseThucHanhs_BaiTapThucHanhs_MaBaiTapThucHanh",
                        column: x => x.MaBaiTapThucHanh,
                        principalTable: "BaiTapThucHanhs",
                        principalColumn: "MaBaiTapTH",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BaiTapThucHanhs_MaBaiTap",
                table: "BaiTapThucHanhs",
                column: "MaBaiTap",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TestCaseThucHanhs_MaBaiTapThucHanh",
                table: "TestCaseThucHanhs",
                column: "MaBaiTapThucHanh");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TestCaseThucHanhs");

            migrationBuilder.DropTable(
                name: "BaiTapThucHanhs");

            migrationBuilder.CreateTable(
                name: "NgonNguLapTrinhs",
                columns: table => new
                {
                    MaNgonNgu = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenNgonNgu = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NgonNguLapTrinhs", x => x.MaNgonNgu);
                });

            migrationBuilder.CreateTable(
                name: "BaiTap_ThucHanhIDEs",
                columns: table => new
                {
                    MaBaiTapThucHanh = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaBaiTap = table.Column<int>(type: "integer", nullable: false),
                    MaNgonNgu = table.Column<int>(type: "integer", nullable: false),
                    CodeMau = table.Column<string>(type: "text", nullable: true),
                    DeBai = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaiTap_ThucHanhIDEs", x => x.MaBaiTapThucHanh);
                    table.ForeignKey(
                        name: "FK_BaiTap_ThucHanhIDEs_BaiTaps_MaBaiTap",
                        column: x => x.MaBaiTap,
                        principalTable: "BaiTaps",
                        principalColumn: "MaBaiTap");
                    table.ForeignKey(
                        name: "FK_BaiTap_ThucHanhIDEs_NgonNguLapTrinhs_MaNgonNgu",
                        column: x => x.MaNgonNgu,
                        principalTable: "NgonNguLapTrinhs",
                        principalColumn: "MaNgonNgu");
                });

            migrationBuilder.CreateTable(
                name: "BoThuNghiems",
                columns: table => new
                {
                    MaBoThu = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaBaiTapThucHanh = table.Column<int>(type: "integer", nullable: false),
                    AnDanh = table.Column<bool>(type: "boolean", nullable: false),
                    DauRaMongMuon = table.Column<string>(type: "text", nullable: false),
                    DauVao = table.Column<string>(type: "text", nullable: false),
                    Diem = table.Column<int>(type: "integer", nullable: false),
                    GioiHanBoNho = table.Column<int>(type: "integer", nullable: false),
                    GioiHanThoiGian = table.Column<int>(type: "integer", nullable: false),
                    LaEdgeCase = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BoThuNghiems", x => x.MaBoThu);
                    table.ForeignKey(
                        name: "FK_BoThuNghiems_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                        column: x => x.MaBaiTapThucHanh,
                        principalTable: "BaiTap_ThucHanhIDEs",
                        principalColumn: "MaBaiTapThucHanh");
                });

            migrationBuilder.CreateTable(
                name: "GoiYAI_TaoBaiTapS",
                columns: table => new
                {
                    MaGoiY = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaBaiTapThucHanh = table.Column<int>(type: "integer", nullable: false),
                    LoaiGoiY = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    NgayTao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NoiDung = table.Column<string>(type: "text", nullable: false),
                    TrangThai = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoiYAI_TaoBaiTapS", x => x.MaGoiY);
                    table.ForeignKey(
                        name: "FK_GoiYAI_TaoBaiTapS_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                        column: x => x.MaBaiTapThucHanh,
                        principalTable: "BaiTap_ThucHanhIDEs",
                        principalColumn: "MaBaiTapThucHanh");
                });

            migrationBuilder.CreateTable(
                name: "LoiGiaiMaus",
                columns: table => new
                {
                    MaLoiGiai = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaBaiTapThucHanh = table.Column<int>(type: "integer", nullable: false),
                    MaNgonNgu = table.Column<int>(type: "integer", nullable: false),
                    CodeMau = table.Column<string>(type: "text", nullable: false),
                    DoPhucTap = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    GiaiThich = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoiGiaiMaus", x => x.MaLoiGiai);
                    table.ForeignKey(
                        name: "FK_LoiGiaiMaus_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                        column: x => x.MaBaiTapThucHanh,
                        principalTable: "BaiTap_ThucHanhIDEs",
                        principalColumn: "MaBaiTapThucHanh");
                    table.ForeignKey(
                        name: "FK_LoiGiaiMaus_NgonNguLapTrinhs_MaNgonNgu",
                        column: x => x.MaNgonNgu,
                        principalTable: "NgonNguLapTrinhs",
                        principalColumn: "MaNgonNgu");
                });

            migrationBuilder.CreateTable(
                name: "PhienBanBaiTaps",
                columns: table => new
                {
                    MaPhienBan = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaBaiTapThucHanh = table.Column<int>(type: "integer", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SnapshotJSON = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhienBanBaiTaps", x => x.MaPhienBan);
                    table.ForeignKey(
                        name: "FK_PhienBanBaiTaps_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                        column: x => x.MaBaiTapThucHanh,
                        principalTable: "BaiTap_ThucHanhIDEs",
                        principalColumn: "MaBaiTapThucHanh");
                });

            migrationBuilder.CreateTable(
                name: "RangBuocBaiTaps",
                columns: table => new
                {
                    MaRangBuoc = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaBaiTapThucHanh = table.Column<int>(type: "integer", nullable: false),
                    GiaTri = table.Column<string>(type: "text", nullable: false),
                    TenRangBuoc = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RangBuocBaiTaps", x => x.MaRangBuoc);
                    table.ForeignKey(
                        name: "FK_RangBuocBaiTaps_BaiTap_ThucHanhIDEs_MaBaiTapThucHanh",
                        column: x => x.MaBaiTapThucHanh,
                        principalTable: "BaiTap_ThucHanhIDEs",
                        principalColumn: "MaBaiTapThucHanh");
                });

            migrationBuilder.CreateIndex(
                name: "IX_BaiTap_ThucHanhIDEs_MaBaiTap",
                table: "BaiTap_ThucHanhIDEs",
                column: "MaBaiTap",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BaiTap_ThucHanhIDEs_MaBaiTap_MaNgonNgu",
                table: "BaiTap_ThucHanhIDEs",
                columns: new[] { "MaBaiTap", "MaNgonNgu" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BaiTap_ThucHanhIDEs_MaNgonNgu",
                table: "BaiTap_ThucHanhIDEs",
                column: "MaNgonNgu");

            migrationBuilder.CreateIndex(
                name: "IX_BoThuNghiems_MaBaiTapThucHanh",
                table: "BoThuNghiems",
                column: "MaBaiTapThucHanh");

            migrationBuilder.CreateIndex(
                name: "IX_GoiYAI_TaoBaiTapS_MaBaiTapThucHanh",
                table: "GoiYAI_TaoBaiTapS",
                column: "MaBaiTapThucHanh");

            migrationBuilder.CreateIndex(
                name: "IX_LoiGiaiMaus_MaBaiTapThucHanh",
                table: "LoiGiaiMaus",
                column: "MaBaiTapThucHanh");

            migrationBuilder.CreateIndex(
                name: "IX_LoiGiaiMaus_MaNgonNgu",
                table: "LoiGiaiMaus",
                column: "MaNgonNgu");

            migrationBuilder.CreateIndex(
                name: "IX_PhienBanBaiTaps_MaBaiTapThucHanh",
                table: "PhienBanBaiTaps",
                column: "MaBaiTapThucHanh");

            migrationBuilder.CreateIndex(
                name: "IX_RangBuocBaiTaps_MaBaiTapThucHanh",
                table: "RangBuocBaiTaps",
                column: "MaBaiTapThucHanh");
        }
    }
}
