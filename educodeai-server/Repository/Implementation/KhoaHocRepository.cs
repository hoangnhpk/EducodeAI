using Microsoft.EntityFrameworkCore;
using educodeai_server.Repository.Interface;
using educodeai_server.Data;
using educodeai_server.Models;
using educodeai_server.DTOs.AI;
using educodeai_server.DTOs.KhoaHoc;
using System.Text.Json;

namespace educodeai_server.Repository.Implementation
{
    public class KhoaHocRepository : IKhoaHocRepository
    {
        private readonly EduCodeAIDbContext _context;

        public KhoaHocRepository(EduCodeAIDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách cho trang chủ
        public async Task<IEnumerable<KhoaHocDto>> GetAllKhoaHocsAsync()
        {
            return await _context.KhoaHocs
                .AsNoTracking()
                .Where(kh => kh.TrangThai == "Hoạt động")
                .Select(kh => new KhoaHocDto
                {
                    MaKhoaHoc = kh.MaKhoaHoc,
                    TenKhoaHoc = kh.TenKhoaHoc,
                    HinhAnh = kh.HinhAnh,
                    LinhVuc = kh.LinhVuc,
                    DiemDanhGiaTB = kh.DiemDanhGiaTB,
                    ThoiLuongGio = kh.ThoiLuongGio,
                    TrinhDo = kh.TrinhDo,
                    KyNangChinh = kh.KyNangChinh
                })
                .ToListAsync();
        }

        // 2. LẤY CHI TIẾT KHÓA HỌC (HÀM BẠN ĐANG THIẾU)
        public async Task<KhoaHocModel?> GetKhoaHocWithDetailsAsync(int maKhoaHoc)
        {
            return await _context.KhoaHocs
                .Include(k => k.DangKyKhoaHocs)
                    .ThenInclude(d => d.NguoiDung)
                .FirstOrDefaultAsync(k => k.MaKhoaHoc == maKhoaHoc);
        }

        // 3. Lấy danh sách khóa học theo giảng viên
        public async Task<List<KhoaHocModel>> GetKhoaHocsByGiangVienAsync(int maGiangVien)
        {
            return await _context.KhoaHocs
                .Include(k => k.DangKyKhoaHocs)
                .Where(k => k.MaGiangVien == maGiangVien)
                .OrderByDescending(k => k.NgayTao)
                .ToListAsync();
        }

        // 4. Lấy nội dung khóa học (Chuương, bài học) cho học viên học
        public async Task<KhoaHoc_NoiDungKhoaHocDTO?> GetNoiDungKhoaHocAsync(int maKhoaHoc, int maNguoiDung)
        {
            return await _context.KhoaHocs
                .AsNoTracking()
                .Where(kh => kh.MaKhoaHoc == maKhoaHoc)
                .Select(kh => new KhoaHoc_NoiDungKhoaHocDTO
                {
                    MaKhoaHoc = kh.MaKhoaHoc,
                    TenKhoaHoc = kh.TenKhoaHoc,
                    Slug = SlugHelper.Generate(kh.TenKhoaHoc),
                    DanhSachChuongHoc = kh.ChuongHocs
                        .OrderBy(ch => ch.ThuTu)
                        .Select(ch => new ChuongHoc_NoiDungKhoaHocDTO
                        {
                            Id = ch.MaChuong,
                            TieuDe = ch.TenChuong,
                            ThuTu = ch.ThuTu,
                            DanhSachBaiHoc = ch.BaiHocs
                                .OrderBy(bh => bh.ThuTu)
                                .Select(bh => new BaiHoc_NoiDungKhoaHocDTO
                                {
                                    Id = bh.MaBaiHoc,
                                    TieuDe = bh.TieuDe,
                                    LoaiBaiHoc = bh.LoaiBaiHoc,
                                    NoiDung = bh.NoiDung,
                                    ThoiLuong = bh.ThoiLuong,
                                    ThuTu = bh.ThuTu,
                                    LinkVideo = bh.LinkVideo,
                                    DaXem = bh.TienDoBaiHocs.Any(td => td.MaNguoiDung == maNguoiDung && td.DaXem),
                                    ThongTinQuiz = bh.BaiTaps
                                        .Where(bt => bt.BaiTap_Quiz != null)
                                        .Select(bt => new BaiTapQuizDTO
                                        {
                                            MaBaiTapQuiz = bt.BaiTap_Quiz.MaBaiTapQuiz,
                                            MaBaiTap = bt.MaBaiTap,
                                            ThoiGianLamBai = bt.BaiTap_Quiz.ThoiGianLamBai,
                                            DiemCanDat = bt.BaiTap_Quiz.DiemCanDat,
                                            ChoPhepLamLai = bt.BaiTap_Quiz.ChoPhepLamLai,
                                            DaoCauHoi = bt.BaiTap_Quiz.DaoCauHoi,
                                            DuLieuCauHoiJSON = bt.BaiTap_Quiz.DuLieuCauHoi
                                        }).FirstOrDefault()
                                }).ToList()
                        }).ToList()
                }).FirstOrDefaultAsync();
        }

        // 5. Các hàm hỗ trợ AI
        public async Task<List<KhoaHocAISnapshotDto>> GetKhoaHocPhuHopAsync(CreateLoTrinhAIDto dto)
        {
            var query = _context.KhoaHocs.Where(x => x.TrangThai == "Hoạt động");
            if (!string.IsNullOrEmpty(dto.TrinhDoHienTai))
            {
                query = query.Where(x => x.TrinhDo.Contains(dto.TrinhDoHienTai) || dto.TrinhDoHienTai.Contains(x.TrinhDo));
            }
            return await query.Select(x => new KhoaHocAISnapshotDto { MaKhoaHoc = x.MaKhoaHoc, TenKhoaHoc = x.TenKhoaHoc, TrinhDo = x.TrinhDo, LinhVuc = x.LinhVuc, KyNangChinh = x.KyNangChinh, ThoiLuongGio = x.ThoiLuongGio }).ToListAsync();
        }

        public async Task<List<KhoaHocAISnapshotDto>> GetKhoaHocTheoKeywordAsync(List<string> keywords)
        {
            var query = _context.KhoaHocs.Where(x => x.TrangThai == "Hoạt động");
            if (keywords.Any())
            {
                query = query.Where(kh => keywords.Any(k => kh.TenKhoaHoc.ToLower().Contains(k) || kh.LinhVuc.ToLower().Contains(k)));
            }
            return await query.Select(x => new KhoaHocAISnapshotDto { MaKhoaHoc = x.MaKhoaHoc, TenKhoaHoc = x.TenKhoaHoc, TrinhDo = x.TrinhDo, LinhVuc = x.LinhVuc, KyNangChinh = x.KyNangChinh, ThoiLuongGio = x.ThoiLuongGio }).ToListAsync();
        }

        // 6. Lưu tiến độ, ghi chú, kết quả bài tập
        public async Task<bool> LuuTienDoBaiHoc(TienDoBaiHocDTO dto) { /* ... code cũ của bạn ... */ return true; }
        public async Task<bool> LuuGhiChuBaiHoc(GhiChuBaiHocDTO dto) { /* ... code cũ của bạn ... */ return true; }
        public async Task<List<GhiChuBaiHocDTO>> GetGhiChuBaiHocAsync(int maBaiHoc, int maNguoiDung) { return new List<GhiChuBaiHocDTO>(); }
        public async Task<bool> LuuKetQuaBaiTap(KetQuaQuizSubmitDTO dto) { return true; }
    }
}