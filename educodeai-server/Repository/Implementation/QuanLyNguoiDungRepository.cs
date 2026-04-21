using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using educodeai_server.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace educodeai_server.Repository.Implementation
{
    public class QuanLyNguoiDungRepository : IQuanLyNguoiDungRepository
    {
        private readonly EduCodeAIDbContext _context;

        public QuanLyNguoiDungRepository(EduCodeAIDbContext context)
        {
            _context = context;
        }

        public async Task<List<NguoiDungModel>> LayTatCaAsync()
        {
            return await _context.NguoiDungs
                .Include(u => u.DanhSachPhienDangNhap)
                .ToListAsync();
        }

        public async Task<NguoiDungModel?> LayTheoIdAsync(int maNguoiDung)
        {
            return await _context.NguoiDungs
                .Include(u => u.DanhSachPhienDangNhap)
                .FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiDung);
        }

        public async Task<bool> ThemMoiAsync(NguoiDungModel nguoiDung)
        {
            _context.NguoiDungs.Add(nguoiDung);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> CapNhatAsync(NguoiDungModel nguoiDung)
        {
            _context.NguoiDungs.Update(nguoiDung);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> XoaAsync(NguoiDungModel nguoiDung)
        {
            _context.NguoiDungs.Remove(nguoiDung);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}