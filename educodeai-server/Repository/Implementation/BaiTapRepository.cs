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
            var executionStrategy = _context.Database.CreateExecutionStrategy();

            return await executionStrategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();

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
            });
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

        public async Task<bool> CapNhatQuizAsync(int maBaiTap, int maGiangVien, CreateQuizDTO dto)
        {
            var quiz = await _context.BaiTap_Quizs
                .Include(q => q.BaiTap)
                    .ThenInclude(bt => bt.BaiHoc)
                        .ThenInclude(bh => bh.ChuongHoc)
                            .ThenInclude(ch => ch.KhoaHoc)
                .FirstOrDefaultAsync(q => q.MaBaiTap == maBaiTap && q.BaiTap.BaiHoc.ChuongHoc.KhoaHoc.MaGiangVien == maGiangVien);

            if (quiz == null) return false;

            quiz.ThoiGianLamBai = dto.ThoiGianLamBai;
            quiz.DiemCanDat = dto.DiemCanDat;
            quiz.ChoPhepLamLai = dto.ChoPhepLamLai;
            quiz.DaoCauHoi = dto.DaoCauHoi;
            quiz.DuLieuCauHoi = dto.DuLieuCauHoi;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> XoaBaiTapAsync(int maBaiTap, int maGiangVien)
        {
            var baiTap = await _context.BaiTaps
                .Include(b => b.BaiHoc)
                    .ThenInclude(bh => bh.ChuongHoc)
                        .ThenInclude(ch => ch.KhoaHoc)
                .Include(b => b.BaiTap_Quiz)
                .FirstOrDefaultAsync(b => b.MaBaiTap == maBaiTap && b.BaiHoc.ChuongHoc.KhoaHoc.MaGiangVien == maGiangVien);

            if (baiTap == null) return false;

            if (baiTap.BaiTap_Quiz != null)
            {
                _context.BaiTap_Quizs.Remove(baiTap.BaiTap_Quiz);
            }

            _context.BaiTaps.Remove(baiTap);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> KiemTraBaiHocThuocGiangVienAsync(int maBaiHoc, int maGiangVien)
        {
            return await _context.BaiHocs
                .AnyAsync(bh => bh.MaBaiHoc == maBaiHoc && bh.ChuongHoc.KhoaHoc.MaGiangVien == maGiangVien);
        }

        public async Task<bool> KiemTraBaiTapThuocGiangVienAsync(int maBaiTap, int maGiangVien)
        {
            return await _context.BaiTaps
                .AnyAsync(bt => bt.MaBaiTap == maBaiTap && bt.BaiHoc.ChuongHoc.KhoaHoc.MaGiangVien == maGiangVien);
        }

        public async Task<object?> LayChiTietBaiTapAsync(int maBaiTap, int maGiangVien)
        {
            var chiTietQuiz = await _context.BaiTap_Quizs
                .Where(q => q.MaBaiTap == maBaiTap && q.BaiTap.BaiHoc.ChuongHoc.KhoaHoc.MaGiangVien == maGiangVien)
                .Select(q => new
                {
                    q.MaBaiTap,
                    q.ThoiGianLamBai,
                    q.DiemCanDat,
                    q.ChoPhepLamLai,
                    q.DaoCauHoi,
                    duLieuCauHoiJSON = q.DuLieuCauHoi
                })
                .FirstOrDefaultAsync();

            return chiTietQuiz;
        }
    }
}
