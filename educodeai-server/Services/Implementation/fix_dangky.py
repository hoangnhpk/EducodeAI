import re

with open('XacThucService.cs', 'r', encoding='utf-8') as f:
    content = f.read()

# Tìm vị trí hàm DangKyGiangVienAsync
start_marker = '        public async Task<object> DangKyGiangVienAsync(DangKyGiangVienRequest request)'
start_idx = content.find(start_marker)
if start_idx == -1:
    print("Function not found")
    exit(1)

# Tìm vị trí hàm tiếp theo (để biết điểm kết thúc)
next_func_marker = '\n        private static async Task<string> LuuFileAsync'
end_idx = content.find(next_func_marker, start_idx)
if end_idx == -1:
    end_idx = len(content)

# Code mới cho hàm
new_function = '''        public async Task<object> DangKyGiangVienAsync(DangKyGiangVienRequest request)
        {
            var email = request.Email.Trim().ToLower();
            var taiKhoan = request.TaiKhoan.Trim();

            // Kiểm tra trùng trong hồ sơ đang chờ
            if (await _context.HoSoDangKyGiangViens.AnyAsync(x => x.Email == email && x.TrangThaiHoSo == "ChoDuyet"))
                throw new Exception("Email này đang chờ duyệt.");

            if (await _context.HoSoDangKyGiangViens.AnyAsync(x => x.SoGiayTo == request.SoGiayTo.Trim() && x.TrangThaiHoSo == "ChoDuyet"))
                throw new Exception("Số giấy tờ này đang chờ duyệt.");

            // Lưu file upload
            var uploadRoot = Path.Combine(_env.WebRootPath, "uploads", "dang-ky-giang-vien");
            var avatarRoot = Path.Combine(uploadRoot, "avatars");
            var docRoot = Path.Combine(uploadRoot, "giay-to");
            Directory.CreateDirectory(avatarRoot);
            Directory.CreateDirectory(docRoot);

            string? avatarPath = null;
            if (request.AnhDaiDien != null && request.AnhDaiDien.Length > 0)
            {
                avatarPath = await LuuFileAsync(request.AnhDaiDien, avatarRoot, "/uploads/dang-ky-giang-vien/avatars");
            }

            var frontPath = await LuuFileAsync(request.AnhGiayToMatTruoc, docRoot, "/uploads/dang-ky-giang-vien/giay-to");
            var backPath = await LuuFileAsync(request.AnhGiayToMatSau, docRoot, "/uploads/dang-ky-giang-vien/giay-to");

            // Tạo hồ sơ đăng ký
            var hoSo = new HoSoDangKyGiangVienModel
            {
                MaNguoiDung = 0, // Chưa có user - sẽ tạo khi admin duyệt
                HoTen = request.HoTen.Trim(),
                Email = email,
                SoDienThoai = request.SoDienThoai?.Trim(),
                LinhVucGiangDay = request.LinhVucGiangDay.Trim(),
                TieuSu = request.TieuSu.Trim(),
                LinkedInUrl = request.LinkedInUrl?.Trim(),
                WebsiteUrl = request.WebsiteUrl?.Trim(),
                LoaiGiayTo = request.LoaiGiayTo.Trim(),
                SoGiayTo = request.SoGiayTo.Trim(),
                AnhDaiDienUrl = avatarPath,
                AnhGiayToMatTruocUrl = frontPath,
                AnhGiayToMatSauUrl = backPath,
                PhuongThucThanhToan = request.PhuongThucThanhToan.Trim(),
                TenNganHang = request.TenNganHang?.Trim(),
                SoTaiKhoanNhanTien = request.SoTaiKhoanNhanTien?.Trim(),
                TenChuTaiKhoan = request.TenChuTaiKhoan?.Trim(),
                MaSoThue = request.MaSoThue?.Trim(),
                TrangThaiHoSo = "ChoDuyet",
                NgayTao = DateTime.UtcNow,
                NgayCapNhat = DateTime.UtcNow
            };

            _context.HoSoDangKyGiangViens.Add(hoSo);
            await _context.SaveChangesAsync();

            return new
            {
                success = true,
                message = "Hồ sơ giảng viên đã được gửi và đang chờ duyệt.",
                maHoSo = hoSo.MaHoSoDangKyGiangVien,
                trangThai = hoSo.TrangThaiHoSo
            };
        }

'''

# Thay thế
new_content = content[:start_idx] + new_function + content[end_idx:]

with open('XacThucService.cs', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Rewrote DangKyGiangVienAsync function')
