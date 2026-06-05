using educodeai_server.Data;
using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Repository.Implementation
{
    public class KhoaHocCuaToiRepository : IKhoaHocCuaToiRepository
    {
        private readonly EduCodeAIDbContext _context;

        public KhoaHocCuaToiRepository(EduCodeAIDbContext context)
        {
            _context = context;
        }

        // ===== KHÓA HỌC =====

        public async Task<List<KhoaHocModel>> GetKhoaHocByGiangVienAsync(int maGiangVien)
        {
            return await _context.KhoaHocs
                .Where(k => k.MaGiangVien == maGiangVien && k.TrangThai != "Đã xóa")
                .Include(k => k.DangKyKhoaHocs)
                .ToListAsync();
        }

        public async Task<KhoaHocModel?> GetKhoaHocDetailAsync(int maKhoaHoc, int maGiangVien)
        {
            return await _context.KhoaHocs
                .Where(k => k.MaKhoaHoc == maKhoaHoc && k.MaGiangVien == maGiangVien && k.TrangThai != "Đã xóa")
                .Include(k => k.DangKyKhoaHocs)
                    .ThenInclude(dk => dk.NguoiDung)
                .Include(k => k.ChuongHocs)
                    .ThenInclude(ch => ch.BaiHocs)
                .FirstOrDefaultAsync();
        }

        public async Task<KhoaHocModel?> GetKhoaHocForCertificateAsync(int maKhoaHoc, int maGiangVien)
        {
            return await _context.KhoaHocs
                .Where(k => k.MaKhoaHoc == maKhoaHoc && k.MaGiangVien == maGiangVien && k.TrangThai != "Đã xóa")
                .Include(k => k.ChuongHocs)
                    .ThenInclude(ch => ch.BaiHocs)
                .FirstOrDefaultAsync();
        }

        public async Task AddKhoaHocAsync(KhoaHocModel khoaHoc)
            => await _context.KhoaHocs.AddAsync(khoaHoc);

        public Task UpdateKhoaHocAsync(KhoaHocModel khoaHoc)
        {
            _context.KhoaHocs.Update(khoaHoc);
            return Task.CompletedTask;
        }

        public Task DeleteKhoaHocAsync(KhoaHocModel khoaHoc)
        {
            _context.KhoaHocs.Remove(khoaHoc);
            return Task.CompletedTask;
        }

        // ===== CHƯƠNG =====

        public async Task<ChuongHocModel?> GetChuongByIdAsync(int maChuong)
            => await _context.ChuongHocs.FirstOrDefaultAsync(c => c.MaChuong == maChuong);
        public async Task<ChuongHocModel?> GetChuongWithKhoaHocAsync(int maChuong)
        {
            return await _context.ChuongHocs
                .Include(c => c.KhoaHoc)
                .Include(c => c.BaiHocs)
                .FirstOrDefaultAsync(c => c.MaChuong == maChuong);
        }

        public async Task AddChuongAsync(ChuongHocModel chuong)
            => await _context.ChuongHocs.AddAsync(chuong);

        public Task UpdateChuongAsync(ChuongHocModel chuong)
        {
            _context.ChuongHocs.Update(chuong);
            return Task.CompletedTask;
        }

        public Task DeleteChuongAsync(ChuongHocModel chuong)
        {
            _context.ChuongHocs.Remove(chuong);
            return Task.CompletedTask;
        }

        // ===== VIDEO =====

        public async Task<BaiHocModel?> GetBaiHocByIdAsync(int maBaiHoc)
            => await _context.BaiHocs.FirstOrDefaultAsync(b => b.MaBaiHoc == maBaiHoc);

        public async Task<BaiHocModel?> GetBaiHocWithChuongAsync(int maBaiHoc)
        {
            return await _context.BaiHocs
                .Include(b => b.ChuongHoc)
                    .ThenInclude(c => c.KhoaHoc)
                .FirstOrDefaultAsync(b => b.MaBaiHoc == maBaiHoc);
        }

        public async Task AddBaiHocAsync(BaiHocModel baiHoc)
            => await _context.BaiHocs.AddAsync(baiHoc);

        public Task UpdateBaiHocAsync(BaiHocModel baiHoc)
        {
            _context.BaiHocs.Update(baiHoc);
            return Task.CompletedTask;
        }

        public Task DeleteBaiHocAsync(BaiHocModel baiHoc)
        {
            _context.BaiHocs.Remove(baiHoc);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
            => await _context.SaveChangesAsync();
    }
}
