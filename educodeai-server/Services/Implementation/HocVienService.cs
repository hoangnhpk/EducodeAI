using educodeai_server.Data;
using educodeai_server.DTOs.NguoiDung;
using educodeai_server.Models;
using educodeai_server.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Services.Implementation
{
    public class HocVienService : IHocVienService
    {
        private readonly EduCodeAIDbContext _context;
        private readonly IWebHostEnvironment _env;

        public HocVienService(
            EduCodeAIDbContext context,
            IWebHostEnvironment env
        )
        {
            _context = context;
            _env = env;
        }

        // ================== GET ==================
        public HoSoHocVienDTO GetHoSoHocVien(int maNguoiDung)
        {
            var hocVien = _context.NguoiDungs
                .FirstOrDefault(x => x.MaNguoiDung == maNguoiDung);

            if (hocVien == null)
                throw new Exception("Không tìm thấy học viên");

            var dangKy = _context.DangKyKhoaHocs
                .Where(x => x.MaNguoiDung == maNguoiDung)
                .ToList();

            int tongKhoaHoc = dangKy.Count;
            int daHoanThanh = dangKy.Count(x => x.TrangThai == "HoanThanh");
            int dangHoc = dangKy.Count(x => x.TrangThai == "DangHoc");

            int chungChi = daHoanThanh;
            int gioDaHoc = daHoanThanh * 10;

            int tyLeHoanThanh = tongKhoaHoc == 0
                ? 0
                : (int)((double)daHoanThanh / tongKhoaHoc * 100);

            return new HoSoHocVienDTO
            {
                HoTen = hocVien.HoTen ?? "",
                Email = hocVien.Email ?? "",
                VaiTro = hocVien.VaiTro,
                AnhDaiDien = hocVien.AnhDaiDien,

                TongKhoaHoc = tongKhoaHoc,
                DaHoanThanh = daHoanThanh,
                DangHoc = dangHoc,
                ChungChi = chungChi,
                GioDaHoc = gioDaHoc,
                TyLeHoanThanh = tyLeHoanThanh
            };
        }

        // ================== UPDATE PROFILE ==================
        public async Task<HoSoHocVienDTO> UpdateHoSoHocVien(
            int maNguoiDung,
            UpdateHoSoHocVienDTO dto
        )
        {
            var hocVien = await _context.NguoiDungs
                .FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiDung);

            if (hocVien == null)
                throw new Exception("Không tìm thấy học viên");

            hocVien.HoTen = dto.HoTen;

            if (dto.AnhDaiDien != null)
            {
                var uploadPath = Path.Combine(
                    _env.WebRootPath,
                    "uploads",
                    "avatars"
                );

                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                var fileName =
                    Guid.NewGuid() + Path.GetExtension(dto.AnhDaiDien.FileName);

                var filePath = Path.Combine(uploadPath, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await dto.AnhDaiDien.CopyToAsync(stream);

                hocVien.AnhDaiDien = $"/uploads/avatars/{fileName}";
            }

            await _context.SaveChangesAsync();

            return GetHoSoHocVien(maNguoiDung);
        }

        // ================== ĐỔI MẬT KHẨU ==================
        public async Task<(bool IsSuccess, string Message)> DoiMatKhauAsync(
            int maNguoiDung,
            DoiMatKhauDTO dto
        )
        {
            var user = await _context.NguoiDungs
                .FirstOrDefaultAsync(x => x.MaNguoiDung == maNguoiDung);

            if (user == null)
                return (false, "Người dùng không tồn tại");

            // kiểm tra mật khẩu cũ
            if (!BCrypt.Net.BCrypt.Verify(dto.MatKhauCu, user.MatKhau))
                return (false, "Mật khẩu hiện tại không đúng");

            // kiểm tra xác nhận
            if (dto.MatKhauMoi != dto.XacNhanMatKhauMoi)
                return (false, "Xác nhận mật khẩu không khớp");

            // hash mật khẩu mới
            user.MatKhau = BCrypt.Net.BCrypt.HashPassword(dto.MatKhauMoi);

            await _context.SaveChangesAsync();

            return (true, "Đổi mật khẩu thành công");
        }
    }
}
