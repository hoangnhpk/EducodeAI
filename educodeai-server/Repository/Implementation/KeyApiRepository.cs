using System.Security.Cryptography;
using System.Text;
using educodeai_server.Data;
using educodeai_server.DTOs.AI;
using educodeai_server.Helpers;
using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Repository.Implementation
{
    public class KeyApiRepository : IKeyApiRepository
    {
        private readonly EduCodeAIDbContext _context;
        private readonly string _secretKey;

        public KeyApiRepository(EduCodeAIDbContext context, IConfiguration configuration)
        {
            _context = context;
            _secretKey = configuration["ApiSecurity:SecretKey"]!;
        }

        public async Task<IEnumerable<KeyAPISummaryDto?>> GetSummaryListAsync()
        {
            var todayUtc = DateTime.UtcNow.Date;

            var rawList = await _context.KeyAPIs
                .Where(k => k.DeletedAt == null)
                .OrderBy(k => k.ThuTuUuTien)
                .Select(k => new
                {
                    k.ID,
                    k.TenKey,
                    k.LoaiKey,
                    k.TrangThai,
                    k.ThuTuUuTien,
                    k.RPMLimit,
                    k.TPMLimit,
                    k.RPDLimit,
                    k.ModelSuDung,
                    k.MaKeyMaHoa,
                    // Đếm usage trong ngày hôm nay (UTC) cho RPD
                    DaSuDungRequestHomNay = k.NhatKySuDungs.Count(n => n.ThoiGianGoi >= todayUtc && (k.LastUsageResetAt == null || n.ThoiGianGoi >= k.LastUsageResetAt)),
                    DaSuDungTokenHomNay = k.NhatKySuDungs
                        .Where(n => n.ThoiGianGoi >= todayUtc && (k.LastUsageResetAt == null || n.ThoiGianGoi >= k.LastUsageResetAt))
                        .Sum(n => (int?)n.SoTokenTieuHao) ?? 0
                })
                .ToListAsync();

            return rawList.Select(k => new KeyAPISummaryDto
            {
                ID = k.ID,
                TenKey = k.TenKey,
                LoaiKey = k.LoaiKey,
                TrangThai = k.TrangThai,
                ThuTuUuTien = k.ThuTuUuTien,
                RPMLimit = k.RPMLimit,
                TPMLimit = k.TPMLimit,
                RPDLimit = k.RPDLimit,
                ModelSuDung = k.ModelSuDung,
                MaKeyMasked = MaskKey(MaHoaHelper.GiaiMa(k.MaKeyMaHoa, _secretKey)),
                DaSuDungRequestHomNay = k.DaSuDungRequestHomNay,
                DaSuDungTokenHomNay = k.DaSuDungTokenHomNay,
                PhanTramRPD = k.RPDLimit > 0
                    ? Math.Round((double)k.DaSuDungRequestHomNay / k.RPDLimit * 100, 2)
                    : 0,
                DangBiCooldown = false // Phase 7B sẽ check Redis cooldown
            });
        }

        public async Task<KeyAPISummaryDto?> GetByIdAsync(int id)
        {
            var todayUtc = DateTime.UtcNow.Date;

            var rawKey = await _context.KeyAPIs
                .Where(k => k.ID == id && k.DeletedAt == null)
                .Select(k => new
                {
                    k.ID,
                    k.TenKey,
                    k.LoaiKey,
                    k.TrangThai,
                    k.ThuTuUuTien,
                    k.RPMLimit,
                    k.TPMLimit,
                    k.RPDLimit,
                    k.ModelSuDung,
                    k.MaKeyMaHoa,
                    DaSuDungRequestHomNay = k.NhatKySuDungs.Count(n => n.ThoiGianGoi >= todayUtc && (k.LastUsageResetAt == null || n.ThoiGianGoi >= k.LastUsageResetAt)),
                    DaSuDungTokenHomNay = k.NhatKySuDungs
                        .Where(n => n.ThoiGianGoi >= todayUtc && (k.LastUsageResetAt == null || n.ThoiGianGoi >= k.LastUsageResetAt))
                        .Sum(n => (int?)n.SoTokenTieuHao) ?? 0
                })
                .FirstOrDefaultAsync();

            if (rawKey == null) return null;

            return new KeyAPISummaryDto
            {
                ID = rawKey.ID,
                TenKey = rawKey.TenKey,
                LoaiKey = rawKey.LoaiKey,
                TrangThai = rawKey.TrangThai,
                ThuTuUuTien = rawKey.ThuTuUuTien,
                RPMLimit = rawKey.RPMLimit,
                TPMLimit = rawKey.TPMLimit,
                RPDLimit = rawKey.RPDLimit,
                ModelSuDung = rawKey.ModelSuDung,
                MaKeyMasked = MaskKey(MaHoaHelper.GiaiMa(rawKey.MaKeyMaHoa, _secretKey)),
                DaSuDungRequestHomNay = rawKey.DaSuDungRequestHomNay,
                DaSuDungTokenHomNay = rawKey.DaSuDungTokenHomNay,
                PhanTramRPD = rawKey.RPDLimit > 0
                    ? Math.Round((double)rawKey.DaSuDungRequestHomNay / rawKey.RPDLimit * 100, 2)
                    : 0,
                DangBiCooldown = false
            };
        }

        public async Task<int> CreateKeyAsync(KeyAPIManageDto dto)
        {
            var newKey = new KeyAPIModel
            {
                TenKey = dto.TenKey,
                MaKeyMaHoa = MaHoaHelper.MaHoa(dto.MaKeyRaw, _secretKey),
                LoaiKey = dto.LoaiKey,
                TrangThai = true,
                ThuTuUuTien = dto.ThuTuUuTien,
                RPMLimit = dto.RPMLimit,
                TPMLimit = dto.TPMLimit,
                RPDLimit = dto.RPDLimit,
                ModelSuDung = dto.ModelSuDung,
                NgayTao = DateTime.UtcNow
            };

            await _context.KeyAPIs.AddAsync(newKey);
            var isSaved = await _context.SaveChangesAsync() > 0;
            return isSaved ? newKey.ID : 0;
        }

        public async Task<bool> UpdateKeyAsync(int id, KeyAPIManageDto dto, int adminId, string? ipAddress)
        {
            var key = await _context.KeyAPIs.FirstOrDefaultAsync(k => k.ID == id && k.DeletedAt == null);
            if (key == null) return false;

            string beforeJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                key.TenKey, key.LoaiKey, key.ThuTuUuTien,
                key.RPMLimit, key.TPMLimit, key.RPDLimit, key.ModelSuDung, key.TrangThai
            });

            key.TenKey = dto.TenKey;
            key.LoaiKey = dto.LoaiKey;
            key.ThuTuUuTien = dto.ThuTuUuTien;
            key.RPMLimit = dto.RPMLimit;
            key.TPMLimit = dto.TPMLimit;
            key.RPDLimit = dto.RPDLimit;
            key.ModelSuDung = dto.ModelSuDung;

            if (!string.IsNullOrWhiteSpace(dto.MaKeyRaw))
            {
                key.MaKeyMaHoa = MaHoaHelper.MaHoa(dto.MaKeyRaw, _secretKey);
            }

            string afterJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                key.TenKey, key.LoaiKey, key.ThuTuUuTien,
                key.RPMLimit, key.TPMLimit, key.RPDLimit, key.ModelSuDung, key.TrangThai
            });

            var auditLog = new ApiKeyAuditLog
            {
                Action = AuditAction.UPDATE_KEY,
                AdminId = adminId,
                KeyApiId = id,
                BeforeJson = beforeJson,
                AfterJson = afterJson,
                IpAddress = ipAddress,
                CreatedAt = DateTime.UtcNow
            };
            await _context.ApiKeyAuditLogs.AddAsync(auditLog);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateStatusAsync(int id, bool status, int adminId, string? ipAddress)
        {
            var key = await _context.KeyAPIs.FirstOrDefaultAsync(k => k.ID == id && k.DeletedAt == null);
            if (key == null) return false;

            string beforeJson = System.Text.Json.JsonSerializer.Serialize(new { key.TrangThai });
            key.TrangThai = status;
            string afterJson = System.Text.Json.JsonSerializer.Serialize(new { key.TrangThai });

            var auditLog = new ApiKeyAuditLog
            {
                Action = AuditAction.TOGGLE_STATUS,
                AdminId = adminId,
                KeyApiId = id,
                BeforeJson = beforeJson,
                AfterJson = afterJson,
                IpAddress = ipAddress,
                CreatedAt = DateTime.UtcNow
            };
            await _context.ApiKeyAuditLogs.AddAsync(auditLog);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> SoftDeleteKeyAsync(int id, int adminId, string? ipAddress)
        {
            var key = await _context.KeyAPIs.FirstOrDefaultAsync(k => k.ID == id && k.DeletedAt == null);
            if (key == null) return false;

            string beforeJson = System.Text.Json.JsonSerializer.Serialize(new { key.TrangThai, key.DeletedAt });
            
            key.DeletedAt = DateTime.UtcNow;
            key.DeletedBy = adminId;
            key.TrangThai = false; // Cũng tắt luôn

            string afterJson = System.Text.Json.JsonSerializer.Serialize(new { key.TrangThai, key.DeletedAt, key.DeletedBy });

            var auditLog = new ApiKeyAuditLog
            {
                Action = AuditAction.SOFT_DELETE,
                AdminId = adminId,
                KeyApiId = id,
                BeforeJson = beforeJson,
                AfterJson = afterJson,
                IpAddress = ipAddress,
                CreatedAt = DateTime.UtcNow
            };
            await _context.ApiKeyAuditLogs.AddAsync(auditLog);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<KeyAPIModel?> GetRawKeyForRedisAsync(int id)
        {
            return await _context.KeyAPIs.FirstOrDefaultAsync(k => k.ID == id && k.DeletedAt == null);
        }

        public async Task<IEnumerable<KeyAPIModel>> GetActiveKeysAsync()
        {
            return await _context.KeyAPIs
                .Where(k => k.TrangThai && k.DeletedAt == null)
                .ToListAsync();
        }

        public async Task<bool> ResetKeyUsageAsync(int id, int adminId, string? ipAddress)
        {
            var key = await _context.KeyAPIs.FirstOrDefaultAsync(k => k.ID == id && k.DeletedAt == null && k.TrangThai == true);
            if (key == null) return false;

            string beforeJson = System.Text.Json.JsonSerializer.Serialize(new { key.LastUsageResetAt });
            key.LastUsageResetAt = DateTime.UtcNow;
            string afterJson = System.Text.Json.JsonSerializer.Serialize(new { key.LastUsageResetAt });

            var auditLog = new ApiKeyAuditLog
            {
                Action = AuditAction.RESET_USAGE,
                AdminId = adminId,
                KeyApiId = id,
                BeforeJson = beforeJson,
                AfterJson = afterJson,
                MetadataJson = System.Text.Json.JsonSerializer.Serialize(new { reason = "manual_reset", redisReset = true }),
                IpAddress = ipAddress,
                CreatedAt = DateTime.UtcNow
            };
            await _context.ApiKeyAuditLogs.AddAsync(auditLog);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<ApiKeyRevealDto?> RevealKeyAsync(int id, int adminId, string? ipAddress)
        {
            var key = await _context.KeyAPIs.FirstOrDefaultAsync(k => k.ID == id && k.DeletedAt == null);
            if (key == null) return null;

            var auditLog = new ApiKeyAuditLog
            {
                Action = AuditAction.REVEAL_KEY,
                AdminId = adminId,
                KeyApiId = id,
                MetadataJson = System.Text.Json.JsonSerializer.Serialize(new { maskedKey = MaskKey(MaHoaHelper.GiaiMa(key.MaKeyMaHoa, _secretKey)), revealedAt = DateTime.UtcNow, reason = "manual_reveal" }),
                IpAddress = ipAddress,
                CreatedAt = DateTime.UtcNow
            };
            await _context.ApiKeyAuditLogs.AddAsync(auditLog);
            await _context.SaveChangesAsync();

            return new ApiKeyRevealDto
            {
                Id = key.ID,
                MaKeyFull = MaHoaHelper.GiaiMa(key.MaKeyMaHoa, _secretKey),
                RevealedAt = DateTime.UtcNow
            };
        }

        public async Task AddAuditLogAsync(ApiKeyAuditLog log)
        {
            await _context.ApiKeyAuditLogs.AddAsync(log);
            await _context.SaveChangesAsync();
        }

        private string MaskKey(string? fullKey)
        {
            if (string.IsNullOrEmpty(fullKey) || fullKey.Length < 8) return "********";
            return fullKey.Substring(0, 3) + "..." + fullKey.Substring(fullKey.Length - 4);
        }
    }
}
