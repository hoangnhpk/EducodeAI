import re

with open('Services/Implementation/XacThucService.cs', 'r', encoding='utf-8') as f:
    content = f.read()

# Tìm và thay thế phần transaction
old_code = '''await using var transaction = await _context.Database.BeginTransactionAsync();

            var user = new NguoiDungModel'''

new_code = '''var executionStrategy = _context.Database.CreateExecutionStrategy();
            return await executionStrategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();

                var user = new NguoiDungModel'''

content = content.replace(old_code, new_code)

# Tìm và sửa phần commit
old_commit = '''await transaction.CommitAsync();

            return new
            {
                success = true,
                message = "Hồ sơ giảng viên đã được gửi và đang chờ duyệt.",
                maNguoiDung = user.MaNguoiDung,
                maHoSo = hoSo.MaHoSoDangKyGiangVien,
                trangThai = hoSo.TrangThaiHoSo
            };
        }

        private static async Task<string> LuuFileAsync'''

new_commit = '''await transaction.CommitAsync();

                return new
                {
                    success = true,
                    message = "Hồ sơ giảng viên đã được gửi và đang chờ duyệt.",
                    maNguoiDung = user.MaNguoiDung,
                    maHoSo = hoSo.MaHoSoDangKyGiangVien,
                    trangThai = hoSo.TrangThaiHoSo
                };
            });
        }

        private static async Task<string> LuuFileAsync'''

content = content.replace(old_commit, new_commit)

# Sửa indent cho các dòng giữa
lines = content.split('\n')
start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if 'var executionStrategy' in line:
        start_idx = i + 2  # Dòng sau ExecuteAsync
    if start_idx and 'await transaction.CommitAsync()' in line:
        end_idx = i
        break

if start_idx and end_idx:
    for i in range(start_idx, end_idx):
        if lines[i].strip() and not lines[i].strip().startswith('}'):
            lines[i] = '    ' + lines[i]

content = '\n'.join(lines)

with open('Services/Implementation/XacThucService.cs', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed transaction in XacThucService.cs')
