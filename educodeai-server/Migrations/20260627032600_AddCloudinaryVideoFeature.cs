using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class AddCloudinaryVideoFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AiFeaturesEnabled",
                table: "BaiHocs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasSubtitle",
                table: "BaiHocs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SubtitleSource",
                table: "BaiHocs",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubtitleUrl",
                table: "BaiHocs",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VideoDurationS",
                table: "BaiHocs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoPublicId",
                table: "BaiHocs",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VideoSizeMb",
                table: "BaiHocs",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoSource",
                table: "BaiHocs",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "youtube");

            migrationBuilder.AddColumn<string>(
                name: "VideoStatus",
                table: "BaiHocs",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AIBalanceHolds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaGiangVien = table.Column<int>(type: "integer", nullable: false),
                    MaBaiHoc = table.Column<int>(type: "integer", nullable: false),
                    AmountUsd = table.Column<decimal>(type: "numeric(10,4)", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SettledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AIBalanceHolds", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GiangVienQuotas",
                columns: table => new
                {
                    MaGiangVien = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StorageUsedMb = table.Column<long>(type: "bigint", nullable: false),
                    StorageLimitMb = table.Column<long>(type: "bigint", nullable: false),
                    AiBalanceUsd = table.Column<decimal>(type: "numeric(10,4)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GiangVienQuotas", x => x.MaGiangVien);
                });

            migrationBuilder.CreateTable(
                name: "WebhookLogs",
                columns: table => new
                {
                    NotificationId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    NotificationType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Payload = table.Column<string>(type: "jsonb", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebhookLogs", x => x.NotificationId);
                });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 1,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 2,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 3,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 4,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 5,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 6,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 7,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 8,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 9,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 10,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 11,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 12,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 13,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 14,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 15,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 16,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 17,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 18,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 19,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 20,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 21,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 22,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 23,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 24,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 25,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 26,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 27,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 28,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 29,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 30,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 31,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 32,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 33,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 34,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 35,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 36,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 37,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 38,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 39,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 40,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 41,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 42,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 43,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 44,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 45,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 46,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 47,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 48,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 49,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 50,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 51,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 52,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 53,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 54,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 55,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 56,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 57,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 58,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 59,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 60,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 61,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 62,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 63,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 64,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 65,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 66,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 67,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 68,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 69,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 70,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 71,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 72,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 73,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 74,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 75,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 76,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 77,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 78,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 79,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 80,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 81,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 82,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 83,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 84,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 85,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 86,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 87,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 88,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 89,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 90,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 91,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 92,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 93,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 94,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 95,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 96,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 97,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 98,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 99,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 100,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 101,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 102,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 103,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 104,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 105,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 106,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 107,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 108,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 109,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 110,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 111,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 112,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 113,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 114,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 115,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 116,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 117,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 118,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 119,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 120,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 121,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 122,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 123,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 124,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 125,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 126,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 127,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 128,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 129,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 130,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 131,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 132,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 133,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 134,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 135,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 136,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 137,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 138,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 139,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 140,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 141,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 142,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 143,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 144,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 145,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 146,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });

            migrationBuilder.UpdateData(
                table: "BaiHocs",
                keyColumn: "MaBaiHoc",
                keyValue: 147,
                columns: new[] { "AiFeaturesEnabled", "HasSubtitle", "SubtitleSource", "SubtitleUrl", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[] { true, false, null, null, null, null, null, "youtube", null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AIBalanceHolds");

            migrationBuilder.DropTable(
                name: "GiangVienQuotas");

            migrationBuilder.DropTable(
                name: "WebhookLogs");

            migrationBuilder.DropColumn(
                name: "AiFeaturesEnabled",
                table: "BaiHocs");

            migrationBuilder.DropColumn(
                name: "HasSubtitle",
                table: "BaiHocs");

            migrationBuilder.DropColumn(
                name: "SubtitleSource",
                table: "BaiHocs");

            migrationBuilder.DropColumn(
                name: "SubtitleUrl",
                table: "BaiHocs");

            migrationBuilder.DropColumn(
                name: "VideoDurationS",
                table: "BaiHocs");

            migrationBuilder.DropColumn(
                name: "VideoPublicId",
                table: "BaiHocs");

            migrationBuilder.DropColumn(
                name: "VideoSizeMb",
                table: "BaiHocs");

            migrationBuilder.DropColumn(
                name: "VideoSource",
                table: "BaiHocs");

            migrationBuilder.DropColumn(
                name: "VideoStatus",
                table: "BaiHocs");
        }
    }
}
