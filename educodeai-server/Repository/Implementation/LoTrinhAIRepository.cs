using educodeai_server.Repository.Interface;
using educodeai_server.Data;
using educodeai_server.Models;
using Microsoft.EntityFrameworkCore;
using educodeai_server.DTOs.AI;

namespace educodeai_server.Repository.Implementation
{
    public class LoTrinhAIRepository : ILoTrinhAIRepository
    {
        private readonly EduCodeAIDbContext _context;

        public LoTrinhAIRepository(EduCodeAIDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(LoTrinhAIModel loTrinh)
        {
            _context.LoTrinhAIs.Add(loTrinh);
            await _context.SaveChangesAsync();
        }

        public async Task<LoTrinhAIModel?> GetByIdAsync(int maLoTrinh)
        {
            return await _context.LoTrinhAIs.FindAsync(maLoTrinh);
        }

        public async Task UpdateAsync(LoTrinhAIModel loTrinh)
        {
            _context.LoTrinhAIs.Update(loTrinh);
            await _context.SaveChangesAsync();
        }

        public async Task<List<LoTrinhAIModel>> GetByUserIdAsync(int maNguoiDung)
        {
            return await _context.LoTrinhAIs
                .Where(x => x.MaNguoiDung == maNguoiDung && x.TrangThai == "Hoạt động")
                .ToListAsync();
        }

    }

}
