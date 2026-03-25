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
            return await _context.KeyAPIs
                .OrderBy(k => k.ThuTuUuTien)
                .Select(k => new KeyAPISummaryDto
                {
                    ID = k.ID,
                    TenKey = k.TenKey,
                    LoaiKey = k.LoaiKey,
                    TrangThai = k.TrangThai,
                    ThuTuUuTien = k.ThuTuUuTien
                })
                .ToListAsync();
        }

        public async Task<KeyAPISummaryDto?> GetByIdAsync(int id)
        {
            var k = await _context.KeyAPIs.FindAsync(id);
            if (k == null) return null;

            return new KeyAPISummaryDto
            {
                ID = k.ID,
                TenKey = k.TenKey,
                LoaiKey = k.LoaiKey,
                TrangThai = k.TrangThai,
                ThuTuUuTien = k.ThuTuUuTien
            };
        }

        public async Task<bool> CreateKeyAsync(KeyAPIManageDto dto)
        {
            var newKey = new KeyAPIModel
            {
                TenKey = dto.TenKey,
                // 🔥 Gọi Helper mã hóa thủ công AES-256 ngay tại đây
                MaKeyMaHoa = MaHoaHelper.MaHoa(dto.MaKeyRaw, _secretKey),
                LoaiKey = dto.LoaiKey,
                TrangThai = true,
                ThuTuUuTien = dto.ThuTuUuTien,
                HanMucRequest = dto.HanMucRequest,
                HanMucToken = dto.HanMucToken,
                NgayTao = DateTime.Now
            };

            await _context.KeyAPIs.AddAsync(newKey);
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
