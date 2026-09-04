using educodeai_server.Data;
using educodeai_server.DTOs.NapTienAI;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class NapTienAIService : INapTienAIService
    {
        private readonly EduCodeAIDbContext _context;
        private readonly ICurrencyExchangeService _currencyExchange;
        private readonly IRutTienGiangVienService _rutTienService;
        private readonly ILogger<NapTienAIService> _logger;

        public NapTienAIService(
            EduCodeAIDbContext context,
            ICurrencyExchangeService currencyExchange,
            IRutTienGiangVienService rutTienService,
            ILogger<NapTienAIService> logger)
        {
            _context = context;
            _currencyExchange = currencyExchange;
            _rutTienService = rutTienService;
            _logger = logger;
        }

        public async Task<ThongTinViAIDTO> LayThongTinViAIAsync(int maGiangVien)
        {
            var quota = await _context.GiangVienQuotas
                .AsNoTracking()
                .FirstOrDefaultAsync(q => q.MaGiangVien == maGiangVien);

            var soDuAiBalanceUsd = quota?.AiBalanceUsd ?? 0;

            var (tongDoanhThu, tongDangChoRut, _) = await TinhToanSoDuViAsync(maGiangVien);
            var soDuVndKhaDung = tongDoanhThu - tongDangChoRut;

            var tyGiaHienTai = await _currencyExchange.GetUsdToVndRateAsync();

            return new ThongTinViAIDTO
            {
                SoDuAiBalanceUsd = soDuAiBalanceUsd,
                SoDuVndKhaDung = soDuVndKhaDung,
                TyGiaHienTai = tyGiaHienTai
            };
        }

        public async Task<KetQuaNapTienAIDTO> NapTienVaoViAIAsync(int maGiangVien, YeuCauNapTienAIDTO yeuCau)
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                // 1. Tạo hoặc lấy quota và khóa bản ghi để cập nhật nguyên tử
                var quota = await _context.GiangVienQuotas
                    .FirstOrDefaultAsync(q => q.MaGiangVien == maGiangVien);

                if (quota == null)
                {
                    quota = new GiangVienQuotaModel { MaGiangVien = maGiangVien };
                    _context.GiangVienQuotas.Add(quota);
                }

                // 2. Validate số dư VND từ doanh thu và lịch sử quy đổi AI
                var (tongDoanhThu, tongDangChoRut, _) = await TinhToanSoDuViAsync(maGiangVien);
                var tongDaNapAI = await TongTienDaNapAIAsync(maGiangVien);
                var soDuKhaDung = tongDoanhThu - tongDangChoRut - tongDaNapAI;
                if (yeuCau.SoTienVnd <= 0 || yeuCau.SoTienVnd > soDuKhaDung)
                {
                    throw new ApplicationException($"Số dư VND không đủ. Số dư khả dụng: {soDuKhaDung:N0} VND");
                }

                // 3. Quy đổi VND -> USD
                var tyGia = await _currencyExchange.GetUsdToVndRateAsync();
                var soTienUsd = yeuCau.SoTienVnd / tyGia;

                // 4. Cộng tiền vào AI Balance
                quota.AiBalanceUsd += soTienUsd;
                quota.UpdatedAt = DateTime.UtcNow;

                // 5. Ghi lịch sử (không cần tạo bản ghi DoanhThuGiangVien vì đây là giao dịch nội bộ)
                var lichSu = new LichSuNapTienAIModel
                {
                    MaGiangVien = maGiangVien,
                    SoTienVnd = yeuCau.SoTienVnd,
                    SoTienUsd = soTienUsd,
                    TyGiaApDung = tyGia,
                    TrangThai = "THANH_CONG",
                    CreatedAt = DateTime.UtcNow
                };
                _context.LichSuNapTienAIs.Add(lichSu);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation(
                    "Giảng viên {MaGiangVien} nạp {SoTienVnd} VND -> {SoTienUsd} USD, tỷ giá {TyGia}",
                    maGiangVien, yeuCau.SoTienVnd, soTienUsd, tyGia);

                // Tính số dư mới
                var (tongDoanhThuMoi, tongDangChoRutMoi, _) = await TinhToanSoDuViAsync(maGiangVien);
                var tongDaNapAIMoi = await TongTienDaNapAIAsync(maGiangVien);

                return new KetQuaNapTienAIDTO
                {
                    MaGiaoDich = lichSu.MaGiaoDich,
                    SoTienVnd = yeuCau.SoTienVnd,
                    SoTienUsd = soTienUsd,
                    TyGiaApDung = tyGia,
                    SoDuAiBalanceUsdMoi = quota.AiBalanceUsd,
                    SoDuVndKhaDungMoi = tongDoanhThuMoi - tongDangChoRutMoi - tongDaNapAIMoi,
                    CreatedAt = lichSu.CreatedAt
                };
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "Lỗi khi nạp tiền AI cho giảng viên {MaGiangVien}", maGiangVien);
                    throw;
                }
            });
        }

        public async Task<List<LichSuNapTienAIItemDTO>> LayLichSuNapTienAIAsync(int maGiangVien)
        {
            var lichSu = await _context.LichSuNapTienAIs
                .AsNoTracking()
                .Where(x => x.MaGiangVien == maGiangVien)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new LichSuNapTienAIItemDTO
                {
                    MaGiaoDich = x.MaGiaoDich,
                    SoTienVnd = x.SoTienVnd,
                    SoTienUsd = x.SoTienUsd,
                    TyGiaApDung = x.TyGiaApDung,
                    TrangThai = x.TrangThai,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();

            return lichSu;
        }

        private async Task<decimal> TongTienDaNapAIAsync(int maGiangVien)
        {
            return await _context.LichSuNapTienAIs
                .Where(x => x.MaGiangVien == maGiangVien && x.TrangThai == "THANH_CONG")
                .SumAsync(x => x.SoTienVnd);
        }

        private async Task<(decimal tongDoanhThu, decimal tongDangChoRut, decimal tongDaChuyenKhoan)> TinhToanSoDuViAsync(int maGiangVien)
        {
            var tongDoanhThu = await _context.DoanhThuGiangViens
                .Where(d => d.MaGiangVien == maGiangVien)
                .SumAsync(d => d.ThucNhanGiangVien);

            var danhSachYeuCau = await _context.YeuCauRutTienGiangViens
                .Where(y => y.MaGiangVien == maGiangVien)
                .ToListAsync();

            var tongDangChoRut = danhSachYeuCau
                .Where(y => y.TrangThaiYeuCau == "CHO_DUYET" || y.TrangThaiYeuCau == "DA_DUYET")
                .Sum(y => y.SoTienYeuCau);

            var tongDaChuyenKhoan = danhSachYeuCau
                .Where(y => y.TrangThaiYeuCau == "DA_CHUYEN_KHOAN")
                .Sum(y => y.SoTienDaChuyen ?? y.SoTienYeuCau);

            return (tongDoanhThu, tongDangChoRut, tongDaChuyenKhoan);
        }
    }
}
