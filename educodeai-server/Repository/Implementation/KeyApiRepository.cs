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
            var rawList = await _context.KeyAPIs
                .OrderBy(k => k.ThuTuUuTien)
                .Select(k => new 
                {
                    k.ID,
                    k.TenKey,
                    k.LoaiKey,
                    k.TrangThai,
                    k.ThuTuUuTien,
                    k.HanMucRequest,
                    k.HanMucToken,
                    k.MaKeyMaHoa,
                    DaSuDungRequest = k.NhatKySuDungs.Count(),
                    DaSuDungToken = k.NhatKySuDungs.Sum(n => (int?)n.SoTokenTieuHao) ?? 0
                })
                .ToListAsync();

            return rawList.Select(k => new KeyAPISummaryDto
            {
                ID = k.ID,
                TenKey = k.TenKey,
                LoaiKey = k.LoaiKey,
                TrangThai = k.TrangThai,
                ThuTuUuTien = k.ThuTuUuTien,
                HanMucRequest = k.HanMucRequest,
                HanMucToken = k.HanMucToken,
                DaSuDungRequest = k.DaSuDungRequest,
                DaSuDungToken = k.DaSuDungToken,
                MaKeyFull = MaHoaHelper.GiaiMa(k.MaKeyMaHoa, _secretKey),
                PhanTramSuDung = k.HanMucRequest > 0 
                                 ? Math.Round((double)k.DaSuDungRequest / k.HanMucRequest * 100, 2) 
                                 : 0
            });
        }

        public async Task<KeyAPISummaryDto?> GetByIdAsync(int id)
        {
            var rawKey = await _context.KeyAPIs
                .Where(k => k.ID == id)
                .Select(k => new
                {
                    k.ID,
                    k.TenKey,
                    k.LoaiKey,
                    k.TrangThai,
                    k.ThuTuUuTien,
                    k.HanMucRequest,
                    k.HanMucToken,
                    k.MaKeyMaHoa,
                    DaSuDungRequest = k.NhatKySuDungs.Count(),
                    DaSuDungToken = k.NhatKySuDungs.Sum(n => (int?)n.SoTokenTieuHao) ?? 0
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
                HanMucRequest = rawKey.HanMucRequest,
                HanMucToken = rawKey.HanMucToken,
                DaSuDungRequest = rawKey.DaSuDungRequest,
                DaSuDungToken = rawKey.DaSuDungToken,
                MaKeyFull = MaHoaHelper.GiaiMa(rawKey.MaKeyMaHoa, _secretKey),
                PhanTramSuDung = rawKey.HanMucRequest > 0 
                                 ? Math.Round((double)rawKey.DaSuDungRequest / rawKey.HanMucRequest * 100, 2) 
                                 : 0
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
                HanMucRequest = dto.HanMucRequest,
                HanMucToken = dto.HanMucToken,
                NgayTao = DateTime.Now
            };

            await _context.KeyAPIs.AddAsync(newKey);
            var isSaved = await _context.SaveChangesAsync() > 0;
            return isSaved ? newKey.ID : 0;
        }

        public async Task<bool> UpdateKeyAsync(int id, KeyAPIManageDto dto)
        {
            var key = await _context.KeyAPIs.FindAsync(id);
            if (key == null) return false;

            key.TenKey = dto.TenKey;
            key.LoaiKey = dto.LoaiKey;
            key.ThuTuUuTien = dto.ThuTuUuTien;
            key.HanMucRequest = dto.HanMucRequest;
            key.HanMucToken = dto.HanMucToken;
            
            if (!string.IsNullOrWhiteSpace(dto.MaKeyRaw))
            {
                key.MaKeyMaHoa = MaHoaHelper.MaHoa(dto.MaKeyRaw, _secretKey);
            }

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateStatusAsync(int id, bool status)
        {
            var key = await _context.KeyAPIs.FindAsync(id);
            if (key == null) return false;

            key.TrangThai = status;
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteKeyAsync(int id)
        {
            var key = await _context.KeyAPIs.FindAsync(id);
            if (key == null) return false;

            _context.KeyAPIs.Remove(key);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<KeyAPIModel?> GetRawKeyForRedisAsync(int id)
        {
            return await _context.KeyAPIs.FindAsync(id);
        }
    }
}
