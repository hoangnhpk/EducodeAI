using educodeai_server.Data;
using educodeai_server.DTOs.QuanTriVien;
using educodeai_server.Helpers;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace educodeai_server.Services.Implementation
{
    public class QuanLyDanhGiaService : IQuanLyDanhGiaService
    {
        private readonly EduCodeAIDbContext _context;
        private readonly IGeminiAIService _gemini;

        public QuanLyDanhGiaService(EduCodeAIDbContext context, IGeminiAIService gemini)
        {
            _context = context;
            _gemini = gemini;
        }

        public async Task<ThongKeDanhGiaAdminDTO> LayThongKeAsync(int? maKhoaHoc = null)
        {
            var query = _context.DanhGias.AsNoTracking().AsQueryable();

            if (maKhoaHoc.HasValue && maKhoaHoc.Value > 0)
            {
                query = query.Where(x => x.MaKhoaHoc == maKhoaHoc.Value);
            }

            var danhSach = await query
                .Select(x => new { x.SoSao, TrangThai = x.TrangThai ?? "DaDuyet" })
                .ToListAsync();

            var tongDanhGia = danhSach.Count;

            return new ThongKeDanhGiaAdminDTO
            {
                TongDanhGia = tongDanhGia,
                ChoDuyet = danhSach.Count(x => x.TrangThai == "ChoDuyet"),
                DaDuyet = danhSach.Count(x => x.TrangThai == "DaDuyet"),
                TuChoi = danhSach.Count(x => x.TrangThai == "TuChoi"),
                DanhGiaTrungBinh = tongDanhGia > 0 ? Math.Round(danhSach.Average(x => x.SoSao), 1) : 0,
                PhanBoSao = new PhanBoSaoDTO
                {
                    Star1 = danhSach.Count(x => x.SoSao == 1),
                    Star2 = danhSach.Count(x => x.SoSao == 2),
                    Star3 = danhSach.Count(x => x.SoSao == 3),
                    Star4 = danhSach.Count(x => x.SoSao == 4),
                    Star5 = danhSach.Count(x => x.SoSao == 5)
                }
            };
        }

        public async Task<PagedResultDTO<DanhGiaAdminItemDTO>> LayDanhSachAsync(DanhGiaAdminFilterDTO filter)
        {
            var page = filter.Page <= 0 ? 1 : filter.Page;
            var pageSize = filter.PageSize <= 0 ? 10 : Math.Min(filter.PageSize, 100);

            var query = _context.DanhGias
                .AsNoTracking()
                .Include(x => x.NguoiDung)
                .Include(x => x.KhoaHoc)
                    .ThenInclude(x => x.GiangVien)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.TrangThai) && filter.TrangThai != "TatCa")
            {
                query = query.Where(x => (x.TrangThai ?? "DaDuyet") == filter.TrangThai);
            }

            if (filter.SoSao.HasValue && filter.SoSao.Value >= 1 && filter.SoSao.Value <= 5)
            {
                query = query.Where(x => x.SoSao == filter.SoSao.Value);
            }

            if (filter.MaKhoaHoc.HasValue && filter.MaKhoaHoc.Value > 0)
            {
                query = query.Where(x => x.MaKhoaHoc == filter.MaKhoaHoc.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var keyword = filter.Search.Trim().ToLower();
                query = query.Where(x =>
                    (x.NhanXet ?? string.Empty).ToLower().Contains(keyword) ||
                    (x.NguoiDung.HoTen ?? string.Empty).ToLower().Contains(keyword) ||
                    (x.NguoiDung.Email ?? string.Empty).ToLower().Contains(keyword) ||
                    x.KhoaHoc.TenKhoaHoc.ToLower().Contains(keyword));
            }

            var total = await query.CountAsync();

            var data = await query
                .OrderByDescending(x => x.NgayDanhGia)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new DanhGiaAdminItemDTO
                {
                    Id = x.MaDanhGia,
                    MaNguoiDung = x.MaNguoiDung,
                    MaKhoaHoc = x.MaKhoaHoc,
                    NguoiDung = new DanhGiaAdminNguoiDungDTO
                    {
                        Id = x.MaNguoiDung,
                        Ten = x.NguoiDung.HoTen ?? "Hoc vien",
                        Email = x.NguoiDung.Email,
                        Avatar = x.NguoiDung.AnhDaiDien
                    },
                    KhoaHoc = new DanhGiaAdminKhoaHocDTO
                    {
                        Id = x.MaKhoaHoc,
                        TenKhoaHoc = x.KhoaHoc.TenKhoaHoc,
                        GiangVien = x.KhoaHoc.GiangVien.HoTen
                    },
                    SoSao = x.SoSao,
                    NoiDung = x.NhanXet ?? string.Empty,
                    NgayTao = x.NgayDanhGia,
                    TrangThai = x.TrangThai ?? "DaDuyet"
                })
                .ToListAsync();

            return new PagedResultDTO<DanhGiaAdminItemDTO>
            {
                Data = data,
                Total = total,
                Page = page,
                PageSize = pageSize,
                TotalPages = Math.Max(1, (int)Math.Ceiling((double)total / pageSize))
            };
        }

        /// <summary>
        /// Lấy tất cả review đang Chờ Duyệt → gửi cho Gemini phân tích → cập nhật tự động.
        /// Gemini sẽ trả về JSON: [{"id": 1, "ketQua": "DaDuyet", "lyDo": "..."}]
        /// </summary>
        public async Task<KetQuaAIDuyetDTO> DuyetHangLoatBangAIAsync()
        {
            // 1. Lấy tối đa 20 review mỗi lần
            var danhSachChoDuyet = await _context.DanhGias
                .AsNoTracking()
                .Where(x => x.TrangThai == "ChoDuyet")
                .OrderBy(x => x.NgayDanhGia)
                .Take(20)
                .Select(x => new
                {
                    x.MaDanhGia,
                    x.NhanXet,
                    x.SoSao,
                    TenNguoiDung = x.NguoiDung.HoTen,
                    TenKhoaHoc = x.KhoaHoc.TenKhoaHoc
                })
                .ToListAsync();

            if (danhSachChoDuyet.Count == 0)
                return new KetQuaAIDuyetDTO();

            // 2. Xây dựng prompt chặt hơn, có ngữ cảnh tối thiểu
            var payload = danhSachChoDuyet.Select(x => new
            {
                id = x.MaDanhGia,
                soSao = x.SoSao,
                nguoiDung = x.TenNguoiDung,
                khoaHoc = x.TenKhoaHoc,
                noiDung = x.NhanXet
            }).ToList();

            var inputJson = JsonSerializer.Serialize(payload);

            string prompt = """
You are a strict content moderator for Vietnamese course reviews.
Decide ONLY between "DaDuyet" and "TuChoi".

Reject if the review contains: profanity, harassment, spam, ads, hate, violence, sexual content, personal data exposure, or is clearly off-topic.
If unclear but not harmful, approve.

Return ONLY valid JSON array with the exact input ids.
Schema:
[{"id":123,"ketQua":"DaDuyet","lyDo":"short reason"}]

Input:
{0}
""";
            prompt = string.Format(prompt, inputJson);

            string rawResponse;
            try
            {
                rawResponse = await _gemini.GenerateAsync(prompt);
    