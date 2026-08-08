using educodeai_server.Data;
using educodeai_server.Models;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Helpers
{
    public static class ThuThachDataInitializer
    {
        private const long AdvisoryLockKey = 2026071801;

        public static async Task InitializeAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<EduCodeAIDbContext>();
            var logger = scope.ServiceProvider
                .GetRequiredService<ILoggerFactory>()
                .CreateLogger(nameof(ThuThachDataInitializer));

            var strategy = db.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await db.Database.BeginTransactionAsync();
                try
                {
                    if (string.Equals(
                        db.Database.ProviderName,
                        "Npgsql.EntityFrameworkCore.PostgreSQL",
                        StringComparison.Ordinal))
                    {
                        await db.Database.ExecuteSqlRawAsync(
                            $"SELECT pg_advisory_xact_lock({AdvisoryLockKey});");
                    }

                    await ThemDanhHieuConThieuAsync(db);
                    await ThemNhiemVuConThieuAsync(db);
                    await db.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    logger.LogError(ex, "Không thể khởi tạo dữ liệu mặc định cho module thử thách.");
                    throw;
                }
            });
        }

        private static async Task ThemDanhHieuConThieuAsync(EduCodeAIDbContext db)
        {
            var maCodeDaCo = await db.DanhHieus
                .AsNoTracking()
                .Select(item => item.MaCode)
                .ToListAsync();
            var existing = maCodeDaCo.ToHashSet(StringComparer.OrdinalIgnoreCase);

            var defaults = new[]
            {
                new DanhHieuModel
                {
                    MaCode = "tan_binh",
                    TenDanhHieu = "Tân binh học tập",
                    MoTa = "Chào mừng bạn đến với hành trình học tập!",
                    ExpYeuCau = 0,
                    ThuTu = 1,
                },
                new DanhHieuModel
                {
                    MaCode = "hoc_gia_tap_su",
                    TenDanhHieu = "Học giả tập sự",
                    MoTa = "Đạt 500 EXP",
                    ExpYeuCau = 500,
                    ThuTu = 2,
                },
                new DanhHieuModel
                {
                    MaCode = "chien_than",
                    TenDanhHieu = "Chiến thần chăm chỉ",
                    MoTa = "Đạt 1.200 EXP",
                    ExpYeuCau = 1200,
                    ThuTu = 3,
                },
                new DanhHieuModel
                {
                    MaCode = "bac_thuyet_trinh",
                    TenDanhHieu = "Bậc thầy kiến thức",
                    MoTa = "Đạt 2.500 EXP",
                    ExpYeuCau = 2500,
                    ThuTu = 4,
                },
                new DanhHieuModel
                {
                    MaCode = "huyen_thoai",
                    TenDanhHieu = "Huyền thoại EduCode",
                    MoTa = "Đạt 5.000 EXP",
                    ExpYeuCau = 5000,
                    ThuTu = 5,
                },
            };

            db.DanhHieus.AddRange(defaults.Where(item => !existing.Contains(item.MaCode)));
        }

        private static async Task ThemNhiemVuConThieuAsync(EduCodeAIDbContext db)
        {
            var maCodeDaCo = await db.MauNhiemVuTuans
                .AsNoTracking()
                .Select(item => item.MaCode)
                .ToListAsync();
            var existing = maCodeDaCo.ToHashSet(StringComparer.OrdinalIgnoreCase);

            var defaults = new[]
            {
                new MauNhiemVuTuanModel
                {
                    MaCode = "hoc_bai",
                    TieuDe = "Chiến thần chăm chỉ",
                    MoTa = "Xem 3 bài học khác nhau trong tuần",
                    Icon = "book",
                    LoaiDem = "hoc_bai",
                    ChiTieu = 3,
                    ExpThuong = 50,
                    ThuTu = 1,
                    DangHoatDong = true,
                },
                new MauNhiemVuTuanModel
                {
                    MaCode = "gio_hoc",
                    TieuDe = "Marathon học tập",
                    MoTa = "Tích lũy 12 tiếng học trong tuần",
                    Icon = "clock",
                    LoaiDem = "gio_hoc",
                    ChiTieu = 720,
                    ExpThuong = 30,
                    ThuTu = 2,
                    DangHoatDong = true,
                },
                new MauNhiemVuTuanModel
                {
                    MaCode = "quiz",
                    TieuDe = "Kiểm tra đầu tuần",
                    MoTa = "Hoàn thành 1 bài quiz",
                    Icon = "quiz",
                    LoaiDem = "quiz",
                    ChiTieu = 1,
                    ExpThuong = 40,
                    ThuTu = 3,
                    DangHoatDong = true,
                },
                new MauNhiemVuTuanModel
                {
                    MaCode = "ngay_hoc",
                    TieuDe = "Duy trì nhịp học",
                    MoTa = "Học ít nhất 3 ngày khác nhau trong tuần",
                    Icon = "calendar",
                    LoaiDem = "ngay_hoc",
                    ChiTieu = 3,
                    ExpThuong = 35,
                    ThuTu = 4,
                    DangHoatDong = true,
                },
                new MauNhiemVuTuanModel
                {
                    MaCode = "xuat_sac",
                    TieuDe = "Hoàn thành xuất sắc",
                    MoTa = "Hoàn thành tất cả nhiệm vụ tuần này",
                    Icon = "trophy",
                    LoaiDem = "hoan_thanh_tat_ca",
                    ChiTieu = 1,
                    ExpThuong = 100,
                    ThuTu = 5,
                    DangHoatDong = true,
                },
            };

            db.MauNhiemVuTuans.AddRange(defaults.Where(item => !existing.Contains(item.MaCode)));
        }
    }
}
