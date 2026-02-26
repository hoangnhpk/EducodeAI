using educodeai_server.Data;
using educodeai_server.DTOs.BaiTap;
using educodeai_server.Models;
using educodeai_server.Repository.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Repository.Implementation
{
    public class BaiTapRepository : IBaiTapRepository
    {
        private readonly EduCodeAIDbContext _context;

        public BaiTapRepository(EduCodeAIDbContext context)
        {
            _context = context;
        }

        public async Task<List<DanhSachBaiTapDTO>> LayDanhSachBaiTapCuaGiangVienAsync(int maNguoiDung)
        {
            return await _context.BaiTaps
                .Include(b => b.BaiHoc)
                    .ThenInclude(bh => bh.ChuongHoc)
                        .ThenInclude(ch => ch.KhoaHoc)
                .Include(b => b.BaiTap_Quiz)
                .Include(b => b.BaiTap_NgonNgus)

                .Where(b => b.BaiHoc.ChuongHoc.KhoaHoc.MaGiangVien == maNguoiDung)
                .Select(b => new DanhSachBaiTapDTO
                {
                    MaBaiTap = b.MaBaiTap,
                    TenBaiTap = b.BaiTap_Quiz != null ? $"Quiz: {b.BaiHoc.TieuDe}" : $"Thực hành: {b.BaiHoc.TieuDe}",
                    LoaiBaiTap = b.BaiTap_Quiz != null ? "Quiz" : "IDE",
                    TenKhoaHoc = b.BaiHoc.ChuongHoc.KhoaHoc.TenKhoaHoc,
                    TenChuong = b.BaiHoc.ChuongHoc.TenChuong,
                    TenBaiHoc = b.BaiHoc.TieuDe,
                    TrangThai = "Hiển thị"
                })
                .ToListAsync();
        }

        public async Task<int> CreateQuizAsync(BaiTapModel baiTap, BaiTap_QuizModel quiz)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                await _context.BaiTaps.AddAsync(baiTap);
                await _context.SaveChangesAsync();

                quiz.MaBaiTap = baiTap.MaBaiTap;
                await _context.BaiTap_Quizs.AddAsync(quiz);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return quiz.MaBaiTapQuiz;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<BaiTap_QuizModel?> GetQuizDetailAsync(int quizId)
        {
            return await _context.BaiTap_Quizs
                .Include(q => q.BaiTap)
                .Where(q => q.MaBaiTapQuiz == quizId)
                .FirstOrDefaultAsync();
        }

        public async Task<string?> GetNoiDungBaiHocAsync(int maBaiHoc)
        {
            var baiHoc = await _context.BaiHocs
                .Where(b => b.MaBaiHoc == maBaiHoc)
                .Select(b => b.NoiDung)
                .FirstOrDefaultAsync();
            return baiHoc;
        }

        public async Task<List<KhoaHocModel>> GetKhoaHocModelsByGiangVienAsync(int maGiangVien)
        {
            return await _context.KhoaHocs
                .Where(kh => kh.MaGiangVien == maGiangVien)
                .Select(kh => new KhoaHocModel
                {
                    MaKhoaHoc = kh.MaKhoaHoc,
                    TenKhoaHoc = kh.TenKhoaHoc
                })
                .ToListAsync();
        }

        public async Task<List<ChuongHocModel>> GetChuongHocModelsByKhoaHocAsync(int maKhoaHoc)
        {
            return await _context.ChuongHocs
                .Where(ch => ch.MaKhoaHoc == maKhoaHoc)
                .Select(ch => new ChuongHocModel
                {
                    MaChuong = ch.MaChuong,
                    TenChuong = ch.TenChuong
                })
                .ToListAsync();
        }

        public async Task<List<BaiHocModel>> GetBaiHocModelsByChuongHocAsync(int maChuongHoc)
        {
            return await _context.BaiHocs
                .Where(bh => bh.MaChuong == maChuongHoc)
                .Select(bh => new BaiHocModel
                {
                    MaBaiHoc = bh.MaBaiHoc,
                    TieuDe = bh.TieuDe,
                    LoaiBaiHoc = bh.LoaiBaiHoc
                })
                .ToListAsync();
        }

        public async Task<bool> XoaBaiTapAsync(int maBaiTapQuiz)
        {
            var quiz = await _context.BaiTap_Quizs.FindAsync(maBaiTapQuiz);
            if (quiz == null)
                return false;
            _context.BaiTap_Quizs.Remove(quiz);
            var baiTap = await _context.BaiTaps.FindAsync(quiz.MaBaiTap);
            if (baiTap != null)
            {
                _context.BaiTaps.Remove(baiTap);
            }
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
