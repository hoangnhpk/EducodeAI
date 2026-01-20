using educodeai_server.Repository.Interface;
using educodeai_server.Data;
using educodeai_server.Models;

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
    }

}
