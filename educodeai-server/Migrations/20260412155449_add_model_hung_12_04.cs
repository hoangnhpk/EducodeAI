using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class add_model_hung_12_04 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CoQuiz",
                table: "BaiHocs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "VideoChapters",
                columns: table => new
                {
                    MaChapter = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaBaiHoc = table.Column<int>(type: "integer", nullable: false),
                    ThoiGianBatDau = table.Column<int>(type: "integer", nullable: false),
                    ThoiGianKetThuc = table.Column<int>(type: "integer", nullable: false),
                    KienThucChinh = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    BatBuoc = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VideoChapters", x => x.MaChapter);
                    table.ForeignKey(
                        name: "FK_VideoChapters_BaiHocs_MaBaiHoc",
                        column: x => x.MaBaiHoc,
                        principalTable: "BaiHocs",
                        principalColumn: "MaBaiHoc",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VideoQuizs",
                columns: table => new
                {
                    MaVideoQuiz = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaChapter = table.Column<int>(type: "integer", nullable: false),
                    CauHoi = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    DapAnA = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DapAnB = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DapAnC = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DapAnD = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DapAnDung = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VideoQuizs", x => x.MaVideoQuiz);
                    table.ForeignKey(
                        name: "FK_VideoQuizs_VideoChapters_MaChapter",
                        column: x => x.MaChapter,
                        principalTable: "VideoChapters",
                        principalColumn: "MaChapter",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 1,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 2,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 3,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 4,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 5,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 6,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 7,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 8,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 9,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 10,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 11,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 12,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 13,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 14,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 15,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 16,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 17,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 18,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 19,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 20,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 21,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 22,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 23,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 24,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 25,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 26,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 27,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 28,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 29,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 30,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 31,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 32,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 33,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 34,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 35,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 36,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 37,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 38,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 39,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 40,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 41,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 42,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 43,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 44,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 45,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 46,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 47,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 48,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 49,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 50,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 51,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 52,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 53,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 54,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 55,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 56,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 57,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 58,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 59,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 60,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 61,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 62,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 63,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 64,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 65,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 66,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 67,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 68,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 69,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 70,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 71,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 72,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 73,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 74,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 75,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 76,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 77,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 78,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 79,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 80,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 81,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 82,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 83,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 84,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 85,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 86,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 87,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 88,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 89,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 90,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 91,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 92,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 93,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 94,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 95,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 96,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 97,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 98,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 99,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 100,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 101,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 102,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 103,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 104,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 105,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 106,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 107,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 108,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 109,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 110,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 111,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 112,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 113,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 114,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 115,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 116,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 117,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 118,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 119,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 120,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 121,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 122,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 123,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 124,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 125,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 126,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 127,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 128,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 129,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 130,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 131,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 132,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 133,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 134,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 135,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 136,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 137,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 138,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 139,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 140,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 141,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 142,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 143,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 144,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 145,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 146,
                column: "CoQuiz",
                value: true);

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 147,
                column: "CoQuiz",
                value: true);

            migrationBuilder.CreateIndex(
                name: "IX_VideoChapters_MaBaiHoc",
                table: "VideoChapters",
                column: "MaBaiHoc");

            migrationBuilder.CreateIndex(
                name: "IX_VideoQuizs_MaChapter",
                table: "VideoQuizs",
                column: "MaChapter");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VideoQuizs");

            migrationBuilder.DropTable(
                name: "VideoChapters");

            migrationBuilder.DropColumn(
                name: "CoQuiz",
                table: "BaiHocs");
        }
    }
}
