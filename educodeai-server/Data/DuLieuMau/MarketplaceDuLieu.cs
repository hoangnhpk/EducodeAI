using educodeai_server.Models;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Data.DuLieuMau
{
    public static class MarketplaceDuLieu
    {
        public static void SeedMarketplace(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<MaGiamGiaModel>().HasData(
                new MaGiamGiaModel
                {
                    MaVoucher = 1,
                    Code = "WELCOME10",
                    TenChuongTrinh = "Giảm giá chào mừng",
                    LoaiGiamGia = "PERCENT",
                    GiaTriGiam = 10,
                    GiamToiDa = 3000,
                    DonHangToiThieu = 10000,
                    SoLuongToiDa = 1000,
                    SoLuongDaDung = 1,
                    KichHoat = true,
                    BatDauAt = new DateTime(2026, 1, 1),
                    KetThucAt = new DateTime(2026, 12, 31)
                },
                new MaGiamGiaModel
                {
                    MaVoucher = 2,
                    Code = "MARKET500",
                    TenChuongTrinh = "Giảm thẳng marketplace",
                    LoaiGiamGia = "FIXED",
                    GiaTriGiam = 500,
                    GiamToiDa = null,
                    DonHangToiThieu = 10000,
                    SoLuongToiDa = 500,
                    SoLuongDaDung = 0,
                    KichHoat = true,
                    BatDauAt = new DateTime(2026, 1, 1),
                    KetThucAt = new DateTime(2026, 12, 31)
                }
            );

            modelBuilder.Entity<DonHangKhoaHocModel>().HasData(
                new DonHangKhoaHocModel
                {
                    MaDonHang = 1,
                    MaNguoiDung = 3,
                    TongTien = 21000,
                    LoaiTien = "VND",
                    TrangThaiDonHang = "PAID",
                    IdempotencyKey = "seed-order-2026-0001",
                    CreatedAt = new DateTime(2026, 4, 1, 9, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 4, 1, 9, 10, 0, DateTimeKind.Utc),
                    ExpiredAt = new DateTime(2026, 4, 1, 9, 30, 0, DateTimeKind.Utc)
                },
                new DonHangKhoaHocModel
                {
                    MaDonHang = 2,
                    MaNguoiDung = 3,
                    TongTien = 14900,
                    LoaiTien = "VND",
                    TrangThaiDonHang = "PENDING",
                    IdempotencyKey = "seed-order-2026-0002",
                    CreatedAt = new DateTime(2026, 4, 2, 10, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 4, 2, 10, 0, 0, DateTimeKind.Utc),
                    ExpiredAt = new DateTime(2026, 4, 2, 10, 30, 0, DateTimeKind.Utc)
                }
            );

            modelBuilder.Entity<ChiTietDonHangModel>().HasData(
                new ChiTietDonHangModel
                {
                    MaChiTiet = 1,
                    MaDonHang = 1,
                    MaKhoaHoc = 1,
                    DonGia = 12000,
                    GiamGia = 500,
                    ThanhTien = 11500
                },
                new ChiTietDonHangModel
                {
                    MaChiTiet = 2,
                    MaDonHang = 1,
                    MaKhoaHoc = 2,
                    DonGia = 10000,
                    GiamGia = 500,
                    ThanhTien = 9500
                },
                new ChiTietDonHangModel
                {
                    MaChiTiet = 3,
                    MaDonHang = 2,
                    MaKhoaHoc = 5,
                    DonGia = 14900,
                    GiamGia = 0,
                    ThanhTien = 14900
                }
            );

            modelBuilder.Entity<GiaoDichThanhToanModel>().HasData(
                new GiaoDichThanhToanModel
                {
                    MaGiaoDich = 1,
                    MaDonHang = 1,
                    CongThanhToan = "PAYOS",
                    MaThamChieuNgoai = "PAYOS-SEED-0001",
                    SoTien = 21000,
                    TrangThai = "SUCCESS",
                    RawWebhook = "{\"event\":\"payment.succeeded\",\"provider\":\"PAYOS\"}",
                    PaidAt = new DateTime(2026, 4, 1, 9, 10, 0, DateTimeKind.Utc),
                    CreatedAt = new DateTime(2026, 4, 1, 9, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 4, 1, 9, 10, 0, DateTimeKind.Utc)
                },
                new GiaoDichThanhToanModel
                {
                    MaGiaoDich = 2,
                    MaDonHang = 2,
                    CongThanhToan = "PAYOS",
                    MaThamChieuNgoai = "PAYOS-SEED-0002",
                    SoTien = 14900,
                    TrangThai = "INITIATED",
                    RawWebhook = null,
                    PaidAt = null,
                    CreatedAt = new DateTime(2026, 4, 2, 10, 0, 0, DateTimeKind.Utc),
                    UpdatedAt = new DateTime(2026, 4, 2, 10, 0, 0, DateTimeKind.Utc)
                }
            );

            modelBuilder.Entity<DoanhThuGiangVienModel>().HasData(
                new DoanhThuGiangVienModel
                {
                    MaDoanhThu = 1,
                    MaGiangVien = 1,
                    MaDonHang = 1,
                    TongTienDonHang = 21000,
                    PhiNenTang = 4200,
                    ThucNhanGiangVien = 16800,
                    TrangThaiDoiSoat = "PENDING",
                    CreatedAt = new DateTime(2026, 4, 1, 9, 20, 0, DateTimeKind.Utc)
                }
            );
        }
    }
}
