using educodeai_server.Common;
using educodeai_server.Data;
using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class QuanLyHocVienService : IQuanLyHocVienService
    {
        private readonly EduCodeAIDbContext _context;

        public QuanLyHocVienService(EduCodeAIDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<ChiTietHocVienDTO>> LayDanhSachHocVienAsync(HocVienFilterDTO filter)
        {
            var query = _context.NguoiDungs.Where(x => x.VaiTro == 2).AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Keyword))
            {
                string searchTxt = filter.Keyword.ToLower().Trim();
                query = query.Where(x =>
                    x.MaNguoiDung.ToString() == searchTxt ||
                    (x.HoTen != null && x.HoTen.ToLower().Contains(searchTxt)) ||
                    (x.Email != null && x.Email.ToLower().Contains(searchTxt))
                );
            }

            if (!string.IsNullOrWhiteSpace(filter.TrangThai))
            {
                query = query.Where(x => x.TrangThai == filter.TrangThai);
            }

            int totalRow = await query.CountAsync();

            query = filter.SortBy switch
            {
                "Ten_Asc" => query.OrderBy(x => x.HoTen),
                "Ten_Desc" => query.OrderByDescending(x => x.HoTen),
                "NgayTao_Asc" => query.OrderBy(x => x.NgayThamGia),
                _ => query.OrderByDescending(x => x.NgayThamGia)
            };

            var data = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(x => new ChiTietHocVienDTO
                {
                    MaNguoiDung = x.MaNguoiDung,
                    HoTen = x.HoTen ?? "",
                    Email = x.Email ?? "",
                    AnhDaiDien = x.AnhDaiDien,
                    TrangThai = x.TrangThai ?? "Hoạt động",
                    NgayThamGia = x.NgayThamGia,
                    LyDoKhoa = x.LyDoKhoa
                })
                .ToListAsync();

            return new PagedResult<ChiTietHocVienDTO> { Total = totalRow, Data = data };
        }

        public async Task<bool> ThemHocVienAsync(ThemNguoiDungDTO dto)
        {
            // 1. KIỂM TRA TRÙNG EMAIL TRƯỚC KHI THÊM
            bool emailTonTai = await _context.NguoiDungs.AnyAsync(x => x.Email == dto.Email);
            if (emailTonTai)
            {
                // Nếu email đã có trong DB thì dừng luôn, trả về false
                return false;
            }

            // 2. NẾU CHƯA TRÙNG THÌ MỚI LƯU VÀO DB
            var hv = new NguoiDungModel
            {
                HoTen = dto.HoTen,
                Email = dto.Email,
                TaiKhoan = dto.Email ?? "user" + DateTime.Now.Ticks,
                MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.MatKhau ?? "123456"),
                VaiTro = 2,
                TrangThai = "Hoạt động",
                NgayThamGia = DateTime.Now

            };

            _context.NguoiDungs.Add(hv);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> SuaHocVienAsync(int id, CapNhatNguoiDungDTO dto)
        {
            var hv = await _context.NguoiDungs.FirstOrDefaultAsync(x => x.MaNguoiDung == id && x.VaiTro == 2);
            if (hv == null) return false;

            if (dto.Email != hv.Email && await _context.NguoiDungs.AnyAsync(x => x.Email == dto.Email)) return false;

            hv.HoTen = dto.HoTen ?? hv.HoTen;
            hv.Email = dto.Email ?? hv.Email;

            if (!string.IsNullOrEmpty(dto.MatKhauMoi))
                hv.MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.MatKhauMoi);

           
            if (!string.IsNullOrEmpty(dto.TrangThai))
            {
                hv.TrangThai = dto.TrangThai;
            }

            hv.LyDoKhoa = dto.LyDoKhoa;

            _context.NguoiDungs.Update(hv);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> XoaHocVienAsync(int id)
        {
            var hv = await _context.NguoiDungs.FirstOrDefaultAsync(x => x.MaNguoiDung == id && x.VaiTro == 2);
            if (hv == null) return false;

            _context.NguoiDungs.Remove(hv);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}