using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class _20260413_add_marketplace_payment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ChoPhepMua",
                table: "KhoaHocs",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "DonViTienTe",
                table: "KhoaHocs",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "VND");

            migrationBuilder.AddColumn<decimal>(
                name: "GiaKhoaHoc",
                table: "KhoaHocs",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 10000m);

            migrationBuilder.CreateTable(
                name: "DonHangKhoaHocs",
                columns: table => new
                {
                    MaDonHang = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    TongTien = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    LoaiTien = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    TrangThaiDonHang = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    IdempotencyKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonHangKhoaHocs", x => x.MaDonHang);
                    table.ForeignKey(
                        name: "FK_DonHangKhoaHocs_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "MaGiamGias",
                columns: table => new
                {
                    MaVoucher = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    TenChuongTrinh = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LoaiGiamGia = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    GiaTriGiam = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    GiamToiDa = table.Column<decimal>(type: "numeric(18,2)", nullable: true),
                    DonHangToiThieu = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    SoLuongToiDa = table.Column<int>(type: "integer", nullable: false),
                    SoLuongDaDung = table.Column<int>(type: "integer", nullable: false),
                    KichHoat = table.Column<bool>(type: "boolean", nullable: false),
                    BatDauAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    KetThucAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaGiamGias", x => x.MaVoucher);
                });

            migrationBuilder.CreateTable(
                name: "ChiTietDonHangs",
                columns: table => new
                {
                    MaChiTiet = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaDonHang = table.Column<int>(type: "integer", nullable: false),
                    MaKhoaHoc = table.Column<int>(type: "integer", nullable: false),
                    DonGia = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    GiamGia = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ThanhTien = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChiTietDonHangs", x => x.MaChiTiet);
                    table.ForeignKey(
                        name: "FK_ChiTietDonHangs_DonHangKhoaHocs_MaDonHang",
                        column: x => x.MaDonHang,
                        principalTable: "DonHangKhoaHocs",
                        principalColumn: "MaDonHang",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ChiTietDonHangs_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                });

            migrationBuilder.CreateTable(
                name: "DoanhThuGiangViens",
                columns: table => new
                {
                    MaDoanhThu = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaGiangVien = table.Column<int>(type: "integer", nullable: false),
                    MaDonHang = table.Column<int>(type: "integer", nullable: false),
                    TongTienDonHang = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    PhiNenTang = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ThucNhanGiangVien = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TrangThaiDoiSoat = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DoanhThuGiangViens", x => x.MaDoanhThu);
                    table.ForeignKey(
                        name: "FK_DoanhThuGiangViens_DonHangKhoaHocs_MaDonHang",
                        column: x => x.MaDonHang,
                        principalTable: "DonHangKhoaHocs",
                        principalColumn: "MaDonHang",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DoanhThuGiangViens_NguoiDungs_MaGiangVien",
                        column: x => x.MaGiangVien,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "GiaoDichThanhToans",
                columns: table => new
                {
                    MaGiaoDich = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaDonHang = table.Column<int>(type: "integer", nullable: false),
                    CongThanhToan = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    MaThamChieuNgoai = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SoTien = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TrangThai = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    RawWebhook = table.Column<string>(type: "jsonb", nullable: true),
                    PaidAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GiaoDichThanhToans", x => x.MaGiaoDich);
                    table.ForeignKey(
                        name: "FK_GiaoDichThanhToans_DonHangKhoaHocs_MaDonHang",
                        column: x => x.MaDonHang,
                        principalTable: "DonHangKhoaHocs",
                        principalColumn: "MaDonHang",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "DonHangKhoaHocs",
                columns: new[] { "MaDonHang", "CreatedAt", "ExpiredAt", "IdempotencyKey", "LoaiTien", "MaNguoiDung", "TongTien", "TrangThaiDonHang", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 4, 1, 9, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 4, 1, 9, 30, 0, 0, DateTimeKind.Utc), "seed-order-2026-0001", "VND", 3, 21000m, "PAID", new DateTime(2026, 4, 1, 9, 10, 0, 0, DateTimeKind.Utc) },
                    { 2, new DateTime(2026, 4, 2, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 4, 2, 10, 30, 0, 0, DateTimeKind.Utc), "seed-order-2026-0002", "VND", 3, 14900m, "PENDING", new DateTime(2026, 4, 2, 10, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 1,
                columns: new[] { "ChoPhepMua", "DonViTienTe", "GiaKhoaHoc" },
                values: new object[] { true, "VND", 12000m });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 2,
                columns: new[] { "ChoPhepMua", "DonViTienTe", "GiaKhoaHoc" },
                values: new object[] { true, "VND", 10000m });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 3,
                columns: new[] { "ChoPhepMua", "DonViTienTe", "GiaKhoaHoc" },
                values: new object[] { true, "VND", 13500m });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 4,
                columns: new[] { "ChoPhepMua", "DonViTienTe", "GiaKhoaHoc" },
                values: new object[] { true, "VND", 11000m });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 5,
                columns: new[] { "ChoPhepMua", "DonViTienTe", "GiaKhoaHoc" },
                values: new object[] { true, "VND", 14900m });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 6,
                columns: new[] { "ChoPhepMua", "DonViTienTe", "GiaKhoaHoc" },
                values: new object[] { true, "VND", 12500m });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 7,
                columns: new[] { "ChoPhepMua", "DonViTienTe", "GiaKhoaHoc" },
                values: new object[] { true, "VND", 10500m });

            migrationBuilder.UpdateData(
                table: "KhoaHocs",
                keyColumn: "MaKhoaHoc",
                keyValue: 8,
                columns: new[] { "ChoPhepMua", "DonViTienTe", "GiaKhoaHoc" },
                values: new object[] { true, "VND", 14000m });

            migrationBuilder.InsertData(
                table: "MaGiamGias",
                columns: new[] { "MaVoucher", "BatDauAt", "Code", "DonHangToiThieu", "GiaTriGiam", "GiamToiDa", "KetThucAt", "KichHoat", "LoaiGiamGia", "SoLuongDaDung", "SoLuongToiDa", "TenChuongTrinh" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), "WELCOME10", 10000m, 10m, 3000m, new DateTime(2026, 12, 30, 17, 0, 0, 0, DateTimeKind.Utc), true, "PERCENT", 1, 1000, "Giảm giá chào mừng" },
                    { 2, new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), "MARKET500", 10000m, 500m, null, new DateTime(2026, 12, 30, 17, 0, 0, 0, DateTimeKind.Utc), true, "FIXED", 0, 500, "Giảm thẳng marketplace" }
                });

            migrationBuilder.InsertData(
                table: "ChiTietDonHangs",
                columns: new[] { "MaChiTiet", "DonGia", "GiamGia", "MaDonHang", "MaKhoaHoc", "ThanhTien" },
                values: new object[,]
                {
                    { 1, 12000m, 500m, 1, 1, 11500m },
                    { 2, 10000m, 500m, 1, 2, 9500m },
                    { 3, 14900m, 0m, 2, 5, 14900m }
                });

            migrationBuilder.InsertData(
                table: "DoanhThuGiangViens",
                columns: new[] { "MaDoanhThu", "CreatedAt", "MaDonHang", "MaGiangVien", "PhiNenTang", "ThucNhanGiangVien", "TongTienDonHang", "TrangThaiDoiSoat" },
                values: new object[] { 1, new DateTime(2026, 4, 1, 9, 20, 0, 0, DateTimeKind.Utc), 1, 1, 4200m, 16800m, 21000m, "PENDING" });

            migrationBuilder.InsertData(
                table: "GiaoDichThanhToans",
                columns: new[] { "MaGiaoDich", "CongThanhToan", "CreatedAt", "MaDonHang", "MaThamChieuNgoai", "PaidAt", "RawWebhook", "SoTien", "TrangThai", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "PAYOS", new DateTime(2026, 4, 1, 9, 0, 0, 0, DateTimeKind.Utc), 1, "PAYOS-SEED-0001", new DateTime(2026, 4, 1, 9, 10, 0, 0, DateTimeKind.Utc), "{\"event\":\"payment.succeeded\",\"provider\":\"PAYOS\"}", 21000m, "SUCCESS", new DateTime(2026, 4, 1, 9, 10, 0, 0, DateTimeKind.Utc) },
                    { 2, "PAYOS", new DateTime(2026, 4, 2, 10, 0, 0, 0, DateTimeKind.Utc), 2, "PAYOS-SEED-0002", null, null, 14900m, "INITIATED", new DateTime(2026, 4, 2, 10, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.AddCheckConstraint(
                name: "CK_KhoaHocs_GiaKhoaHoc_Range",
                table: "KhoaHocs",
                sql: "\"GiaKhoaHoc\" >= 10000 AND \"GiaKhoaHoc\" <= 15000");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietDonHangs_MaDonHang",
                table: "ChiTietDonHangs",
                column: "MaDonHang");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietDonHangs_MaKhoaHoc",
                table: "ChiTietDonHangs",
                column: "MaKhoaHoc");

            migrationBuilder.CreateIndex(
                name: "IX_DoanhThuGiangViens_MaDonHang",
                table: "DoanhThuGiangViens",
                column: "MaDonHang");

            migrationBuilder.CreateIndex(
                name: "IX_DoanhThuGiangViens_MaGiangVien",
                table: "DoanhThuGiangViens",
                column: "MaGiangVien");

            migrationBuilder.CreateIndex(
                name: "IX_DonHangKhoaHocs_IdempotencyKey",
                table: "DonHangKhoaHocs",
                column: "IdempotencyKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DonHangKhoaHocs_MaNguoiDung",
                table: "DonHangKhoaHocs",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_GiaoDichThanhToans_MaDonHang",
                table: "GiaoDichThanhToans",
                column: "MaDonHang");

            migrationBuilder.CreateIndex(
                name: "IX_GiaoDichThanhToans_MaThamChieuNgoai",
                table: "GiaoDichThanhToans",
                column: "MaThamChieuNgoai",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MaGiamGias_Code",
                table: "MaGiamGias",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChiTietDonHangs");

            migrationBuilder.DropTable(
                name: "DoanhThuGiangViens");

            migrationBuilder.DropTable(
                name: "GiaoDichThanhToans");

            migrationBuilder.DropTable(
                name: "MaGiamGias");

            migrationBuilder.DropTable(
                name: "DonHangKhoaHocs");

            migrationBuilder.DropCheckConstraint(
                name: "CK_KhoaHocs_GiaKhoaHoc_Range",
                table: "KhoaHocs");

            migrationBuilder.DropColumn(
                name: "ChoPhepMua",
                table: "KhoaHocs");

            migrationBuilder.DropColumn(
                name: "DonViTienTe",
                table: "KhoaHocs");

            migrationBuilder.DropColumn(
                name: "GiaKhoaHoc",
                table: "KhoaHocs");
        }
    }
}
