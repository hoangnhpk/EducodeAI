using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace educodeai_server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                name: "ApiKeyAuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AdminId = table.Column<int>(type: "integer", nullable: false),
                    KeyApiId = table.Column<int>(type: "integer", nullable: false),
                    BeforeJson = table.Column<string>(type: "text", nullable: true),
                    AfterJson = table.Column<string>(type: "text", nullable: true),
                    MetadataJson = table.Column<string>(type: "text", nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiKeyAuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CauHinhs",
                columns: table => new
                {
                    MaKhoa = table.Column<string>(type: "varchar(100)", nullable: false),
                    GiaTri = table.Column<string>(type: "text", nullable: true),
                    MoTa = table.Column<string>(type: "varchar(255)", nullable: true),
                    NgayCapNhat = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CauHinhs", x => x.MaKhoa);
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
                name: "KeyAPIs",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    MaKeyMaHoa = table.Column<string>(type: "text", nullable: false),
                    LoaiKey = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TrangThai = table.Column<bool>(type: "boolean", nullable: false),
                    ThuTuUuTien = table.Column<int>(type: "integer", nullable: false),
                    HanMucRequest = table.Column<int>(type: "integer", nullable: false),
                    HanMucToken = table.Column<int>(type: "integer", nullable: false),
                    RPMLimit = table.Column<int>(type: "integer", nullable: false),
                    TPMLimit = table.Column<int>(type: "integer", nullable: false),
                    RPDLimit = table.Column<int>(type: "integer", nullable: false),
                    ModelSuDung = table.Column<string>(type: "text", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<int>(type: "integer", nullable: true),
                    LastUsageResetAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KeyAPIs", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "NguoiDungs",
                columns: table => new
                {
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TaiKhoan = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MatKhau = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    GoogleID = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    HoTen = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AnhDaiDien = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    VaiTro = table.Column<int>(type: "integer", nullable: false),
                    TrangThai = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    NgayThamGia = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LyDoKhoa = table.Column<string>(type: "text", nullable: true),
                    ThoiGianMoKhoa = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NgayDangNhapCuoi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MaOTP = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    ThoiGianHetHanOTP = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    MaNganHangNhanTien = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SoTaiKhoanNhanTien = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TenTaiKhoanNhanTien = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NguoiDungs", x => x.MaNguoiDung);
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

            migrationBuilder.CreateTable(
                name: "NhatKySuDungs",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ID_Key = table.Column<int>(type: "integer", nullable: false),
                    SoTokenTieuHao = table.Column<int>(type: "integer", nullable: false),
                    ThoiGianGoi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MaTrangThai = table.Column<int>(type: "integer", nullable: false),
                    DuongDanAPI = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NhatKySuDungs", x => x.ID);
                    table.ForeignKey(
                        name: "FK_NhatKySuDungs_KeyAPIs_ID_Key",
                        column: x => x.ID_Key,
                        principalTable: "KeyAPIs",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KhoaHocs",
                columns: table => new
                {
                    MaKhoaHoc = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaGiangVien = table.Column<int>(type: "integer", nullable: false),
                    TenKhoaHoc = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    MoTa = table.Column<string>(type: "text", nullable: true),
                    HinhAnh = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TrangThai = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DiemDanhGiaTB = table.Column<double>(type: "double precision", nullable: false),
                    LinhVuc = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TrinhDo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ThoiLuongGio = table.Column<int>(type: "integer", nullable: false),
                    KyNangChinh = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CoChungChi = table.Column<bool>(type: "boolean", nullable: false),
                    TenChungChi = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DiemDatChungChi = table.Column<double>(type: "double precision", nullable: false),
                    SoCauHoiChungChi = table.Column<int>(type: "integer", nullable: false),
                    ThoiGianLamBaiChungChi = table.Column<int>(type: "integer", nullable: false),
                    DuLieuDeChungChiJSON = table.Column<string>(type: "text", nullable: true),
                    NguonDeChungChi = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    NgayTaoDeChungChi = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    GiaKhoaHoc = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DonViTienTe = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    ChoPhepMua = table.Column<bool>(type: "boolean", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KhoaHocs", x => x.MaKhoaHoc);
                    table.CheckConstraint("CK_KhoaHocs_GiaKhoaHoc_Range", "\"GiaKhoaHoc\" >= 10000 AND \"GiaKhoaHoc\" <= 15000");
                    table.ForeignKey(
                        name: "FK_KhoaHocs_NguoiDungs_MaGiangVien",
                        column: x => x.MaGiangVien,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "LoTrinhAIs",
                columns: table => new
                {
                    MaLoTrinh = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    YeuCau = table.Column<string>(type: "text", nullable: false),
                    NoiDungJSON = table.Column<string>(type: "text", nullable: false),
                    TrangThai = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    NgayTao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoTrinhAIs", x => x.MaLoTrinh);
                    table.ForeignKey(
                        name: "FK_LoTrinhAIs_NguoiDungs_MaNguoiDung",
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
                    MaNguoiTao = table.Column<int>(type: "integer", nullable: false),
                    LoaiNguoiTao = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PhamViApDung = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ChoPhepApDungChoQuaTang = table.Column<bool>(type: "boolean", nullable: false),
                    SoLuongToiDa = table.Column<int>(type: "integer", nullable: false),
                    SoLuongDaDung = table.Column<int>(type: "integer", nullable: false),
                    KichHoat = table.Column<bool>(type: "boolean", nullable: false),
                    BatDauAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    KetThucAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaGiamGias", x => x.MaVoucher);
                    table.ForeignKey(
                        name: "FK_MaGiamGias_NguoiDungs_MaNguoiTao",
                        column: x => x.MaNguoiTao,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "PhienDangNhap",
                columns: table => new
                {
                    MaPhien = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    MaThietBi = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    TenThietBi = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    DiaChiIP = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ThoiGianDangNhap = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ThoiGianHoatDongCuoi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DangHoatDong = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhienDangNhap", x => x.MaPhien);
                    table.ForeignKey(
                        name: "FK_PhienDangNhap_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Cascade);
                });

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
                    GuiEmailRutTienThanhCongLuc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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

            migrationBuilder.CreateTable(
                name: "ChuongHocs",
                columns: table => new
                {
                    MaChuong = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaKhoaHoc = table.Column<int>(type: "integer", nullable: false),
                    TenChuong = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ThuTu = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChuongHocs", x => x.MaChuong);
                    table.ForeignKey(
                        name: "FK_ChuongHocs_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                });

            migrationBuilder.CreateTable(
                name: "DangKyKhoaHocs",
                columns: table => new
                {
                    MaDangKy = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    MaKhoaHoc = table.Column<int>(type: "integer", nullable: false),
                    NgayDangKy = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TrangThai = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TienDo = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DangKyKhoaHocs", x => x.MaDangKy);
                    table.ForeignKey(
                        name: "FK_DangKyKhoaHocs_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                    table.ForeignKey(
                        name: "FK_DangKyKhoaHocs_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "DanhGias",
                columns: table => new
                {
                    MaDanhGia = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    MaKhoaHoc = table.Column<int>(type: "integer", nullable: false),
                    SoSao = table.Column<int>(type: "integer", nullable: false),
                    NhanXet = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    NgayDanhGia = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TrangThai = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DanhGias", x => x.MaDanhGia);
                    table.ForeignKey(
                        name: "FK_DanhGias_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                    table.ForeignKey(
                        name: "FK_DanhGias_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "KetQuaKiemTraChungChis",
                columns: table => new
                {
                    MaKetQuaKiemTraChungChi = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaKhoaHoc = table.Column<int>(type: "integer", nullable: false),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    DiemSo = table.Column<double>(type: "double precision", nullable: false),
                    SoCauDung = table.Column<int>(type: "integer", nullable: false),
                    TongSoCau = table.Column<int>(type: "integer", nullable: false),
                    DaDat = table.Column<bool>(type: "boolean", nullable: false),
                    ChiTietLamBaiJSON = table.Column<string>(type: "text", nullable: false),
                    NgayThi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KetQuaKiemTraChungChis", x => x.MaKetQuaKiemTraChungChi);
                    table.ForeignKey(
                        name: "FK_KetQuaKiemTraChungChis_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                    table.ForeignKey(
                        name: "FK_KetQuaKiemTraChungChis_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "QuaTangKhoaHocs",
                columns: table => new
                {
                    MaQuaTang = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaKhoaHoc = table.Column<int>(type: "integer", nullable: false),
                    MaNguoiNhan = table.Column<int>(type: "integer", nullable: false),
                    MaNguoiTang = table.Column<int>(type: "integer", nullable: false),
                    LoaiNguoiTang = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TrangThai = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    LoiNhan = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuaTangKhoaHocs", x => x.MaQuaTang);
                    table.ForeignKey(
                        name: "FK_QuaTangKhoaHocs_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                    table.ForeignKey(
                        name: "FK_QuaTangKhoaHocs_NguoiDungs_MaNguoiNhan",
                        column: x => x.MaNguoiNhan,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                    table.ForeignKey(
                        name: "FK_QuaTangKhoaHocs_NguoiDungs_MaNguoiTang",
                        column: x => x.MaNguoiTang,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "DonHangKhoaHocs",
                columns: table => new
                {
                    MaDonHang = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    TongTien = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    TongTienGoc = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    SoTienGiam = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    LoaiTien = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    TrangThaiDonHang = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    LoaiDonHang = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    IdempotencyKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    MaVoucher = table.Column<int>(type: "integer", nullable: true),
                    CodeVoucher = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DonHangKhoaHocs", x => x.MaDonHang);
                    table.ForeignKey(
                        name: "FK_DonHangKhoaHocs_MaGiamGias_MaVoucher",
                        column: x => x.MaVoucher,
                        principalTable: "MaGiamGias",
                        principalColumn: "MaVoucher",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_DonHangKhoaHocs_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "MaGiamGiaKhoaHocs",
                columns: table => new
                {
                    MaLienKet = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
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

            migrationBuilder.CreateTable(
                name: "HoTroRutTienGiangViens",
                columns: table => new
                {
                    MaHoTroRutTienGiangVien = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaYeuCauRutTien = table.Column<int>(type: "integer", nullable: false),
                    MaGiangVien = table.Column<int>(type: "integer", nullable: false),
                    TrangThaiHoTro = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ThongTinLienLac = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    NoiDungGiangVien = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    GhiChuAdmin = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    MaQuanTriVienXuLy = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    XuLyLuc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HoTroRutTienGiangViens", x => x.MaHoTroRutTienGiangVien);
                    table.ForeignKey(
                        name: "FK_HoTroRutTienGiangViens_NguoiDungs_MaGiangVien",
                        column: x => x.MaGiangVien,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                    table.ForeignKey(
                        name: "FK_HoTroRutTienGiangViens_NguoiDungs_MaQuanTriVienXuLy",
                        column: x => x.MaQuanTriVienXuLy,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                    table.ForeignKey(
                        name: "FK_HoTroRutTienGiangViens_YeuCauRutTienGiangViens_MaYeuCauRutT~",
                        column: x => x.MaYeuCauRutTien,
                        principalTable: "YeuCauRutTienGiangViens",
                        principalColumn: "MaYeuCauRutTien",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BaiHocs",
                columns: table => new
                {
                    MaBaiHoc = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaChuong = table.Column<int>(type: "integer", nullable: false),
                    TieuDe = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    LoaiBaiHoc = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    NoiDung = table.Column<string>(type: "text", nullable: true),
                    ThoiLuong = table.Column<int>(type: "integer", nullable: true),
                    LinkVideo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ThuTu = table.Column<int>(type: "integer", nullable: false),
                    CoQuiz = table.Column<bool>(type: "boolean", nullable: false),
                    VideoPublicId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    VideoSource = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "youtube"),
                    VideoStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    VideoDurationS = table.Column<int>(type: "integer", nullable: true),
                    VideoSizeMb = table.Column<int>(type: "integer", nullable: true),
                    HasSubtitle = table.Column<bool>(type: "boolean", nullable: false),
                    SubtitleUrl = table.Column<string>(type: "text", nullable: true),
                    SubtitleSource = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    AiFeaturesEnabled = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaiHocs", x => x.MaBaiHoc);
                    table.ForeignKey(
                        name: "FK_BaiHocs_ChuongHocs_MaChuong",
                        column: x => x.MaChuong,
                        principalTable: "ChuongHocs",
                        principalColumn: "MaChuong");
                });

            migrationBuilder.CreateTable(
                name: "ChungChiKhoaHocs",
                columns: table => new
                {
                    MaChungChiKhoaHoc = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaChungChi = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MaKhoaHoc = table.Column<int>(type: "integer", nullable: false),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    MaKetQuaKiemTraChungChi = table.Column<int>(type: "integer", nullable: true),
                    HoTenHienThi = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    EmailNhan = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DaGuiEmail = table.Column<bool>(type: "boolean", nullable: false),
                    NgayGuiEmail = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NgayCap = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChungChiKhoaHocs", x => x.MaChungChiKhoaHoc);
                    table.ForeignKey(
                        name: "FK_ChungChiKhoaHocs_KetQuaKiemTraChungChis_MaKetQuaKiemTraChun~",
                        column: x => x.MaKetQuaKiemTraChungChi,
                        principalTable: "KetQuaKiemTraChungChis",
                        principalColumn: "MaKetQuaKiemTraChungChi");
                    table.ForeignKey(
                        name: "FK_ChungChiKhoaHocs_KhoaHocs_MaKhoaHoc",
                        column: x => x.MaKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "MaKhoaHoc");
                    table.ForeignKey(
                        name: "FK_ChungChiKhoaHocs_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
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

            migrationBuilder.CreateTable(
                name: "BaiTaps",
                columns: table => new
                {
                    MaBaiTap = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaBaiHoc = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaiTaps", x => x.MaBaiTap);
                    table.ForeignKey(
                        name: "FK_BaiTaps_BaiHocs_MaBaiHoc",
                        column: x => x.MaBaiHoc,
                        principalTable: "BaiHocs",
                        principalColumn: "MaBaiHoc");
                });

            migrationBuilder.CreateTable(
                name: "BinhLuans",
                columns: table => new
                {
                    MaBinhLuan = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    MaBaiHoc = table.Column<int>(type: "integer", nullable: false),
                    NoiDung = table.Column<string>(type: "text", nullable: false),
                    MaBinhLuanCha = table.Column<int>(type: "integer", nullable: true),
                    NgayTao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BinhLuans", x => x.MaBinhLuan);
                    table.ForeignKey(
                        name: "FK_BinhLuans_BaiHocs_MaBaiHoc",
                        column: x => x.MaBaiHoc,
                        principalTable: "BaiHocs",
                        principalColumn: "MaBaiHoc");
                    table.ForeignKey(
                        name: "FK_BinhLuans_BinhLuans_MaBinhLuanCha",
                        column: x => x.MaBinhLuanCha,
                        principalTable: "BinhLuans",
                        principalColumn: "MaBinhLuan");
                    table.ForeignKey(
                        name: "FK_BinhLuans_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "GhiChuAIs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    MaBaiHoc = table.Column<int>(type: "integer", nullable: false),
                    NoiDung = table.Column<string>(type: "text", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NgayCapNhat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GhiChuAIs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GhiChuAIs_BaiHocs_MaBaiHoc",
                        column: x => x.MaBaiHoc,
                        principalTable: "BaiHocs",
                        principalColumn: "MaBaiHoc",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GhiChuAIs_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GhiChuBaiHocs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    MaBaiHoc = table.Column<int>(type: "integer", nullable: false),
                    ThoiGianVideo = table.Column<int>(type: "integer", nullable: false),
                    NoiDung = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    NgayTao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GhiChuBaiHocs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GhiChuBaiHocs_BaiHocs_MaBaiHoc",
                        column: x => x.MaBaiHoc,
                        principalTable: "BaiHocs",
                        principalColumn: "MaBaiHoc");
                    table.ForeignKey(
                        name: "FK_GhiChuBaiHocs_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

            migrationBuilder.CreateTable(
                name: "TienDoBaiHocs",
                columns: table => new
                {
                    MaTienDo = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    MaBaiHoc = table.Column<int>(type: "integer", nullable: false),
                    DaXem = table.Column<bool>(type: "boolean", nullable: false),
                    ThoiGianHoc = table.Column<int>(type: "integer", nullable: false),
                    NgayCapNhat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TienDoBaiHocs", x => x.MaTienDo);
                    table.ForeignKey(
                        name: "FK_TienDoBaiHocs_BaiHocs_MaBaiHoc",
                        column: x => x.MaBaiHoc,
                        principalTable: "BaiHocs",
                        principalColumn: "MaBaiHoc");
                    table.ForeignKey(
                        name: "FK_TienDoBaiHocs_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
                });

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
                name: "BaiTap_Quizs",
                columns: table => new
                {
                    MaBaiTapQuiz = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaBaiTap = table.Column<int>(type: "integer", nullable: false),
                    ThoiGianLamBai = table.Column<int>(type: "integer", nullable: true),
                    DiemCanDat = table.Column<double>(type: "double precision", nullable: false),
                    ChoPhepLamLai = table.Column<bool>(type: "boolean", nullable: false),
                    DaoCauHoi = table.Column<bool>(type: "boolean", nullable: false),
                    DuLieuCauHoi = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaiTap_Quizs", x => x.MaBaiTapQuiz);
                    table.ForeignKey(
                        name: "FK_BaiTap_Quizs_BaiTaps_MaBaiTap",
                        column: x => x.MaBaiTap,
                        principalTable: "BaiTaps",
                        principalColumn: "MaBaiTap");
                });

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
                name: "KetQuaLamBais",
                columns: table => new
                {
                    MaKetQuaBaiNop = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MaNguoiDung = table.Column<int>(type: "integer", nullable: false),
                    MaBaiTap = table.Column<int>(type: "integer", nullable: false),
                    NoiDungNopJSON = table.Column<string>(type: "text", nullable: false),
                    DiemSo = table.Column<float>(type: "real", nullable: false),
                    TrangThai = table.Column<bool>(type: "boolean", nullable: false),
                    NgayNop = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KetQuaLamBais", x => x.MaKetQuaBaiNop);
                    table.ForeignKey(
                        name: "FK_KetQuaLamBais_BaiTaps_MaBaiTap",
                        column: x => x.MaBaiTap,
                        principalTable: "BaiTaps",
                        principalColumn: "MaBaiTap");
                    table.ForeignKey(
                        name: "FK_KetQuaLamBais_NguoiDungs_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "NguoiDungs",
                        principalColumn: "MaNguoiDung");
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

            migrationBuilder.InsertData(
                table: "NguoiDungs",
                columns: new[] { "MaNguoiDung", "AnhDaiDien", "Email", "GoogleID", "HoTen", "LyDoKhoa", "MaNganHangNhanTien", "MaOTP", "MatKhau", "NgayDangNhapCuoi", "NgayThamGia", "SoTaiKhoanNhanTien", "TaiKhoan", "TenTaiKhoanNhanTien", "ThoiGianHetHanOTP", "ThoiGianMoKhoa", "TrangThai", "VaiTro" },
                values: new object[,]
                {
                    { 1, "giangvien-avatar.jpg", "giangvien@educodeai.com", "google_giangvien_123", "Trần Thị Giảng Viên", null, null, null, "$2a$11$XcTfQrJ7G8hQ9vZkLmNOPuS5d6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4", null, new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), null, "giangvien", null, null, null, "Hoạt động", 1 },
                    { 2, "admin-avatar.jpg", "nguyenhung22032006@gmail.com", null, "Nguyễn Quốc Hùng", null, null, null, "$2a$11$XcTfQrJ7G8hQ9vZkLmNOPuS5d6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4", null, new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), null, "admin", null, null, null, "Hoạt động", 0 },
                    { 3, "hocvien-avatar.jpg", "hocvien@gmail.com", "google_hocvien_456", "Lê Văn Học Viên", null, null, null, "$2a$11$XcTfQrJ7G8hQ9vZkLmNOPuS5d6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4", null, new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), null, "hocvien", null, null, null, "Hoạt động", 2 }
                });

            migrationBuilder.InsertData(
                table: "DonHangKhoaHocs",
                columns: new[] { "MaDonHang", "CodeVoucher", "CreatedAt", "ExpiredAt", "IdempotencyKey", "LoaiDonHang", "LoaiTien", "MaNguoiDung", "MaVoucher", "SoTienGiam", "TongTien", "TongTienGoc", "TrangThaiDonHang", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2026, 4, 1, 9, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 4, 1, 9, 30, 0, 0, DateTimeKind.Utc), "seed-order-2026-0001", "COURSE_PURCHASE", "VND", 3, null, 0m, 21000m, 0m, "PAID", new DateTime(2026, 4, 1, 9, 10, 0, 0, DateTimeKind.Utc) },
                    { 2, null, new DateTime(2026, 4, 2, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 4, 2, 10, 30, 0, 0, DateTimeKind.Utc), "seed-order-2026-0002", "COURSE_PURCHASE", "VND", 3, null, 0m, 14900m, 0m, "PENDING", new DateTime(2026, 4, 2, 10, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.InsertData(
                table: "KhoaHocs",
                columns: new[] { "MaKhoaHoc", "ChoPhepMua", "CoChungChi", "DeletedAt", "DeletedBy", "DiemDanhGiaTB", "DiemDatChungChi", "DonViTienTe", "DuLieuDeChungChiJSON", "GiaKhoaHoc", "HinhAnh", "KyNangChinh", "LinhVuc", "MaGiangVien", "MoTa", "NgayTao", "NgayTaoDeChungChi", "NguonDeChungChi", "SoCauHoiChungChi", "TenChungChi", "TenKhoaHoc", "ThoiGianLamBaiChungChi", "ThoiLuongGio", "TrangThai", "TrinhDo" },
                values: new object[,]
                {
                    { 1, true, false, null, null, 4.7000000000000002, 80.0, "VND", null, 12000m, "cpp-course.jpg", "C++, OOP, Con trỏ, Cấu trúc dữ liệu", "Lập trình hệ thống", 1, "Khóa học toàn diện về lập trình C++, từ cú pháp cơ bản đến các kỹ thuật lập trình nâng cao như con trỏ, OOP, xử lý file", new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), null, null, 20, null, "Lập trình C++ cơ bản, nâng cao", 30, 35, "Hoạt động", "Người mới" },
                    { 2, true, false, null, null, 4.9000000000000004, 80.0, "VND", null, 10000m, "it-foundation.jpg", "IT Foundation, Client-Server, Domain, Career Guidance", "Công nghệ thông tin", 1, "Khóa học cung cấp kiến thức nền tảng về công nghệ thông tin, mô hình client-server, domain, và định hướng nghề nghiệp cho người mới bắt đầu", new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), null, null, 20, null, "Kiến Thức Nhập Môn IT", 30, 8, "Hoạt động", "Người mới" },
                    { 3, true, false, null, null, 4.7999999999999998, 80.0, "VND", null, 13500m, "js-advanced.jpg", "JavaScript, Closure, This, Bind, Call, Apply, Redux", "Web Development", 1, "Khóa học nâng cao về JavaScript, tập trung vào các khái niệm quan trọng như IIFE, Scope, Closure, Hoisting, This, Bind, Call, Apply và thực hành với Redux", new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), null, null, 20, null, "Lập Trình Javascript nâng cao", 30, 15, "Hoạt động", "Trung cấp" },
                    { 4, true, false, null, null, 4.5999999999999996, 80.0, "VND", null, 11000m, "js-basic.jpg", "JavaScript, Functions, Arrays, DOM, Form Validation", "Web Development", 1, "Khóa học JavaScript cơ bản dành cho người mới bắt đầu, từ biến, toán tử, hàm, mảng đến thực hành form validation", new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), null, null, 20, null, "Lập Trình JavaScript Cơ Bản", 30, 20, "Hoạt động", "Người mới" },
                    { 5, true, false, null, null, 4.9000000000000004, 80.0, "VND", null, 14900m, "dont-touch-face.jpg", "React, TensorFlow.js, Machine Learning, Computer Vision", "AI & Machine Learning", 1, "Khóa học thực hành xây dựng ứng dụng AI phát hiện hành vi chạm tay lên mặt sử dụng React, TensorFlow.js và machine learning", new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), null, null, 20, null, "App 'Đừng Chạm Tay Lên Mặt' - Xây dựng ứng dụng AI với React và TensorFlow", 30, 12, "Hoạt động", "Trung cấp" },
                    { 6, true, false, null, null, 4.7000000000000002, 80.0, "VND", null, 12500m, "node-express.jpg", "Node.js, ExpressJS, MongoDB, REST API, MVC Pattern", "Backend Development", 1, "Khóa học toàn diện về Node.js và ExpressJS, từ cơ bản đến nâng cao, xây dựng RESTful API, MVC pattern, kết nối MongoDB và triển khai ứng dụng web hoàn chỉnh", new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), null, null, 20, null, "Node & ExpressJS - Xây dựng Backend chuyên nghiệp", 30, 25, "Hoạt động", "Người mới" },
                    { 7, true, false, null, null, 4.7999999999999998, 80.0, "VND", null, 10500m, "responsive-grid.jpg", "CSS Grid, Responsive Design, Media Queries, Flexbox, Viewport", "Web Design & UI/UX", 1, "Khóa học chuyên sâu về responsive web design, Grid System, media queries, viewport và kỹ thuật thiết kế website tương thích trên mọi thiết bị", new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), null, null, 20, null, "Responsive Với Grid System - Thiết kế website đa thiết bị", 30, 10, "Hoạt động", "Người mới" },
                    { 8, true, false, null, null, 4.9000000000000004, 80.0, "VND", null, 14000m, "terminal-ubuntu.jpg", "Linux, Ubuntu, WSL, Terminal Commands, Server Deployment, Nginx", "System Administration & DevOps", 1, "Khóa học toàn diện về làm việc với Terminal, WSL, Ubuntu, các lệnh Linux cơ bản đến nâng cao, cài đặt môi trường phát triển và deploy ứng dụng web lên server thật", new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), null, null, 20, null, "Làm việc với Terminal & Ubuntu - Lập trình chuyên nghiệp với Linux", 30, 18, "Hoạt động", "Người mới" }
                });

            migrationBuilder.InsertData(
                table: "MaGiamGias",
                columns: new[] { "MaVoucher", "BatDauAt", "ChoPhepApDungChoQuaTang", "Code", "DonHangToiThieu", "GiaTriGiam", "GiamToiDa", "KetThucAt", "KichHoat", "LoaiGiamGia", "LoaiNguoiTao", "MaNguoiTao", "PhamViApDung", "SoLuongDaDung", "SoLuongToiDa", "TenChuongTrinh" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), true, "WELCOME10", 10000m, 10m, 3000m, new DateTime(2026, 12, 30, 17, 0, 0, 0, DateTimeKind.Utc), true, "PERCENT", "ADMIN", 2, "SPECIFIC_COURSES", 1, 1000, "Giảm giá chào mừng" },
                    { 2, new DateTime(2025, 12, 31, 17, 0, 0, 0, DateTimeKind.Utc), true, "MARKET500", 10000m, 500m, null, new DateTime(2026, 12, 30, 17, 0, 0, 0, DateTimeKind.Utc), true, "FIXED", "ADMIN", 2, "SPECIFIC_COURSES", 0, 500, "Giảm thẳng marketplace" }
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
                table: "ChuongHocs",
                columns: new[] { "MaChuong", "MaKhoaHoc", "TenChuong", "ThuTu" },
                values: new object[,]
                {
                    { 1, 1, "Giới thiệu", 1 },
                    { 2, 1, "Biến và kiểu dữ liệu", 2 },
                    { 3, 1, "Cấu trúc điều khiển và vòng lặp", 3 },
                    { 4, 1, "Mảng", 4 },
                    { 5, 1, "String", 5 },
                    { 6, 1, "Hàm", 6 },
                    { 7, 1, "Con trỏ", 7 },
                    { 8, 1, "Struct", 8 },
                    { 9, 1, "Làm việc với file", 9 },
                    { 10, 1, "Hướng đối tượng (OOP)", 10 },
                    { 11, 2, "Khái niệm kỹ thuật cần biết", 1 },
                    { 12, 2, "Môi trường, con người IT", 2 },
                    { 13, 2, "Phương pháp, định hướng", 3 },
                    { 14, 3, "IIFE, Scope, Closure", 1 },
                    { 15, 3, "Hoisting, Strict Mode, Data Types", 2 },
                    { 16, 3, "This, Bind, Call, Apply", 3 },
                    { 17, 3, "Các bài thực hành", 4 },
                    { 18, 4, "Giới thiệu", 1 },
                    { 19, 4, "Biến, Comments, built-in", 2 },
                    { 20, 4, "Toán tử, kiểu dữ liệu", 3 },
                    { 21, 4, "Làm việc với hàm", 4 },
                    { 22, 4, "Làm việc với mảng", 5 },
                    { 23, 4, "Form validation", 6 },
                    { 24, 5, "Giới thiệu", 1 },
                    { 25, 5, "Xây dựng", 2 },
                    { 26, 5, "Train function", 3 },
                    { 27, 6, "Bắt đầu", 1 },
                    { 28, 6, "Kiến thức cốt lõi", 2 },
                    { 29, 6, "Xây dựng website", 3 },
                    { 30, 7, "Bắt đầu", 1 },
                    { 31, 7, "Viewport, @media, breakpoint", 2 },
                    { 32, 7, "Thực hành nhỏ", 3 },
                    { 33, 7, "Grid system", 4 },
                    { 34, 8, "Giới thiệu", 1 },
                    { 35, 8, "Window Terminal & WSL", 2 },
                    { 36, 8, "Các lệnh Linux cơ bản", 3 },
                    { 37, 8, "Chạy dự án React, Node, Laravel", 4 },
                    { 38, 8, "Deploy dự án với server thật", 5 }
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

            migrationBuilder.InsertData(
                table: "BaiHocs",
                columns: new[] { "MaBaiHoc", "AiFeaturesEnabled", "CoQuiz", "HasSubtitle", "LinkVideo", "LoaiBaiHoc", "MaChuong", "NoiDung", "SubtitleSource", "SubtitleUrl", "ThoiLuong", "ThuTu", "TieuDe", "VideoDurationS", "VideoPublicId", "VideoSizeMb", "VideoSource", "VideoStatus" },
                values: new object[,]
                {
                    { 1, true, true, false, "https://www.youtube.com/embed/Da1tpV9TMU0?si=DZQWIaQdB5haoEIy", "Video", 1, "<p>Khóa học Lập trình C++ toàn diện từ cơ bản đến nâng cao</p>", null, null, 600, 1, "Giới thiệu khóa học", null, null, null, "youtube", null },
                    { 2, true, true, false, "https://www.youtube.com/embed/9_uoKY0AwqE?si=Zdl_y8quu8_H8eC7", "Video", 1, "<p>Hướng dẫn cài đặt môi trường Dev-C++ để lập trình C++</p>", null, null, 900, 2, "Cài đặt Dev-C++", null, null, null, "youtube", null },
                    { 3, true, true, false, "https://www.youtube.com/embed/vFhKEYRBmVY?si=QWnbQ2d8wljLojBr", "Video", 1, "<p>Hướng dẫn chi tiết cách sử dụng Dev-C++ cho người mới bắt đầu</p>", null, null, 1200, 3, "Hướng dẫn sử dụng Dev-C++", null, null, null, "youtube", null },
                    { 4, true, true, false, "https://www.youtube.com/embed/Z5O6pxQm6II?si=9dAM9MTkz7h34Uqh", "Video", 2, "<p>Học về biến, cách khai báo và nhập xuất dữ liệu trong C++</p>", null, null, 1800, 1, "Biến và nhập xuất dữ liệu", null, null, null, "youtube", null },
                    { 5, true, true, false, "https://www.youtube.com/embed/qpIautEyv2s?si=9ZjnVDDARUaHjH3j", "Video", 2, "<p>Các kiểu dữ liệu cơ bản trong C++: int, float, double, char, bool</p>", null, null, 1500, 2, "Kiểu dữ liệu thường gặp", null, null, null, "youtube", null },
                    { 6, true, true, false, "https://www.youtube.com/embed/79mzaFPLEz8?si=pF0GCz_JwF_cyTnL", "Video", 2, "<p>Phân biệt và sử dụng biến cục bộ và biến toàn cục</p>", null, null, 1200, 3, "Biến cục bộ và biến toàn cục", null, null, null, "youtube", null },
                    { 7, true, true, false, "https://www.youtube.com/embed/MTbZLshZg0U?si=4-nsRX2u-cFLI2Kg", "Video", 2, "<p>Hướng dẫn ép kiểu dữ liệu và sử dụng bảng mã ASCII</p>", null, null, 1500, 4, "Ép kiểu dữ liệu và bảng mã ASCII trong C++", null, null, null, "youtube", null },
                    { 8, true, true, false, "https://www.youtube.com/embed/1ppDCzoB03k?si=2VLBI7_Q43CtcijA", "Video", 3, "<p>Cấu trúc điều kiện if, else if, else trong C++</p>", null, null, 1800, 1, "Cấu trúc if else", null, null, null, "youtube", null },
                    { 9, true, true, false, "https://www.youtube.com/embed/W3k6lrN0qG4?si=ZAqIKkrzKXmb0Ex5", "Video", 3, "<p>Cấu trúc rẽ nhành switch case trong C++</p>", null, null, 1500, 2, "Cấu trúc switch case", null, null, null, "youtube", null },
                    { 10, true, true, false, "https://www.youtube.com/embed/7uHfTAj3Vao?si=AdEMERWT9I7Rp7bp", "Video", 3, "<p>Các loại vòng lặp: for, while, do-while trong C++</p>", null, null, 2400, 3, "Vòng lặp trong C++", null, null, null, "youtube", null },
                    { 11, true, true, false, "https://www.youtube.com/embed/YKeKmpcMcQY?si=eqBwPvJWKayWWPgI", "Video", 3, "<p>Sử dụng toán tử 3 ngôi (ternary operator) trong C++</p>", null, null, 900, 4, "Toán tử 3 ngôi trong C++", null, null, null, "youtube", null },
                    { 12, true, true, false, "https://www.youtube.com/embed/Oe27IJSOUUM?si=KWUdCh-o9PWAYKYL", "VanBan", 3, "<p>Bài tập thực hành về vòng lặp trong C++</p>", null, null, 1800, 5, "Bài tập về vòng lặp trong C++", null, null, null, "youtube", null },
                    { 13, true, true, false, "https://www.youtube.com/embed/r2FMycOy_2Y?si=NHI3xlLdZch1tV4P", "Video", 3, "<p>Các câu lệnh điều khiển vòng lặp: break, continue, goto</p>", null, null, 1200, 6, "Câu lệnh break, continue, goto", null, null, null, "youtube", null },
                    { 14, true, true, false, "https://www.youtube.com/embed/89W1oyXfqgo?si=c6LV4UohjZpp5t4l", "Video", 4, "<p>Khái niệm và cách sử dụng mảng một chiều trong C++</p>", null, null, 2100, 1, "Mảng một chiều", null, null, null, "youtube", null },
                    { 15, true, true, false, "https://www.youtube.com/embed/xGpB07JzrQ8?si=shAT_gnDvzcx-uwZ", "Video", 4, "<p>Khái niệm và cách sử dụng mảng 2 chiều (ma trận) trong C++</p>", null, null, 2400, 2, "Mảng 2 chiều", null, null, null, "youtube", null },
                    { 16, true, true, false, "https://www.youtube.com/embed/bt4m6VlYQO4?si=rwn3oCMr67ehu9wC", "Video", 4, "<p>Giới thiệu và cài đặt thuật toán sắp xếp bubble sort</p>", null, null, 1800, 3, "Thuật toán sắp xếp bubble sort", null, null, null, "youtube", null },
                    { 17, true, true, false, "https://www.youtube.com/embed/Q06peb_sH6k?si=dU3_XU_U2oNwRv50", "Video", 5, "<p>Làm việc với chuỗi (string) trong C++</p>", null, null, 2100, 1, "String C++", null, null, null, "youtube", null },
                    { 18, true, true, false, "https://www.youtube.com/embed/duJoNkUE-MA?si=GZssMFpMndfnanPD", "Video", 5, "<p>Các phương thức xử lý chuỗi thường dùng trong C++</p>", null, null, 2400, 2, "Các phương thức làm việc với String trong C++", null, null, null, "youtube", null },
                    { 19, true, true, false, "https://www.youtube.com/embed/ay8PEiiP5tU?si=8OCanlJOMHEIM8lW", "Video", 6, "<p>Khái niệm về hàm và lợi ích của việc sử dụng hàm</p>", null, null, 1800, 1, "Hàm là gì?", null, null, null, "youtube", null },
                    { 20, true, true, false, "https://www.youtube.com/embed/ATAoEb-ZXKI?si=XRjVv3m-wX8H60gk", "Video", 6, "<p>Phân biệt tham số và đối số trong hàm C++</p>", null, null, 1500, 2, "Tham số và đối số trong C++", null, null, null, "youtube", null },
                    { 21, true, true, false, "https://www.youtube.com/embed/NU0joSR66Ag?si=NUrZRiROo23txowt", "Video", 6, "<p>Cách sử dụng đối số mặc định trong hàm C++</p>", null, null, 1200, 3, "Đối số mặc định trong hàm", null, null, null, "youtube", null },
                    { 22, true, true, false, "https://www.youtube.com/embed/OQfEPrsWYlY?si=yZwSGw-hbMB-fzC2", "Video", 6, "<p>Phân biệt truyền tham trị và tham chiếu trong C++</p>", null, null, 2100, 4, "Tham trị và tham chiếu trong C++", null, null, null, "youtube", null },
                    { 23, true, true, false, "https://www.youtube.com/embed/uBfsM5RJWSI?si=kR-e9npBkrRgpdqp", "Video", 7, "<p>Khái niệm con trỏ và cách sử dụng con trỏ trong C++</p>", null, null, 2700, 1, "Con trỏ trong C++", null, null, null, "youtube", null },
                    { 24, true, true, false, "https://www.youtube.com/embed/OIU55ogb26M?si=m6eBIwKQ3wXiGVEw", "Video", 7, "<p>Cấp phát và giải phóng bộ nhớ động trong C++</p>", null, null, 1800, 2, "Cấp phát động", null, null, null, "youtube", null },
                    { 25, true, true, false, "https://www.youtube.com/embed/anbncsNUSSk?si=2Y0Ing7hqcLwmqte", "Video", 7, "<p>Cấp phát động cho mảng trong C++</p>", null, null, 1500, 3, "Cấp phát mảng động", null, null, null, "youtube", null },
                    { 26, true, true, false, "https://www.youtube.com/embed/ZbVO_4jH60k?si=148T-Elsog_pCFbe", "Video", 8, "<p>Khái niệm về struct (cấu trúc) trong C++</p>", null, null, 1800, 1, "Struct là gì?", null, null, null, "youtube", null },
                    { 27, true, true, false, "https://www.youtube.com/embed/T39JnItSmJU?si=RKXNgsgM9Ml8lvig", "Video", 8, "<p>Kết hợp con trỏ và struct trong C++</p>", null, null, 1500, 2, "Con trỏ và struct trong C++", null, null, null, "youtube", null },
                    { 28, true, true, false, "https://www.youtube.com/embed/tNlCid6mQ3E?si=mf4tD034MUK6pyE3", "Video", 8, "<p>Kỹ thuật nạp chồng toán tử (operator overloading) trong C++</p>", null, null, 2400, 3, "Nạp chồng toán tử trong C++", null, null, null, "youtube", null },
                    { 29, true, true, false, "https://www.youtube.com/embed/LekUWlASyMY?si=R2n6_pvdZZcSBYLg", "Video", 9, "<p>Đọc và ghi file text trong C++</p>", null, null, 2100, 1, "Làm việc với file text trong C++", null, null, null, "youtube", null },
                    { 30, true, true, false, "https://www.youtube.com/embed/_wdQU8GrJcY?si=0VjONumO-H39XFR5", "Video", 9, "<p>Các chế độ mở file và xử lý file trong C++</p>", null, null, 1800, 2, "Các chế độ làm việc với file trong C++", null, null, null, "youtube", null },
                    { 31, true, true, false, "https://www.youtube.com/embed/jwvmfp3Kp8U?si=dgOSFcQnsYOv7eD1", "Video", 10, "<p>Khái niệm class và object trong lập trình hướng đối tượng</p>", null, null, 2400, 1, "Class & object", null, null, null, "youtube", null },
                    { 32, true, true, false, "https://www.youtube.com/embed/ab2TALCZruo?si=9RfAUdhirOwyzFEV", "Video", 10, "<p>Nguyên lý đóng gói (encapsulation) trong lập trình hướng đối tượng</p>", null, null, 1800, 2, "Tính đóng gói trong C++", null, null, null, "youtube", null },
                    { 33, true, true, false, "https://www.youtube.com/embed/zoELAirXMJY?si=ilbFjG9jF8MHnoen", "Video", 11, "<p>Giới thiệu về mô hình Client-Server, cách thức hoạt động và ứng dụng trong thực tế</p>", null, null, 900, 1, "Mô hình Client - Server là gì?", null, null, null, "youtube", null },
                    { 34, true, true, false, "https://www.youtube.com/embed/M62l1xA5Eu8?si=rv1NF3Pcsk4PfNw3", "Video", 11, "<p>Tìm hiểu về domain, cách đăng ký domain và tầm quan trọng của domain trong công nghệ thông tin</p>", null, null, 720, 2, "Domain là gì?", null, null, null, "youtube", null },
                    { 35, true, true, false, "https://www.youtube.com/embed/CyZ_O7v62h4?si=yXL1NUelDTjI1581", "Video", 12, "<p>Những tố chất cần có để thành công trong ngành IT và các kỹ năng cần rèn luyện</p>", null, null, 1200, 1, "Làm IT cần tố chất gì? | Kĩ năng cần rèn luyện?", null, null, null, "youtube", null },
                    { 36, true, true, false, "https://www.youtube.com/embed/YH-E4Y3EaT4?si=2iCpcacbC2GultDZ", "Video", 12, "<p>Chia sẻ kinh nghiệm và những điều sinh viên IT cần chuẩn bị khi đi thực tập</p>", null, null, 1080, 2, "Sinh viên IT đi thực tập cần biết những gì?", null, null, null, "youtube", null },
                    { 37, true, true, false, "https://www.youtube.com/embed/DpvYHLUiZpc?si=WG6Va34BAY43v0R4", "Video", 13, "<p>Phương pháp học lập trình hiệu quả cho người mới bắt đầu</p>", null, null, 960, 1, "Phương pháp HỌC LẬP TRÌNH", null, null, null, "youtube", null },
                    { 38, true, true, false, "https://www.youtube.com/embed/f5hbmw7Ba7c?si=tVfTyKmWhw62Hb6E", "Video", 13, "<p>Lợi ích của việc học lập trình qua các nền tảng web và cách tận dụng tài nguyên online</p>", null, null, 840, 2, "Tại Sao Nên Học Lập Trình Tại Trang Web", null, null, null, "youtube", null },
                    { 39, true, true, false, "https://www.youtube.com/embed/MGhw6XliFgo?si=0flovkzN1KtgCC7h", "Video", 14, "<p>Giới thiệu tổng quan về khóa học JavaScript nâng cao</p>", null, null, 600, 1, "Giới thiệu", null, null, null, "youtube", null },
                    { 40, true, true, false, "https://www.youtube.com/embed/N-3GU1F1UBY?si=rQFaM72APj6FLpmT", "Video", 14, "<p>Tìm hiểu về Immediately Invoked Function Expression (IIFE) trong JavaScript</p>", null, null, 900, 2, "Khái niệm IIFE trong JavaScript", null, null, null, "youtube", null },
                    { 41, true, true, false, "https://www.youtube.com/embed/5N8vz_VmszE?si=52bTwY4Ydo_7k3kl", "Video", 14, "<p>Hiểu về scope (phạm vi) trong JavaScript: global scope, function scope, block scope</p>", null, null, 1200, 3, "Scope trong JavaScript", null, null, null, "youtube", null },
                    { 42, true, true, false, "https://www.youtube.com/embed/xtQtGKL0NCI?si=xpOReqdkc_RKQfvS", "Video", 14, "<p>Khái niệm và ứng dụng của closure trong lập trình JavaScript</p>", null, null, 1500, 4, "Closure trong JavaScript", null, null, null, "youtube", null },
                    { 43, true, true, false, "https://www.youtube.com/embed/3MLhU1DrUxM?si=012HnDBIDVk3WvpX", "Video", 15, "<p>Tìm hiểu về hoisting: cách JavaScript xử lý khai báo biến và hàm</p>", null, null, 1080, 1, "Hoisting trong Javascript", null, null, null, "youtube", null },
                    { 44, true, true, false, "https://www.youtube.com/embed/w1W-j4cSPF0?si=1ukan44t_iqSgzjC", "Video", 15, "<p>Sử dụng strict mode để viết code JavaScript an toàn và hiệu quả hơn</p>", null, null, 960, 2, "\"use strict\" hay strict mode trong Javascript", null, null, null, "youtube", null },
                    { 45, true, true, false, "https://www.youtube.com/embed/n4tS1Q5-EzY?si=GjTfbWhSAxqgCIFa", "Video", 15, "<p>Phân biệt giữa primitive types và reference types trong JavaScript</p>", null, null, 1320, 3, "Primitive Types & Reference Types trong Javascript", null, null, null, "youtube", null },
                    { 46, true, true, false, "https://www.youtube.com/embed/ii1Ra_zLDIo?si=ZMzRga4QranVogUM", "Video", 16, "<p>Hiểu về từ khóa 'this' và cách nó hoạt động trong các ngữ cảnh khác nhau</p>", null, null, 1800, 1, "This keyword trong JavaScript", null, null, null, "youtube", null },
                    { 47, true, true, false, "https://www.youtube.com/embed/F5z6YoR8of0?si=EJvumQ5VEV6VIZlN", "Video", 16, "<p>Phần 1: Tìm hiểu về phương thức bind() trong JavaScript</p>", null, null, 1200, 2, "Fn.bind() method trong JavaScript phần 1", null, null, null, "youtube", null },
                    { 48, true, true, false, "https://www.youtube.com/embed/6j9b2_E34JM?si=rs38tq046byAA6i5", "Video", 16, "<p>Phần 2: Ứng dụng thực tế của phương thức bind()</p>", null, null, 1080, 3, "Fn.bind() method trong JavaScript phần 2", null, null, null, "youtube", null },
                    { 49, true, true, false, "https://www.youtube.com/embed/QxLTSdTJDXY?si=KWT36QTPVuEXDM3K", "Video", 16, "<p>Sử dụng phương thức call() để gọi hàm với giá trị 'this' cụ thể</p>", null, null, 900, 4, "Fn.call() method trong JavaScript", null, null, null, "youtube", null },
                    { 50, true, true, false, "https://www.youtube.com/embed/a4FjX4Z-9Rs?si=wuCZqUzeuaLNACqP", "Video", 16, "<p>Sử dụng phương thức apply() để gọi hàm với mảng đối số</p>", null, null, 960, 5, "Fn.apply() method trong JavaScript", null, null, null, "youtube", null },
                    { 51, true, true, false, "https://www.youtube.com/embed/GQ-toR8F7rc?si=gef3E7tTAtlP2Gij", "Video", 17, "<p>Thực hành với Redux - State management cho JavaScript applications</p>", null, null, 2400, 1, "Học Redux", null, null, null, "youtube", null },
                    { 52, true, true, false, "https://www.youtube.com/embed/0SJE9dYdpps?si=pUECkazKOu2V5fJ2", "Video", 18, "<p>Khám phá khả năng và ứng dụng của JavaScript trong phát triển web</p>", null, null, 900, 1, "Javascript có thể làm được gì?", null, null, null, "youtube", null },
                    { 53, true, true, false, "https://www.youtube.com/embed/-jV06pqjUUc?si=4TITZ8jtPnMdnwDK", "Video", 18, "<p>Những lời khuyên hữu ích trước khi bắt đầu học lập trình JavaScript</p>", null, null, 600, 2, "Lời khuyên trước khóa học", null, null, null, "youtube", null },
                    { 54, true, true, false, "https://www.youtube.com/embed/efI98nT8Ffo?si=SGT7VQZOTwecjLFy", "Video", 18, "<p>Hướng dẫn cài đặt môi trường và công cụ cần thiết để học JavaScript</p>", null, null, 1200, 3, "Cài đặt môi trường, công cụ phù hợp để học JavaScript", null, null, null, "youtube", null },
                    { 55, true, true, false, "https://www.youtube.com/embed/W0vEUmyvthQ?si=uIquuLkihmo70A8f", "Video", 19, "<p>Hướng dẫn nhúng JavaScript vào file HTML</p>", null, null, 1080, 1, "Cách sử dụng JS trong file HTML", null, null, null, "youtube", null },
                    { 56, true, true, false, "https://www.youtube.com/embed/CLbx37dqYEI?si=LV2teP0FA98jrLzd", "Video", 19, "<p>Học cách khai báo và sử dụng biến trong JavaScript</p>", null, null, 960, 2, "Khai báo biến", null, null, null, "youtube", null },
                    { 57, true, true, false, "https://www.youtube.com/embed/xRpXBEq6TOY?si=BVdMwpKjyKjkNCe5", "Video", 19, "<p>Cách sử dụng comments để ghi chú code trong JavaScript</p>", null, null, 720, 3, "Sử dụng Comments trong JavaScript", null, null, null, "youtube", null },
                    { 58, true, true, false, "https://www.youtube.com/embed/rSV33HGotgE?si=yswlNLENjUQH6-qJ", "Video", 19, "<p>Giới thiệu các hàm built-in thông dụng trong JavaScript</p>", null, null, 1320, 4, "Một số hàm built-in trong JavaScript", null, null, null, "youtube", null },
                    { 59, true, true, false, "https://www.youtube.com/embed/SZb-N7TfPlw?si=o5H_GPV-40w8JFkB", "Video", 20, "<p>Giới thiệu các loại toán tử cơ bản trong JavaScript</p>", null, null, 900, 1, "Làm quen với toán tử trong JavaScript", null, null, null, "youtube", null },
                    { 60, true, true, false, "https://www.youtube.com/embed/m_h7-dgKnMU?si=5I_SRNZmvCV9JQIy", "Video", 20, "<p>Tìm hiểu các toán tử số học: cộng, trừ, nhân, chia, mod</p>", null, null, 1080, 2, "Toán tử số học trong JavaScript", null, null, null, "youtube", null },
                    { 61, true, true, false, "https://www.youtube.com/embed/aM-DUx6Qnc8?si=kwcVVpz2z17YAsk8", "Video", 20, "<p>Phân biệt toán tử ++ và -- khi đặt trước hoặc sau biến</p>", null, null, 960, 3, "Toán tử ++ -- với tiền tố & hậu tố", null, null, null, "youtube", null },
                    { 62, true, true, false, "https://www.youtube.com/embed/ncRmjazgsE8?si=v7uHTTa80Ju-xcYc", "Video", 20, "<p>Các toán tử gán: =, +=, -=, *=, /=, %=</p>", null, null, 840, 4, "Toán tử gán trong JavaScript", null, null, null, "youtube", null },
                    { 63, true, true, false, "https://www.youtube.com/embed/QCLVU6cZU_E?si=TpVpQyVmAWGR78Zx", "Video", 20, "<p>Toán tử nối chuỗi và xử lý chuỗi trong JavaScript</p>", null, null, 720, 5, "Toán tử chuỗi (String Operator)", null, null, null, "youtube", null },
                    { 64, true, true, false, "https://www.youtube.com/embed/rWM2lXtS-d8?si=1ZP4ZSId0h3Zb0Uw", "Video", 20, "<p>Phần 1: Các toán tử so sánh cơ bản</p>", null, null, 900, 6, "Toán tử so sánh trong Javascript (phần 1)", null, null, null, "youtube", null },
                    { 65, true, true, false, "https://www.youtube.com/embed/9cZEG1SSSQc?si=Eohx5LEBldikCsgv", "Video", 20, "<p>Tìm hiểu về kiểu dữ liệu Boolean và giá trị true/false</p>", null, null, 780, 7, "Kiểu dữ liệu Boolean", null, null, null, "youtube", null },
                    { 66, true, true, false, "https://www.youtube.com/embed/9MpHrdWBdxg?si=Ctyh_tmLGGJ71Rov", "Video", 20, "<p>Sử dụng câu lệnh điều kiện if-else để điều khiển luồng chương trình</p>", null, null, 1200, 8, "Câu lệnh điều kiện If - Else", null, null, null, "youtube", null },
                    { 67, true, true, false, "https://www.youtube.com/embed/meCXeMeyFdE?si=axuLDkpaE6apxulc", "Video", 20, "<p>Phần 2: Toán tử so sánh nâng cao và type coercion</p>", null, null, 960, 9, "Toán tử so sánh trong JavaScript (phần 2)", null, null, null, "youtube", null },
                    { 68, true, true, false, "https://www.youtube.com/embed/4g9ENVc2KLA?si=tFujXiYPhAfK2TSJ", "Video", 21, "<p>Khái niệm và cách tạo hàm trong JavaScript</p>", null, null, 1080, 1, "Hàm trong JavaScript", null, null, null, "youtube", null },
                    { 69, true, true, false, "https://www.youtube.com/embed/jE6UPl17Nvo?si=yN9WL4koZqObb9za", "Video", 21, "<p>Cách truyền và sử dụng tham số trong hàm JavaScript</p>", null, null, 900, 2, "Tham số trong hàm", null, null, null, "youtube", null },
                    { 70, true, true, false, "https://www.youtube.com/embed/OOoeAIrn69M?si=kp3j4L6lFtjC9e4a", "Video", 21, "<p>Sử dụng từ khóa return để trả về giá trị từ hàm</p>", null, null, 840, 3, "Return trong hàm JS", null, null, null, "youtube", null },
                    { 71, true, true, false, "https://www.youtube.com/embed/aTQojRq0N4c?si=zMY3mJOOWp63DsI0", "Video", 21, "<p>Khái niệm nâng cao về function trong JavaScript</p>", null, null, 960, 4, "Hiểu hơn về function", null, null, null, "youtube", null },
                    { 72, true, true, false, "https://www.youtube.com/embed/scwab9DMNtM?si=Ug3LbHXMcbpeVrA6", "Video", 21, "<p>Giới thiệu các loại function: declaration, expression, arrow function</p>", null, null, 1200, 5, "Các loại function", null, null, null, "youtube", null },
                    { 73, true, true, false, "https://www.youtube.com/embed/AT-yhX26_Ao?si=e54QJFdLBMSstjFN", "Video", 22, "<p>Khái niệm và cách làm việc với mảng trong JavaScript</p>", null, null, 1320, 1, "Làm việc với mảng", null, null, null, "youtube", null },
                    { 74, true, true, false, "https://www.youtube.com/embed/-xZkVmkDwbU?si=fsIbO2aWeVht40pj", "Video", 22, "<p>Sử dụng phương thức map() để biến đổi các phần tử trong mảng</p>", null, null, 1080, 2, "Array map method", null, null, null, "youtube", null },
                    { 75, true, true, false, "https://www.youtube.com/embed/-JMh3A556cw?si=zePj4wqdRznZlvH4", "Video", 22, "<p>Sử dụng phương thức reduce() để tính toán tổng hợp trên mảng</p>", null, null, 1200, 3, "Phương thức reduce", null, null, null, "youtube", null },
                    { 76, true, true, false, "https://www.youtube.com/embed/ZdvRm1bfGAk?si=XDnh_xokoGRI5SeD", "Video", 23, "<p>Phần 1: Giới thiệu về form validation với JavaScript</p>", null, null, 960, 1, "Form validation - Phần 1", null, null, null, "youtube", null },
                    { 77, true, true, false, "https://www.youtube.com/embed/scybnB9vYVQ?si=kzfvyuuj9ja9KtG2", "Video", 23, "<p>Phần 2: Validate các trường input cơ bản</p>", null, null, 1080, 2, "Form validation - Phần 2", null, null, null, "youtube", null },
                    { 78, true, true, false, "https://www.youtube.com/embed/LpgoBaULw30?si=DynUjTHSMZoCwtdA", "Video", 23, "<p>Phần 3: Validate email và password</p>", null, null, 900, 3, "Form validation - Phần 3", null, null, null, "youtube", null },
                    { 79, true, true, false, "https://www.youtube.com/embed/jRnBvlMUvK0?si=XoBWKyhwtSaG2Afk", "Video", 23, "<p>Phần 4: Hiển thị thông báo lỗi và hoàn thiện form validation</p>", null, null, 1200, 4, "Form validation - Phần 4", null, null, null, "youtube", null },
                    { 80, true, true, false, "https://www.youtube.com/embed/r6GWbQL-qwA?si=QbPo3dUWrf_Gqetr", "Video", 24, "<p>Giới thiệu về ứng dụng AI phát hiện hành vi chạm tay lên mặt và ứng dụng trong phòng chống dịch bệnh</p>", null, null, 900, 1, "Ứng Dụng Cảnh Báo Khi Chạm Tay Lên Mặt", null, null, null, "youtube", null },
                    { 81, true, true, false, "https://www.youtube.com/embed/WIyfBMdtNTE?si=I3XlU3YXgMSVDmwN", "Video", 24, "<p>Demo ứng dụng hoàn chỉnh và cách thức hoạt động</p>", null, null, 600, 2, "Demo", null, null, null, "youtube", null },
                    { 82, true, true, false, "https://www.youtube.com/embed/bqXyrCjT7V4?si=Jt2REUtdOdQn8FA4", "Video", 25, "<p>Hướng dẫn cài đặt Node.js và npm cho dự án React</p>", null, null, 720, 1, "Cài đặt NodeJS", null, null, null, "youtube", null },
                    { 83, true, true, false, "https://www.youtube.com/embed/3IWNmXKmRqo?si=I0tuf0MDLFOvKbB3", "Video", 25, "<p>Tạo dự án React mới với Create React App</p>", null, null, 600, 2, "Create react app", null, null, null, "youtube", null },
                    { 84, true, true, false, "https://www.youtube.com/embed/3klHfl2fOb0?si=LiXerT1JPdy96eRh", "Video", 25, "<p>Cài đặt các thư viện cần thiết: TensorFlow.js, react-webcam, và các dependency khác</p>", null, null, 900, 3, "Cài đặt thư viện cho ứng dụng", null, null, null, "youtube", null },
                    { 85, true, true, false, "https://www.youtube.com/embed/b5NEWtDwc_0?si=QtMx5Ub2HWEy6BBm", "Video", 25, "<p>Xây dựng giao diện cơ bản cho ứng dụng với React components</p>", null, null, 1080, 4, "Dựng giao diện khung", null, null, null, "youtube", null },
                    { 86, true, true, false, "https://www.youtube.com/embed/jjZGa8foO0s?si=nhKVXj2Mgexn0WFp", "Video", 25, "<p>Import và cấu hình các thư viện đã cài đặt vào dự án</p>", null, null, 780, 5, "Import thư viện cần thiết", null, null, null, "youtube", null },
                    { 87, true, true, false, "https://www.youtube.com/embed/uXvZyCnaZ7Y?si=ATry-U-5uD1xvuwH", "Video", 25, "<p>Triển khai chức năng stream video từ webcam với react-webcam</p>", null, null, 1200, 6, "Xây dựng phần Video Stream", null, null, null, "youtube", null },
                    { 88, true, true, false, "https://www.youtube.com/embed/KuDJjRU8XfY?si=UK8g8kDBZSTwyr2k", "Video", 26, "<p>Cấu hình TensorFlow.js và model machine learning cho ứng dụng</p>", null, null, 960, 1, "Setup thư viện TensorFlow", null, null, null, "youtube", null },
                    { 89, true, true, false, "https://www.youtube.com/embed/xjXoFX3X2yg?si=O8iZFjdXPyln_FIT", "Video", 26, "<p>Viết hàm training model để phát hiện hành vi chạm tay lên mặt</p>", null, null, 1500, 2, "Viết function training", null, null, null, "youtube", null },
                    { 90, true, true, false, "https://www.youtube.com/embed/C4jm3RWSw10?si=dRccDX_CFe6VpfeL", "Video", 26, "<p>Giải thích cơ chế hoạt động của model machine learning trong ứng dụng</p>", null, null, 1080, 3, "Giải thích cách hoạt động", null, null, null, "youtube", null },
                    { 91, true, true, false, "https://www.youtube.com/embed/pwWS_VcR9Ks?si=Z38-HOt_QchT-t0i", "Video", 26, "<p>Thêm chức năng cảnh báo bằng âm thanh và thông báo khi phát hiện chạm tay lên mặt</p>", null, null, 1320, 4, "Triển khai phần âm thanh và thông báo", null, null, null, "youtube", null },
                    { 92, true, true, false, "https://www.youtube.com/embed/D5Xd9FByKXc?si=ISfXlB2hgjruCYGf", "Video", 26, "<p>Hướng dẫn cách training model hiệu quả và tối ưu độ chính xác</p>", null, null, 1800, 5, "Hướng dẫn Training hiệu quả", null, null, null, "youtube", null },
                    { 93, true, true, false, "https://www.youtube.com/embed/z2f7RHgvddc?si=jkZ2cKsYrIwrndS7", "Video", 27, "<p>Những lời khuyên hữu ích trước khi bắt đầu học Node.js và ExpressJS</p>", null, null, 600, 1, "Lời khuyên trước khóa học", null, null, null, "youtube", null },
                    { 94, true, true, false, "https://www.youtube.com/embed/SdcdneSdoV4?si=IwwaJJjfdpDQea9d", "Video", 27, "<p>Tìm hiểu về giao thức HTTP, phương thức và trạng thái response</p>", null, null, 900, 2, "Giao thức HTTP", null, null, null, "youtube", null },
                    { 95, true, true, false, "https://www.youtube.com/embed/HLEu57iLrRo?si=sQt0ZQ9HG4rQEmay", "Video", 27, "<p>Phân biệt Server-Side Rendering (SSR) và Client-Side Rendering (CSR)</p>", null, null, 1080, 3, "SSR & CSR", null, null, null, "youtube", null },
                    { 96, true, true, false, "https://www.youtube.com/embed/CcSuYLjKW3g?si=NKAcYepnILR1ViUA", "Video", 27, "<p>Hướng dẫn cài đặt Node.js và npm trên các hệ điều hành</p>", null, null, 720, 4, "Cài đặt NodeJS", null, null, null, "youtube", null },
                    { 97, true, true, false, "https://www.youtube.com/embed/tfQXZ8jES6A?si=xRlgIvNei37_j0bk", "Video", 27, "<p>Hướng dẫn cài đặt ExpressJS framework và tạo dự án đầu tiên</p>", null, null, 840, 5, "Cài đặt Express framework", null, null, null, "youtube", null },
                    { 98, true, true, false, "https://www.youtube.com/embed/zCFOn4YXr00?si=20MxnAHBHsfcKvjz", "Video", 27, "<p>Cài đặt và sử dụng Nodemon để tự động restart server khi code thay đổi</p>", null, null, 600, 6, "Sử dụng thư viện Nodemon", null, null, null, "youtube", null },
                    { 99, true, true, false, "https://www.youtube.com/embed/f0C9kTOf6IY?si=Dp4AZSxSV1-jN9w2", "Video", 27, "<p>Hướng dẫn quản lý source code với Git và đẩy code lên Github</p>", null, null, 900, 7, "Add source code lên Github", null, null, null, "youtube", null },
                    { 100, true, true, false, "https://www.youtube.com/embed/seI--u0hSeg?si=1c9-HMYFSBSNxIVJ", "Video", 27, "<p>Sử dụng Morgan middleware để log HTTP requests trong ExpressJS</p>", null, null, 660, 8, "Cài đặt thư viện Morgan", null, null, null, "youtube", null },
                    { 101, true, true, false, "https://www.youtube.com/embed/lpbl2qQXbDo?si=fbhZmFuRf_Z1nSbC", "Video", 28, "<p>Giới thiệu về Template Engine và cách sử dụng trong ExpressJS</p>", null, null, 960, 1, "Khái niệm Template Engine", null, null, null, "youtube", null },
                    { 102, true, true, false, "https://www.youtube.com/embed/BxZNiLo-OA0?si=9YrQE5TkoQo87idU", "Video", 28, "<p>Cấu hình ExpressJS để phục vụ các file tĩnh (CSS, JavaScript, images)</p>", null, null, 780, 2, "Cấu hình sử dụng file tĩnh", null, null, null, "youtube", null },
                    { 103, true, true, false, "https://www.youtube.com/embed/zNLXsTu_kUA?si=IWXvEf4MJgF0C5_Y", "Video", 28, "<p>Tích hợp Bootstrap framework vào dự án ExpressJS</p>", null, null, 720, 3, "Tích hợp Bootstrap", null, null, null, "youtube", null },
                    { 104, true, true, false, "https://www.youtube.com/embed/Wz6WghmEmFk?si=ppmhAov6Wi0f-LG2", "Video", 28, "<p>Tạo các route cơ bản trong ExpressJS</p>", null, null, 900, 4, "Basic routing", null, null, null, "youtube", null },
                    { 105, true, true, false, "https://www.youtube.com/embed/BbBagzvrSto?si=y3ySiHHMnmwbQay9", "Video", 28, "<p>Sử dụng phương thức GET để xử lý các request lấy dữ liệu</p>", null, null, 840, 5, "Phương thức GET", null, null, null, "youtube", null },
                    { 106, true, true, false, "https://www.youtube.com/embed/6LdwSrTCmo4?si=Oc9ZK6a3gNioq_8e", "Video", 28, "<p>Xử lý query string trong URL với ExpressJS</p>", null, null, 720, 6, "Chuỗi truy vấn", null, null, null, "youtube", null },
                    { 107, true, true, false, "https://www.youtube.com/embed/wCF8pIbOOpo?si=lnpa3zXNO56irhkh", "Video", 28, "<p>Tìm hiểu về hành vi mặc định của HTML form</p>", null, null, 660, 7, "Form default behavior", null, null, null, "youtube", null },
                    { 108, true, true, false, "https://www.youtube.com/embed/LlfdqnK28Cg?si=fFr6ofi7s3LucQ-N", "Video", 28, "<p>Sử dụng phương thức POST để xử lý form submission</p>", null, null, 960, 8, "Phương thức POST", null, null, null, "youtube", null },
                    { 109, true, true, false, "https://www.youtube.com/embed/N8GhaR7K3tI?si=ChVEACoPm57PsbWU", "Video", 29, "<p>Giới thiệu về mô hình MVC (Model-View-Controller) trong ExpressJS</p>", null, null, 1080, 1, "Mô hình MVC", null, null, null, "youtube", null },
                    { 110, true, true, false, "https://www.youtube.com/embed/Pd_ZIpCVZPc?si=3uYoOu86VehDbpnt", "Video", 29, "<p>Xây dựng routes và controllers theo mô hình MVC</p>", null, null, 1200, 2, "MVC Routes & Controllers", null, null, null, "youtube", null },
                    { 111, true, true, false, "https://www.youtube.com/embed/5Odp8lcAvyA?si=9bORfXTxWX-p4z-m", "Video", 29, "<p>Hướng dẫn cài đặt và cấu hình MongoDB cho dự án</p>", null, null, 900, 3, "Cài đặt Mongodb", null, null, null, "youtube", null },
                    { 112, true, true, false, "https://www.youtube.com/embed/kyNyMfRCavg?si=9X5dfSg9fLgNDVzk", "Video", 29, "<p>Cài đặt và cấu hình Prettier để format code tự động</p>", null, null, 660, 4, "Thư viện Prettier", null, null, null, "youtube", null },
                    { 113, true, true, false, "https://www.youtube.com/embed/uAXpEmTZhfA?si=9fd8m315tvTZHUDm", "Video", 29, "<p>Tạo Model để tương tác với database MongoDB</p>", null, null, 1080, 5, "Xây dựng thành phần Model trong mô hình MVC", null, null, null, "youtube", null },
                    { 114, true, true, false, "https://www.youtube.com/embed/PYjZV9HPLRs?si=aE3E3kf0Amt6X-73", "Video", 29, "<p>Cài đặt công cụ để xem JSON data dễ dàng hơn</p>", null, null, 600, 6, "Cài đặt JSON Viewer", null, null, null, "youtube", null },
                    { 115, true, true, false, "https://www.youtube.com/embed/nqLXmpEgU2w?si=ejJ8kLsnxDBtHE4b", "Video", 29, "<p>Viết code để đọc dữ liệu từ MongoDB database</p>", null, null, 960, 7, "Đọc Database", null, null, null, "youtube", null },
                    { 116, true, true, false, "https://www.youtube.com/embed/LnTPJcUQdNU?si=NeAQFq8KlvzaP7zX", "Video", 29, "<p>Tạo trang hiển thị chi tiết một item từ database</p>", null, null, 1080, 8, "Xây dựng trang chi tiết", null, null, null, "youtube", null },
                    { 117, true, true, false, "https://www.youtube.com/embed/bvZ1_P9eCpw?si=Kq5NwkNFxPTbpj4M", "Video", 29, "<p>Xây dựng form và logic để tạo mới khóa học</p>", null, null, 1200, 9, "Dựng trang tạo mới khóa học", null, null, null, "youtube", null },
                    { 118, true, true, false, "https://www.youtube.com/embed/HdVOT7Neh18?si=6qIbTAoX4FEwmoJS", "Video", 29, "<p>Tạo trang và chức năng chỉnh sửa thông tin khóa học</p>", null, null, 1320, 10, "Dựng trang chỉnh sửa", null, null, null, "youtube", null },
                    { 119, true, true, false, "https://www.youtube.com/embed/-10W8ZmNlcg?si=fys6OyTO5NB_0jiP", "Video", 29, "<p>Triển khai chức năng sắp xếp (sort) dữ liệu</p>", null, null, 960, 11, "Hoàn thiện logic chức năng Sort", null, null, null, "youtube", null },
                    { 120, true, true, false, "https://www.youtube.com/embed/uz5LIP85J5Y?si=Ff8E3BwYC4Qc0phk", "Video", 30, "<p>Giới thiệu về responsive web design và tầm quan trọng trong thiết kế hiện đại</p>", null, null, 720, 1, "Khái niệm responsive", null, null, null, "youtube", null },
                    { 121, true, true, false, "https://www.youtube.com/embed/5QT0aeovTTY?si=bGlPkMN6NNPo9ZUI", "Video", 30, "<p>Các bước và kỹ thuật cần thiết để thiết kế website responsive</p>", null, null, 840, 2, "Cần làm gì để thực hiện responsive khi thiết kế website", null, null, null, "youtube", null },
                    { 122, true, true, false, "https://www.youtube.com/embed/CIIYogDrGto?si=L-duzdQHVlF1opO-", "Video", 30, "<p>Giới thiệu các công cụ và extension hỗ trợ responsive design</p>", null, null, 660, 3, "Cài đặt và sử dụng công cụ responsive web", null, null, null, "youtube", null },
                    { 123, true, true, false, "https://www.youtube.com/embed/XJiq_d0vGCQ?si=WHwUTJ--ANrYNRem", "Video", 31, "<p>Tìm hiểu về viewport meta tag và vai trò trong responsive design</p>", null, null, 600, 1, "Khái niệm Viewport", null, null, null, "youtube", null },
                    { 124, true, true, false, "https://www.youtube.com/embed/YgkzJkmDP3U?si=82oswyIzYnqV4S9V", "Video", 31, "<p>Sử dụng CSS media queries để áp dụng styles cho các thiết bị khác nhau</p>", null, null, 900, 2, "Thuộc tính Media query (@media)", null, null, null, "youtube", null },
                    { 125, true, true, false, "https://www.youtube.com/embed/0i37IU0wjlI?si=S692S7nLRwDoIPHy", "Video", 31, "<p>Hiểu về breakpoints và cách chọn breakpoints phù hợp cho thiết kế</p>", null, null, 780, 3, "Khái niệm Breakpoints trong responsive", null, null, null, "youtube", null },
                    { 126, true, true, false, "https://www.youtube.com/embed/aywAr27pkWE?si=WBoVYOgwUz-pCmi2", "Video", 31, "<p>Lựa chọn đơn vị đo lường phù hợp (px, em, rem, %, vw, vh) cho media queries</p>", null, null, 720, 4, "Sử dụng đơn vị nào khi dùng Media queries", null, null, null, "youtube", null },
                    { 127, true, true, false, "https://www.youtube.com/embed/-NK4jLekauw?si=3NbBMO3ybHMY3l5P", "Video", 32, "<p>Thực hành tạo layout responsive cơ bản với media queries</p>", null, null, 1080, 1, "Thực hành responsive", null, null, null, "youtube", null },
                    { 128, true, true, false, "https://www.youtube.com/embed/HYy4c6lcOlM?si=FsYXsiP07J6aZ_7c", "Video", 32, "<p>Tạo navigation bar responsive với hamburger menu cho mobile</p>", null, null, 960, 2, "Responsive cho navigation bar", null, null, null, "youtube", null },
                    { 129, true, true, false, "https://www.youtube.com/embed/lvD5K50TZPk?si=YWld4DwlpIwRMPEO", "Video", 33, "<p>Giới thiệu về CSS Grid Layout và các khái niệm cơ bản</p>", null, null, 900, 1, "Khái niệm Grid system", null, null, null, "youtube", null },
                    { 130, true, true, false, "https://www.youtube.com/embed/iKlMB01w47g?si=xhLnegsjgfEPBKic", "Video", 33, "<p>Các thuộc tính nâng cao của CSS Grid: grid-template-areas, grid-auto-flow, justify-items, align-items</p>", null, null, 960, 2, "Khái niệm Grid system phần 2", null, null, null, "youtube", null },
                    { 131, true, true, false, "https://www.youtube.com/embed/ScZaj1eG7DQ?si=8aPgvKNracyn4weX", "Video", 33, "<p>Xây dựng thư viện CSS custom sử dụng Grid System để tái sử dụng</p>", null, null, 1200, 3, "Tạo thư viện CSS ứng dụng Grid system", null, null, null, "youtube", null },
                    { 132, true, true, false, "https://www.youtube.com/embed/7ppRSaGT1uw?si=jW7RVXUlpcXVAc4w", "Video", 34, "<p>Giới thiệu tổng quan về Windows Terminal và Windows Subsystem for Linux (WSL)</p>", null, null, 600, 1, "Giới thiệu Windows Terminal & WSL", null, null, null, "youtube", null },
                    { 133, true, true, false, "https://www.youtube.com/embed/egSxAF-Sak4?si=MFZbkp7kXiuFKL6t", "Video", 35, "<p>Hướng dẫn cài đặt Windows Terminal từ Microsoft Store và cấu hình cơ bản</p>", null, null, 720, 1, "Window Terminal install", null, null, null, "youtube", null },
                    { 134, true, true, false, "https://www.youtube.com/embed/ypvjxw5qBK0?si=7Pg70wbWgb0H785u", "Video", 35, "<p>Hướng dẫn cài đặt Ubuntu trên Windows thông qua WSL (Windows Subsystem for Linux)</p>", null, null, 900, 2, "Cài đặt Ubuntu với WSL 1", null, null, null, "youtube", null },
                    { 135, true, true, false, "https://www.youtube.com/embed/1jsHfX2WomA?si=h30pQNipb3m8AOW6", "Video", 35, "<p>Cách cập nhật packages và hệ thống Ubuntu sau khi cài đặt</p>", null, null, 600, 3, "Update Packages Ubuntu", null, null, null, "youtube", null },
                    { 136, true, true, false, "https://www.youtube.com/embed/1UIe8sHXN5c?si=U3IQfm_H2UCbsRTt", "Video", 35, "<p>Giới thiệu các lệnh cơ bản trong Ubuntu/Linux terminal</p>", null, null, 780, 4, "Các lệnh trong Ubuntu", null, null, null, "youtube", null },
                    { 137, true, true, false, "https://www.youtube.com/embed/1UIe8sHXN5c?si=xFojRSQx27MQJbw1", "Video", 36, "<p>Hướng dẫn sử dụng các lệnh cơ bản: ls (liệt kê file), cd (di chuyển), clear (xóa màn hình)</p>", null, null, 840, 1, "Lệnh ls, cd, clear trong Ubuntu/Linux", null, null, null, "youtube", null },
                    { 138, true, true, false, "https://www.youtube.com/embed/ozBhz7il5Ts?si=HlrGNoLwNygz4bmu", "Video", 36, "<p>Hướng dẫn sử dụng lệnh tạo thư mục (mkdir), tạo file (touch) và editor vi</p>", null, null, 900, 2, "Lệnh mkdir, touch, vi trong Ubuntu/Linux", null, null, null, "youtube", null },
                    { 139, true, true, false, "https://www.youtube.com/embed/l5mLKwWjSe8?si=Vz27TDiC5f_U-qAk", "Video", 36, "<p>Hướng dẫn sử dụng lệnh xem file (cat), in text (echo), xem cuối file (tail), tìm kiếm (grep)</p>", null, null, 1080, 3, "Lệnh cat, echo, tail, grep trong Ubuntu/Linux", null, null, null, "youtube", null },
                    { 140, true, true, false, "https://www.youtube.com/embed/9rddrjDkmWo?si=IV_P1behSManoGLz", "Video", 37, "<p>Hướng dẫn cài đặt Node.js và npm trên WSL/Ubuntu</p>", null, null, 720, 1, "Cài đặt NodeJS trên WSL", null, null, null, "youtube", null },
                    { 141, true, true, false, "https://www.youtube.com/embed/aj3HXDfrM2Q?si=razVM3G1PB2FJ5Sa", "Video", 37, "<p>Tạo và chạy dự án React.js trên môi trường WSL/Ubuntu</p>", null, null, 780, 2, "Tạo dự án ReactJS trên WSL", null, null, null, "youtube", null },
                    { 142, true, true, false, "https://www.youtube.com/embed/MpYEUtbbFSg?si=vC2KMpr6WcYVuyWh", "Video", 37, "<p>Tạo dự án Express.js backend và chạy trên WSL/Ubuntu</p>", null, null, 900, 3, "Tạo và chạy dự án ExpressJS trên WSL", null, null, null, "youtube", null },
                    { 143, true, true, false, "https://www.youtube.com/embed/ScLOfVwezKU?si=Xx3iU0ddzdjAfsMR", "Video", 38, "<p>Giới thiệu quy trình deploy ứng dụng web lên server thật</p>", null, null, 600, 1, "Deploy dự án với Server thật", null, null, null, "youtube", null },
                    { 144, true, true, false, "https://www.youtube.com/embed/7RjjF8Ee7Ws?si=Qe3vEJXncfyrlmcb", "Video", 38, "<p>Hướng dẫn mua và cấu hình domain name cho website</p>", null, null, 720, 2, "Mua tên miền website", null, null, null, "youtube", null },
                    { 145, true, true, false, "https://www.youtube.com/embed/CLJSI2xO1Mo?si=5Mp01POpJtJ3g-DT", "Video", 38, "<p>Hướng dẫn tạo user và phân quyền trên server Linux/Ubuntu</p>", null, null, 660, 3, "Tạo User trên máy chủ Linux/Ubuntu", null, null, null, "youtube", null },
                    { 146, true, true, false, "https://www.youtube.com/embed/1sdaPoXWQrw?si=1p8toXNCTx7h1Jrb", "Video", 38, "<p>Hướng dẫn cài đặt và cấu hình Nginx web server trên Ubuntu</p>", null, null, 1080, 4, "Cài đặt và cấu hình Nginx cơ bản trên Ubuntu", null, null, null, "youtube", null },
                    { 147, true, true, false, "https://www.youtube.com/embed/fvs_wjEd0Ks?si=bCRTTR1ORZTjV3B6", "Video", 38, "<p>Hướng dẫn upload source code lên server sử dụng Filezilla FTP client</p>", null, null, 840, 5, "Upload Source Code lên máy chủ với Filezilla", null, null, null, "youtube", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_BaiHocs_MaChuong",
                table: "BaiHocs",
                column: "MaChuong");

            migrationBuilder.CreateIndex(
                name: "IX_BaiTap_Quizs_MaBaiTap",
                table: "BaiTap_Quizs",
                column: "MaBaiTap",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BaiTaps_MaBaiHoc",
                table: "BaiTaps",
                column: "MaBaiHoc");

            migrationBuilder.CreateIndex(
                name: "IX_BaiTapThucHanhs_MaBaiTap",
                table: "BaiTapThucHanhs",
                column: "MaBaiTap",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BinhLuans_MaBaiHoc",
                table: "BinhLuans",
                column: "MaBaiHoc");

            migrationBuilder.CreateIndex(
                name: "IX_BinhLuans_MaBinhLuanCha",
                table: "BinhLuans",
                column: "MaBinhLuanCha");

            migrationBuilder.CreateIndex(
                name: "IX_BinhLuans_MaNguoiDung",
                table: "BinhLuans",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietDonHangs_MaDonHang",
                table: "ChiTietDonHangs",
                column: "MaDonHang");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietDonHangs_MaKhoaHoc",
                table: "ChiTietDonHangs",
                column: "MaKhoaHoc");

            migrationBuilder.CreateIndex(
                name: "IX_ChungChiKhoaHocs_MaChungChi",
                table: "ChungChiKhoaHocs",
                column: "MaChungChi",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChungChiKhoaHocs_MaKetQuaKiemTraChungChi",
                table: "ChungChiKhoaHocs",
                column: "MaKetQuaKiemTraChungChi");

            migrationBuilder.CreateIndex(
                name: "IX_ChungChiKhoaHocs_MaKhoaHoc",
                table: "ChungChiKhoaHocs",
                column: "MaKhoaHoc");

            migrationBuilder.CreateIndex(
                name: "IX_ChungChiKhoaHocs_MaNguoiDung_MaKhoaHoc",
                table: "ChungChiKhoaHocs",
                columns: new[] { "MaNguoiDung", "MaKhoaHoc" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ChuongHocs_MaKhoaHoc",
                table: "ChuongHocs",
                column: "MaKhoaHoc");

            migrationBuilder.CreateIndex(
                name: "IX_DangKyKhoaHocs_MaKhoaHoc",
                table: "DangKyKhoaHocs",
                column: "MaKhoaHoc");

            migrationBuilder.CreateIndex(
                name: "IX_DangKyKhoaHocs_MaNguoiDung",
                table: "DangKyKhoaHocs",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_DanhGias_MaKhoaHoc",
                table: "DanhGias",
                column: "MaKhoaHoc");

            migrationBuilder.CreateIndex(
                name: "IX_DanhGias_MaNguoiDung_MaKhoaHoc",
                table: "DanhGias",
                columns: new[] { "MaNguoiDung", "MaKhoaHoc" },
                unique: true);

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
                name: "IX_DonHangKhoaHocs_MaVoucher",
                table: "DonHangKhoaHocs",
                column: "MaVoucher");

            migrationBuilder.CreateIndex(
                name: "IX_GhiChuAIs_MaBaiHoc",
                table: "GhiChuAIs",
                column: "MaBaiHoc");

            migrationBuilder.CreateIndex(
                name: "IX_GhiChuAIs_MaNguoiDung",
                table: "GhiChuAIs",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_GhiChuBaiHocs_MaBaiHoc",
                table: "GhiChuBaiHocs",
                column: "MaBaiHoc");

            migrationBuilder.CreateIndex(
                name: "IX_GhiChuBaiHocs_MaNguoiDung",
                table: "GhiChuBaiHocs",
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
                name: "IX_HoTroRutTienGiangViens_MaGiangVien",
                table: "HoTroRutTienGiangViens",
                column: "MaGiangVien");

            migrationBuilder.CreateIndex(
                name: "IX_HoTroRutTienGiangViens_MaQuanTriVienXuLy",
                table: "HoTroRutTienGiangViens",
                column: "MaQuanTriVienXuLy");

            migrationBuilder.CreateIndex(
                name: "IX_HoTroRutTienGiangViens_MaYeuCauRutTien_TrangThaiHoTro",
                table: "HoTroRutTienGiangViens",
                columns: new[] { "MaYeuCauRutTien", "TrangThaiHoTro" });

            migrationBuilder.CreateIndex(
                name: "IX_KetQuaKiemTraChungChis_MaKhoaHoc",
                table: "KetQuaKiemTraChungChis",
                column: "MaKhoaHoc");

            migrationBuilder.CreateIndex(
                name: "IX_KetQuaKiemTraChungChis_MaNguoiDung",
                table: "KetQuaKiemTraChungChis",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_KetQuaLamBais_MaBaiTap",
                table: "KetQuaLamBais",
                column: "MaBaiTap");

            migrationBuilder.CreateIndex(
                name: "IX_KetQuaLamBais_MaNguoiDung",
                table: "KetQuaLamBais",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_KhoaHocs_MaGiangVien",
                table: "KhoaHocs",
                column: "MaGiangVien");

            migrationBuilder.CreateIndex(
                name: "IX_LoTrinhAIs_MaNguoiDung",
                table: "LoTrinhAIs",
                column: "MaNguoiDung");

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
                name: "IX_MaGiamGias_Code",
                table: "MaGiamGias",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MaGiamGias_MaNguoiTao",
                table: "MaGiamGias",
                column: "MaNguoiTao");

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

            migrationBuilder.CreateIndex(
                name: "IX_NguoiDungs_Email",
                table: "NguoiDungs",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NguoiDungs_TaiKhoan",
                table: "NguoiDungs",
                column: "TaiKhoan",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NhatKySuDungs_ID_Key",
                table: "NhatKySuDungs",
                column: "ID_Key");

            migrationBuilder.CreateIndex(
                name: "IX_PhienDangNhap_MaNguoiDung",
                table: "PhienDangNhap",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_QuaTangKhoaHocs_MaKhoaHoc_MaNguoiNhan_TrangThai",
                table: "QuaTangKhoaHocs",
                columns: new[] { "MaKhoaHoc", "MaNguoiNhan", "TrangThai" });

            migrationBuilder.CreateIndex(
                name: "IX_QuaTangKhoaHocs_MaNguoiNhan",
                table: "QuaTangKhoaHocs",
                column: "MaNguoiNhan");

            migrationBuilder.CreateIndex(
                name: "IX_QuaTangKhoaHocs_MaNguoiTang_MaKhoaHoc_CreatedAt",
                table: "QuaTangKhoaHocs",
                columns: new[] { "MaNguoiTang", "MaKhoaHoc", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_TestCaseThucHanhs_MaBaiTapThucHanh",
                table: "TestCaseThucHanhs",
                column: "MaBaiTapThucHanh");

            migrationBuilder.CreateIndex(
                name: "IX_ThongBaoEmailThanhToans_MaDonHang_LoaiThongBao_EmailNhan",
                table: "ThongBaoEmailThanhToans",
                columns: new[] { "MaDonHang", "LoaiThongBao", "EmailNhan" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TienDoBaiHocs_MaBaiHoc",
                table: "TienDoBaiHocs",
                column: "MaBaiHoc");

            migrationBuilder.CreateIndex(
                name: "IX_TienDoBaiHocs_MaNguoiDung_MaBaiHoc",
                table: "TienDoBaiHocs",
                columns: new[] { "MaNguoiDung", "MaBaiHoc" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VideoChapters_MaBaiHoc",
                table: "VideoChapters",
                column: "MaBaiHoc");

            migrationBuilder.CreateIndex(
                name: "IX_VideoQuizs_MaChapter",
                table: "VideoQuizs",
                column: "MaChapter");

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
                name: "AIBalanceHolds");

            migrationBuilder.DropTable(
                name: "ApiKeyAuditLogs");

            migrationBuilder.DropTable(
                name: "BaiTap_Quizs");

            migrationBuilder.DropTable(
                name: "BinhLuans");

            migrationBuilder.DropTable(
                name: "CauHinhs");

            migrationBuilder.DropTable(
                name: "ChiTietDonHangs");

            migrationBuilder.DropTable(
                name: "ChungChiKhoaHocs");

            migrationBuilder.DropTable(
                name: "DangKyKhoaHocs");

            migrationBuilder.DropTable(
                name: "DanhGias");

            migrationBuilder.DropTable(
                name: "DoanhThuGiangViens");

            migrationBuilder.DropTable(
                name: "GhiChuAIs");

            migrationBuilder.DropTable(
                name: "GhiChuBaiHocs");

            migrationBuilder.DropTable(
                name: "GiangVienQuotas");

            migrationBuilder.DropTable(
                name: "GiaoDichThanhToans");

            migrationBuilder.DropTable(
                name: "HoTroRutTienGiangViens");

            migrationBuilder.DropTable(
                name: "KetQuaLamBais");

            migrationBuilder.DropTable(
                name: "LoTrinhAIs");

            migrationBuilder.DropTable(
                name: "MaGiamGiaKhoaHocs");

            migrationBuilder.DropTable(
                name: "MaQuaTangHocViens");

            migrationBuilder.DropTable(
                name: "NhatKySuDungs");

            migrationBuilder.DropTable(
                name: "PhienDangNhap");

            migrationBuilder.DropTable(
                name: "QuaTangKhoaHocs");

            migrationBuilder.DropTable(
                name: "TestCaseThucHanhs");

            migrationBuilder.DropTable(
                name: "ThongBaoEmailThanhToans");

            migrationBuilder.DropTable(
                name: "TienDoBaiHocs");

            migrationBuilder.DropTable(
                name: "VideoQuizs");

            migrationBuilder.DropTable(
                name: "WebhookLogs");

            migrationBuilder.DropTable(
                name: "KetQuaKiemTraChungChis");

            migrationBuilder.DropTable(
                name: "YeuCauRutTienGiangViens");

            migrationBuilder.DropTable(
                name: "KeyAPIs");

            migrationBuilder.DropTable(
                name: "BaiTapThucHanhs");

            migrationBuilder.DropTable(
                name: "DonHangKhoaHocs");

            migrationBuilder.DropTable(
                name: "VideoChapters");

            migrationBuilder.DropTable(
                name: "BaiTaps");

            migrationBuilder.DropTable(
                name: "MaGiamGias");

            migrationBuilder.DropTable(
                name: "BaiHocs");

            migrationBuilder.DropTable(
                name: "ChuongHocs");

            migrationBuilder.DropTable(
                name: "KhoaHocs");

            migrationBuilder.DropTable(
                name: "NguoiDungs");
        }
    }
}
